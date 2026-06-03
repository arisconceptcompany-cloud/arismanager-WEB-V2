import paramiko
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('167.86.118.96', username='root', password='Saroobidy10289#', timeout=10)
    
    commands = [
        'cat /etc/nginx/sites-enabled/apiv2.aris-cc.com',
        'curl -s https://apiv2.aris-cc.com/ 2>&1 | head -20 || curl -s http://apiv2.aris-cc.com/ 2>&1 | head -20',
        'systemctl status backend 2>&1 | head -10 || ps aux | grep "node.*src/index.js" | grep -v grep'
    ]
    
    for cmd in commands:
        stdin, stdout, stderr = ssh.exec_command(cmd)
        output = stdout.read().decode()
        error = stderr.read().decode()
        print(f"\n=== {cmd} ===")
        print(output)
        if error:
            print(f"Error: {error}")
    
    ssh.close()
except Exception as e:
    print(f"Erreur: {e}")
    sys.exit(1)
