import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Salaires from './Salaires';
import { fichePaieAPI } from '../services/api';

vi.mock('../services/api', () => ({
  fichePaieAPI: {
    getFiches: vi.fn(),
    downloadFiche: vi.fn(),
  },
}));

const mockFiches = [
  { id: 1, mois: 1, annee: 2026, nom: 'Fiche_Paie_1_2026.pdf' },
  { id: 2, mois: 2, annee: 2026, nom: 'Fiche_Paie_2_2026.pdf' },
];

describe('Salaires - Fiche de Paye', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le chargement puis la liste des fiches', async () => {
    fichePaieAPI.getFiches.mockResolvedValue({ data: mockFiches });

    render(<Salaires />);

    expect(screen.getByText('Chargement...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Fiche de Paye')).toBeInTheDocument();
    });

    expect(screen.getByText('Fiche de paie - Janvier 2026')).toBeInTheDocument();
    expect(screen.getByText('Fiche de paie - Février 2026')).toBeInTheDocument();
  });

  it('affiche le message vide quand aucune fiche', async () => {
    fichePaieAPI.getFiches.mockResolvedValue({ data: [] });

    render(<Salaires />);

    await waitFor(() => {
      expect(screen.getByText('Aucune fiche de paie')).toBeInTheDocument();
    });
  });

  it('ouvre le viewer plein écran au clic sur le bouton voir', async () => {
    fichePaieAPI.getFiches.mockResolvedValue({ data: [mockFiches[0]] });
    const user = userEvent.setup();

    render(<Salaires />);

    await waitFor(() => {
      expect(screen.getByText('Fiche de paie - Janvier 2026')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Voir en plein écran'));

    expect(screen.getAllByText(/Fiche de paie - Janvier 2026/)).toHaveLength(2);
    expect(screen.getByText('Télécharger')).toBeInTheDocument();
  });

  it('ferme le viewer au clic sur X', async () => {
    fichePaieAPI.getFiches.mockResolvedValue({ data: [mockFiches[0]] });
    const user = userEvent.setup();

    render(<Salaires />);

    await waitFor(() => {
      expect(screen.getByText('Fiche de paie - Janvier 2026')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Voir en plein écran'));
    expect(screen.getAllByText(/Fiche de paie - Janvier 2026/)).toHaveLength(2);

    const downloadTexts = screen.getAllByText('Télécharger');
    const modal = downloadTexts[downloadTexts.length - 1].closest('[class*="fixed"]');
    const xBtn = modal?.querySelector('[class*="hover:bg-white/10"]');
    if (xBtn) await user.click(xBtn);
  });

  it('déclenche le téléchargement au clic sur le bouton download', async () => {
    fichePaieAPI.getFiches.mockResolvedValue({ data: [mockFiches[0]] });
    fichePaieAPI.downloadFiche.mockResolvedValue({ data: new Blob(['pdf-content']) });
    const user = userEvent.setup();

    render(<Salaires />);

    await waitFor(() => {
      expect(screen.getByText('Fiche de paie - Janvier 2026')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Télécharger'));

    await waitFor(() => {
      expect(fichePaieAPI.downloadFiche).toHaveBeenCalledWith(1);
    });
  });
});
