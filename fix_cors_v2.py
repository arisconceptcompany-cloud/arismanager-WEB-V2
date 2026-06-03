import paramiko
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('167.86.118.96', username='root', password='Saroobidy10289#', timeout=10)
    
    # Nouvelle configuration CORRIGÉE - sans doublon d'en-têtes
    new_config = '''server {
    listen 80;
    server_name apiv2.aris-cc.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/manager.aris-cc.com;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name apiv2.aris-cc.com;

    ssl_certificate /etc/letsencrypt/live/apiv2.aris-cc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/apiv2.aris-cc.com/privkey.pem;

    client_max_body_size 10M;

    # Handle preflight requests for all API endpoints
    location ~ ^/api/ {
        # Handle OPTIONS (preflight) - return 204 immediately
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "$http_origin" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }

        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers for actual responses
        add_header Access-Control-Allow-Origin "$http_origin" always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
}
'''
    
    # Écrire la nouvelle config
    sftp = ssh.open_sftp()
    with sftp.open('/etc/nginx/sites-enabled/apiv2.aris-cc.com', 'w') as f:
        f.write(new_config)
    sftp.close()
    
    # Tester la config Nginx
    stdin, stdout, stderr = ssh.exec_command('nginx -t 2>&1')
    test_output = stdout.read().decode()
    test_error = stderr.read().decode()
    print(f"Test Nginx: {test_output} {test_error}")
    
    # Recharger Nginx si le test passe
    if "successful" in test_output or "syntax is ok" in test_output:
        stdin, stdout, stderr = ssh.exec_command('systemctl reload nginx 2>&1')
        reload_output = stdout.read().decode()
        print(f"Rechargement Nginx: {reload_output}")
        print("\n✅ CORS corrigé - utilise maintenant l'origine de la requête")
    else:
        print("ERREUR: La configuration Nginx est invalide!")
    
    ssh.close()
    
except Exception as e:
    print(f"Erreur: {e}")
    sys.exit(1)
