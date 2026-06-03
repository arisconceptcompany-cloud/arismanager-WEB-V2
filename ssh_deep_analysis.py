import paramiko
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('167.86.118.96', username='root', password='Saroobidy10289#', timeout=10)
    
    commands = [
        'cd /root/backend && tree src -I node_modules 2>/dev/null || find src -type f | head -30',
        'cd /root/backend && cat src/index.js | head -50',
        'cd /root/backend && ls -la src/',
        'cd /root/backend && cat server.log | tail -30'
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
