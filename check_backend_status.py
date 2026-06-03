import paramiko
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('167.86.118.96', username='root', password='Saroobidy10289#', timeout=10)
    
    commands = [
        'ps aux | grep "node" | grep -v grep',
        'netstat -tlnp | grep 3002 || ss -tlnp | grep 3002',
        'cd /root/backend && pm2 list 2>&1 || echo "pm2 non installé"',
        'curl -s https://apiv2.aris-cc.com/api/ 2>&1 | head -10',
        'curl -s http://127.0.0.1:3002/ 2>&1 | head -10'
    ]
    
    for cmd in commands:
        stdin, stdout, stderr = ssh.exec_command(cmd)
        output = stdout.read().decode()
        error = stderr.read().decode()
        print(f"\n=== {cmd} ===")
        print(output)
        if error and "pm2 non installé" not in output:
            print(f"Error: {error}")
    
    ssh.close()
except Exception as e:
    print(f"Erreur: {e}")
    sys.exit(1)
