import paramiko
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('167.86.118.96', username='root', password='Saroobidy10289#', timeout=10)
    
    commands = [
        'cd /root/backend && grep -r "router.get\|router.post\|app.get\|app.post" src/routes/ | head -30',
        'cd /root/backend && cat src/routes/auth.js | head -40',
        'curl -s https://apiv2.aris-cc.com/api/auth/login -X POST -H "Content-Type: application/json" -d \'{"email":"test","password":"test"}\' 2>&1 | head -10'
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
