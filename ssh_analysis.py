import paramiko
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('167.86.118.96', username='root', password='Saroobidy10289#', timeout=10)
    
    commands = [
        'cd /root/backend && pwd',
        'cd /root/backend && ls -la',
        'cd /root/backend && find . -type f -name "*.py" | head -20',
        'cd /root/backend && cat package.json 2>/dev/null || cat requirements.txt 2>/dev/null || echo "No package.json or requirements.txt"'
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
