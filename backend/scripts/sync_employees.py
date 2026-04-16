import paramiko
import mysql.connector
from mysql.connector import Error
import sys
import bcrypt

def get_remote_employees():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('167.86.118.96', username='root', password='Saroobidy10289#')

    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/PresenceArisV2 && sqlite3 presence.db "SELECT id, badge_id, nom, prenom, poste, departement, email, adresse, telephone, date_naissance, date_embauche, categorie, cin, num_cnaps, photo FROM employees"'
    )
    
    employees = []
    for line in stdout.read().decode().strip().split('\n'):
        if line:
            parts = line.split('|')
            if len(parts) >= 15:
                date_embauche = parts[10] if parts[10] else None
                if date_embauche:
                    try:
                        parts_embauche = date_embauche.split('/')
                        if len(parts_embauche) == 3:
                            date_embauche = f"{parts_embauche[2]}-{parts_embauche[1]}-{parts_embauche[0]}"
                    except:
                        pass
                
                date_naissance = parts[9] if parts[9] else None
                if date_naissance:
                    try:
                        parts_naissance = date_naissance.split('/')
                        if len(parts_naissance) == 3:
                            date_naissance = f"{parts_naissance[2]}-{parts_naissance[1]}-{parts_naissance[0]}"
                    except:
                        pass
                
                photo = parts[14] if parts[14] else None
                
                employees.append({
                    'id': parts[0],
                    'badge_id': parts[1],
                    'nom': parts[2],
                    'prenom': parts[3],
                    'poste': parts[4] or None,
                    'departement': parts[5] or None,
                    'email': parts[6] or None,
                    'adresse': parts[7] or None,
                    'telephone': parts[8] or None,
                    'date_naissance': date_naissance,
                    'date_embauche': date_embauche,
                    'categorie': parts[11] or None,
                    'cin': parts[12] or None,
                    'num_cnaps': parts[13] or None,
                    'photo': photo
                })
    
    client.close()
    return employees

def sync_to_local(employees):
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='0008',
            database='gestion_employes'
        )
        cursor = conn.cursor()

        synced = 0
        updated = 0
        
        for emp in employees:
            badge_id = emp['badge_id']
            nom = emp['nom']
            prenom = emp['prenom']
            email = emp['email'] if emp['email'] else f"{prenom.lower()}.{nom.lower().replace(' ', '.')}@aris-cc.com"
            poste = emp['poste']
            departement = emp['departement']
            telephone = emp['telephone']
            adresse = emp['adresse']
            date_embauche = emp['date_embauche']
            date_naissance = emp['date_naissance']
            categorie = emp['categorie']
            cin = emp['cin']
            num_cnaps = emp['num_cnaps']
            photo = emp['photo']

            cursor.execute('SELECT id FROM employes WHERE matricule = %s', (badge_id,))
            existing = cursor.fetchone()

            if existing:
                hashed_password = bcrypt.hashpw('aris2026'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cursor.execute('''
                    UPDATE employes SET 
                        nom = %s, prenom = %s, email = %s, poste = %s, 
                        departement = %s, telephone = %s, adresse = %s,
                        date_embauche = %s, date_naissance = %s, 
                        categorie = %s, cin = %s, num_cnaps = %s,
                        mot_de_passe = %s, photo = %s
                    WHERE matricule = %s
                ''', (nom, prenom, email, poste, departement, telephone, adresse,
                      date_embauche, date_naissance, categorie, cin, num_cnaps, hashed_password, photo, badge_id))
                updated += 1
            else:
                hashed_password = bcrypt.hashpw('aris2026'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cursor.execute('''
                    INSERT INTO employes (matricule, nom, prenom, email, mot_de_passe, poste, departement, telephone, adresse, date_embauche, date_naissance, categorie, cin, num_cnaps, photo, role)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (badge_id, nom, prenom, email, hashed_password, poste, departement, telephone, adresse,
                      date_embauche, date_naissance, categorie, cin, num_cnaps, photo, 'employe'))
                synced += 1

        conn.commit()
        cursor.close()
        conn.close()
        
        return synced, updated
        
    except Error as e:
        print(f"Erreur MySQL: {e}")
        sys.exit(1)

def main():
    print("=== Synchronisation des employés ===")
    print("1. Connexion au serveur distant...")
    
    employees = get_remote_employees()
    print(f"   {len(employees)} employé(s) trouvé(s) sur PresenceArisV2")
    
    print("2. Synchronisation avec la base locale...")
    synced, updated = sync_to_local(employees)
    
    print(f"   {synced} nouvel(aux) employé(s) ajouté(s)")
    print(f"   {updated} employé(s) mis à jour(s)")
    print("\n=== Synchronisation terminée ===")

if __name__ == '__main__':
    main()
