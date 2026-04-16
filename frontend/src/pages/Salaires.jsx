import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { salaireAPI } from '../services/api';

function Salaires() {
  const [salaires, setSalaires] = useState([]);
  const [salaireActuel, setSalaireActuel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [salairesRes, actuelRes] = await Promise.all([
        salaireAPI.getSalaires(),
        salaireAPI.getActuel()
      ]);
      setSalaires(salairesRes.data);
      setSalaireActuel(actuelRes.data);
    } catch (error) {
      console.error('Erreur chargement salaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (montant) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  const getMoisLabel = (mois) => ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][mois - 1] || '';

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><p className="text-white bg-black/50 px-4 py-2 rounded-lg">Chargement...</p></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mon Salaire</h1>
        <p className="text-white/70">Consultez vos bulletins de salaire</p>
      </div>

      {salaireActuel && (
        <div className="bg-gradient-to-r from-blue-600/80 to-blue-800/80 backdrop-blur-md rounded-2xl p-8 text-white mb-8 border border-white/20">
          <h3 className="text-lg opacity-90 mb-2">Salaire du {getMoisLabel(salaireActuel.mois)} {salaireActuel.annee}</h3>
          <div className="text-5xl font-bold mb-2">{formatMontant(salaireActuel.salaire_net)}</div>
          <p className="opacity-80">Net à payer</p>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <label className="text-sm opacity-80 block mb-1">Salaire de base</label>
              <span className="text-2xl font-semibold">{formatMontant(salaireActuel.salaire_base)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <label className="text-sm opacity-80 block mb-1">Primes</label>
              <span className="text-2xl font-semibold text-green-300">+{formatMontant(salaireActuel.primes)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <label className="text-sm opacity-80 block mb-1">Déductions</label>
              <span className="text-2xl font-semibold text-red-300">-{formatMontant(salaireActuel.deductions)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Wallet size={24} /> Historique des salaires</h2>
        </div>

        {salaires.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={64} className="mx-auto text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun bulletin de salaire</h3>
            <p className="text-white/60">Vos bulletins de salaire apparaîtront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Période</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Salaire de base</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Primes</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Déductions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Salaire net</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {salaires.map((salaire) => (
                  <tr key={salaire.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{getMoisLabel(salaire.mois)} {salaire.annee}</td>
                    <td className="px-6 py-4 text-sm text-white">{formatMontant(salaire.salaire_base)}</td>
                    <td className="px-6 py-4 text-sm text-green-400 flex items-center gap-1"><TrendingUp size={14} />{formatMontant(salaire.primes)}</td>
                    <td className="px-6 py-4 text-sm text-red-400 flex items-center gap-1"><TrendingDown size={14} />{formatMontant(salaire.deductions)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">{formatMontant(salaire.salaire_net)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${salaire.statut_paiement === 'paye' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {salaire.statut_paiement === 'paye' ? 'Payé' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Salaires;
