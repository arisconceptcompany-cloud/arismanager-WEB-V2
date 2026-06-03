import paramiko
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('167.86.118.96', username='root', password='Saroobidy10289#', timeout=10)
    
    commands = [
        'cd /root/backend && grep -r "apiv2.aris-cc.com" . 2>/dev/null || echo "URL non trouvée"',
        'cd /root/backend && grep -r "aris-cc.com" . 2>/dev/null | head -20',
        'cd /root/backend && cat src/config/db.js',
        'cd /root/backend && env | grep -i "aris\|api\|url" | head -10'
    ]
    
    for cmd in commands:
        stdin, stdout, stderr = ssh.exec_command(cmd)
        output = stdout.read().decode()
        error = stderr.read().decode()
        print(f"\n=== {cmd} ===")
        print(output)
        if error and "Aucun fichier" not in error:
            print(f"Error: {error}")
    
    ssh.close()
except Exception as e:
    print(f"Erreur: {e}")
    sys.exit(1)
