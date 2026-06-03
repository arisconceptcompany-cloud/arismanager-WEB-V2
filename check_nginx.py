import paramiko
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('167.86.118.96', username='root', password='Saroobidy10289#', timeout=10)
    
    commands = [
        'nginx -t 2>&1 && echo "Nginx installé" || echo "Nginx non installé"',
        'ls -la /etc/nginx/sites-available/ 2>/dev/null',
        'ls -la /etc/nginx/sites-enabled/ 2>/dev/null',
        'grep -r "apiv2.aris-cc.com" /etc/nginx/ 2>/dev/null || echo "Pas de config nginx pour apiv2"',
        'cat /etc/nginx/sites-enabled/default 2>/dev/null | head -50',
        'systemctl status nginx 2>&1 | head -10'
    ]
    
    for cmd in commands:
        stdin, stdout, stderr = ssh.exec_command(cmd)
        output = stdout.read().decode()
        error = stderr.read().decode()
        print(f"\n=== {cmd} ===")
        print(output)
        if error and "Aucun fichier" not in error and "Pas de config" not in output:
            print(f"Error: {error}")
    
    ssh.close()
except Exception as e:
    print(f"Erreur: {e}")
    sys.exit(1)
