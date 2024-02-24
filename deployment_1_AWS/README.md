



### Despliegue app en Servidor AWS

Se trata de hacer un despliegue de la app llamada [backend_node]((https://github.com/alexjust-data/FullStack15_Despliegue_AWS/tree/main/deployment_1_AWS/backend_node)) que está construida con Node.js y Express, optimizada para servir plataformas web mediante una API RESTful. Utiliza MongoDB para la gestión de datos, enfocándose en el rendimiento y la escalabilidad, lo que la convierte en una solución ideal para proyectos que requieren alta disponibilidad y una base de datos robusta.

> **Arquitectura** :
>
>Se utiliza `node` como servidor de aplicación utilizando `PM2` o supervisor como gestor de procesos node para que siempre esté en ejecución. La aplicación node deberá reiniciarse automáticamente al arrancar el servidor (en el startup).
>
> Utiliza `nginx` como `proxy inverso` que se encargua de recibir las peticiones HTTP y derivárselas a node.
> 
> Los archivos estáticos de la aplicación (imágenes, css, etc.) son servidos por nginx (no por node). Para poder diferenciar quién sirve estos estáticos, se añade una cabecera HTTP cuando se sirven estáticos cuyo valor es: X-Owner (la X- indica que es una cabecera personalizada) y el valor de la cabecera es mi nombre de usuario de la cuenta en github.
> 
> ---

<br>

Pasos
1. [Creo usuario y bloqueo su acceso](#creo-usuario-y-bloqueo-su-acceso)
2. [Instalo `node` en servidor](#)
3. [Configuro `PM2` como gestor de procesos](#)

<br>

```sh
# accediendo al servidor
➜  z_DevOps git:(main) ✗ ssh -i _DevOps_.pem ubuntu@18.206.229.12

        The authenticity of host '34.228.68.224 (34.228.68.224)' can't be established.
        ED25519 key fingerprint is SHA256:QrVdiwcxey4pbKIQ/xH/UVeP4H1VFst/AzYvVtpXnh0.
        This key is not known by any other names.
        Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
        Warning: Permanently added '34.228.68.224' (ED25519) to the list of known hosts.
        @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        @         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
        @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
````

```sh
# permisos a la key
➜  z_DevOps git:(main) ✗ chmod 600 _DevOps_.pem 
➜  z_DevOps git:(main) ✗ ssh -i _DevOps_.pem ubuntu@18.206.229.12

ubuntu@ip-172-31-93-26:~$ 
```

#### Creo usuario `alex` y bloqueo su acceso

```sh
# Creación Usuario en el Sistema
ubuntu@ip-172-31-93-26:~$ sudo adduser alex
    Adding user `alex' ...
    Adding new group `alex' (1001) ...
    Adding new user `alex' (1001) with group `alex' ...
    Creating home directory `/home/alex' ...
    Copying files from `/etc/skel' ...

# Bloqueando Inicio Sesión Usuario
ubuntu@ip-172-31-93-26:~$ sudo passwd -l alex
    passwd: password expiry information changed.

# comando desbloqueo
# sudo passwd -u alex
```

#### Instalo `node` en servidor

```sh
# user alex
ubuntu@ip-172-31-93-26:~$ sudo -u alex -i

# instalar NVM (Node Version Manager) 
alex@ip-172-31-93-26:~$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

alex@ip-172-31-93-26:~$ logout
ubuntu@ip-172-31-93-26:~$ sudo -u alex -i

# version
alex@ip-172-31-93-26:~$ nvm
    Node Version Manager (v0.39.7)

# instalando node
alex@ip-172-31-93-26:~$ nvm install --lts
    Creating default alias: default -> lts/* (-> v20.11.1)
```

#### Configuro `PM2` como gestor de procesos

```sh
# instalando pm2
alex@ip-172-31-93-26:~$ npm install pm2 -g
    5.3.1

# procesos pm2 abiertos
alex@ip-172-31-93-26:~$ ps aux | grep pm2

    alex 2676  0.0  0.2   7004  2304 pts/1    S+   10:45   0:00 grep --color=auto pm2

# generando PATH
alex@ip-172-31-93-26:~$ pm2 startup

    [PM2] Init System found: systemd
    [PM2] To setup the Startup Script, copy/paste the following command:
    sudo env PATH=$PATH:/home/alex/.nvm/versions/node/v20.11.1/bin /home/alex/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u alex --hp /home/alex

# user ubuntu
alex@ip-172-31-93-26:~$ logout

# creo env PATH
ubuntu@ip-172-31-93-26:~$ sudo env PATH=$PATH:/home/alex/.nvm/versions/node/v20.11.1/bin /home/alex/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u alex --hp /home/alex

# reboot
ubuntu@ip-172-31-93-26:~$ sudo reboot

➜  z_DevOps git:(main) ✗ ssh -i _DevOps_.pem ubuntu@18.206.229.12

ubuntu@ip-172-31-93-26:~$ ps aux | grep pm2

    alex   560  1.5  5.2 1025676 50976 ?       Ssl  10:47   0:00 PM2 v5.3.1: God Daemon (/home/alex/.pm2)
    ubuntu 781  0.0  0.2   7004  2304 pts/0    S+   10:47   0:00 grep --color=auto pm2
```

#### Cargando la app `backend_node` al servidor

```sh
# cargo app de local a ubuntu
➜  z_DevOps scp -r -i _DevOps_.pem deployment_1_AWS/backend_node ubuntu@18.206.229.12:/home/ubuntu 

ubuntu@ip-172-31-93-26:~$ ls -l backend_node/
    total 220
    -rw-r--r-- 1 ubuntu ubuntu   1897 Feb 24 11:10 README.md
    -rw-r--r-- 1 ubuntu ubuntu    326 Feb 24 11:10 anuncios.json
    -rw-r--r-- 1 ubuntu ubuntu   2051 Feb 24 11:10 app.js
    drwxr-xr-x 2 ubuntu ubuntu   4096 Feb 24 11:10 bin
    -rw-r--r-- 1 ubuntu ubuntu   1294 Feb 24 11:10 initDB.js
    drwxr-xr-x 2 ubuntu ubuntu   4096 Feb 24 11:10 lib
    -rw-r--r-- 1 ubuntu ubuntu     98 Feb 24 11:10 local_config.js
    drwxr-xr-x 2 ubuntu ubuntu   4096 Feb 24 11:10 models
    -rw-r--r-- 1 ubuntu ubuntu 175034 Feb 24 11:10 package-lock.json
    -rw-r--r-- 1 ubuntu ubuntu    736 Feb 24 11:10 package.json
    drwxr-xr-x 4 ubuntu ubuntu   4096 Feb 24 11:10 public
    drwxr-xr-x 3 ubuntu ubuntu   4096 Feb 24 11:10 routes
    drwxr-xr-x 2 ubuntu ubuntu   4096 Feb 24 11:10 views

# hago propietario a alex
ubuntu@ip-172-31-93-26:~$ sudo chown -R alex:alex backend_node/

# muevo app de grupo
ubuntu@ip-172-31-93-26:~$ sudo mv backend_node /home/alex/
ubuntu@ip-172-31-93-26:~$ sudo -u alex -i
alex@ip-172-31-93-26:~$ ls -l
    total 4
    drwxr-xr-x 8 alex alex 4096 Feb 23 12:25 backend_node

# instalando dependencias
alex@ip-172-31-93-26:~/backend_node$ npm install
    added 252 packages, and audited 253 packages in 9s
```

#### Configurando `MongoDB`

```sh
# instalo según instrucciones mongo
ubuntu@ip-172-31-93-26:~$ sudo apt-get install gnupg curl

# importo clave pública
ubuntu@ip-172-31-93-26:~$ curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# copiando los paquetes de mongo en el archivo para instalarlo
ubuntu@ip-172-31-93-26:~$ echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# recarga base de datos del paquete, actualiza
ubuntu@ip-172-31-93-26:~$ sudo apt-get update

# instalando mongo
ubuntu@ip-172-31-93-26:~$ sudo apt-get install -y mongodb-org

# arrancando mongo
ubuntu@ip-172-31-81-69:~$ sudo systemctl start mongod

# verificando
ubuntu@ip-172-31-93-26:~$ sudo systemctl status mongod
● mongod.service - MongoDB Database Server
     Loaded: loaded (/lib/systemd/system/mongod.service; disabled; vendor preset: enabled)
     Active: active (running) since Fri 2024-02-23 11:10:26 UTC; 2min 1s ago

ubuntu@ip-172-31-93-26:~$ ps aux |grep mongo
mongodb     2340  0.9 15.2 2633172 148224 ?      Ssl  11:10   0:01 /usr/bin/mongod --config /etc/mongod.conf
ubuntu      2381  0.0  0.2   7008  2304 pts/1    S+   11:12   0:00 grep --color=auto mongo
```

```sh
# creo usuario admin
ubuntu@ip-172-31-93-26:~$ mongosh 
Current Mongosh Log ID:	65d87f48c76063556a62b0e6
Connecting to:		mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.5
Using MongoDB:		7.0.5
Using Mongosh:		2.1.5

test> use admin
switched to db admin
admin> db.createUser(
...   {
...     user: "admin",
...     pwd:  "*****",
...     roles: [
...       { role: "userAdminAnyDatabase", db: "admin" },
...       { role: "readWriteAnyDatabase", db: "admin" }
...     ]
...   }
... )
{ ok: 1 }
admin> exit
```

```sh
# Re-start the MongoDB instance with access control
ubuntu@ip-172-31-93-26:~$ sudo nano /etc/mongod.conf

        #security:
        security:
            authorization: enabled

# reinicio
ubuntu@ip-172-31-93-26:~$ sudo systemctl restart mongod
ubuntu@ip-172-31-93-26:~$ sudo systemctl status mongod
    ● mongod.service - MongoDB Database Server
        Loaded: loaded (/lib/systemd/system/mongod.service; disabled; vendor preset: enabled)
        Active: active (running) since Fri 2024-02-23 11:24:00 UTC; 5s ago
```

#### Creando base de datos para app `backend_node` en Mongodb

```sh
# Cada app debe tener acceso a su base de datos de mongo
ubuntu@ip-172-31-93-26:~$ mongosh --authenticationDatabase admin -u admin -p
    Enter password: ******
    Using MongoDB:		7.0.5
    Using Mongosh:		2.1.5

    For mongosh info see: https://docs.mongodb.com/mongodb-shell/

    test> show databases
        admin   132.00 KiB
        config   60.00 KiB
        local    40.00 KiB

    test> use nodepop
    switched to db nodepop
    nodepop> db.createUser(
            {
                user: "user2",
                pwd:  "*****",
                roles: [ { role: "readWrite", db: "nodepop" }]
            }
        )
    { ok: 1 }
    nodepop> exit
```
```sh
# reinicio
ubuntu@ip-172-31-93-26:~$ sudo systemctl restart mongod
ubuntu@ip-172-31-93-26:~$ sudo systemctl status mongod
    ● mongod.service - MongoDB Database Server
        Loaded: loaded (/lib/systemd/system/mongod.service; disabled; vendor preset: enabled)
        Active: active (running) since Fri 2024-02-23 11:24:00 UTC; 5s ago
```

Que mongo se reinicie siempre

```sh
ubuntu@ip-172-31-93-26:~$ sudo systemctl enable mongod

    Created symlink /etc/systemd/system/multi-user.target.wants/mongod.service → /lib/systemd/system/mongod.service.
```


#### `Nginx` (servidor web, proxy inverso y balanceador de carga)

```sh
# instalando nginx
ubuntu@ip-172-31-93-26:~$ sudo apt-get install nginx
ubuntu@ip-172-31-93-26:~$ sudo reboot

# Abriendo puertos en el servidor
# HTTP 80 : 0.0.0.0/0

# establecemos la direccion dns
ubuntu@ip-172-31-93-26:~$ cd /etc/nginx/sites-available
ubuntu@ip-172-31-93-26:/etc/nginx/sites-available$ sudo nano backend_node

        server {
            listen 80;
            server_name ec2-18-206-229-12.compute-1.amazonaws.com;

            location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
            }
        }

# Habilitar la Configuración
ubuntu@ip-172-31-93-26:~$ sudo ln -s /etc/nginx/sites-available/backend_node /etc/nginx/sites-enabled/

# compruebo
ubuntu@ip-172-31-93-26:~$ cat /etc/nginx/sites-enabled/backend_node 
server {
    listen 80;
    server_name ec2-18-206-229-12.compute-1.amazonaws.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

ubuntu@ip-172-31-93-26:~$ sudo nginx -t
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful

# reload nginx
ubuntu@ip-172-31-93-26:~$ sudo systemctl reload nginx
```

#### `pm2`

```sh
# generando `ecosystem.config.js` para iniciar la aplicación
alex@ip-172-31-93-26:~$ pm2 init simple

    File /home/alex/ecosystem.config.js generated

alex@ip-172-31-93-26:~$ ls -l
    total 8
    drwxr-xr-x 9 alex alex 4096 Feb 24 11:13 backend_node
    -rw-rw-r-- 1 alex alex   83 Feb 24 11:35 ecosystem.config.js
    -rw-rw-r-- 1 alex alex   83 Feb 24 11:13 package-lock.json

# creando archivo
alex@ip-172-31-93-26:~$ nano ecosystem.config.js
    GNU nano 6.2 ecosystem.config.js *

    module.exports = {
        apps: [{
            name:   'backend_node',
            script: 'node ./bin/www',
            cwd:    '/home/alex/backend_node',
            env: {
                    MONGODB_URI: 'mongodb://user2:*******@127.0.0.1/nodepop' 
            }
        }]
    };

alex@ip-172-31-93-26:~$ pm2 start ecosystem.config.js
    [PM2][WARN] Applications backend_node not running, starting...
┌────┬─────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ backend_node    │ default     │ N/A     │ fork    │ 1092     │ 0s     │ 0    │ online    │ 0%       │ 27.5mb   │ alex     │ disabled │

```



#### `statics files` 
```sh
ubuntu@ip-172-31-93-26:~$ sudo nano /etc/nginx/sites-available/backend_node 

        server {
            listen 80;
            server_name ec2-18-206-229-12.compute-1.amazonaws.com;

            location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
            } 

            location ~ ^/(images|stylesheets|css|img|sounds|fonts|js)/ {
                root /home/alex/backend_node/public;
                access_log off;
                expires max;
                add_header X-Owner AlexJustData;
            }
        }


ubuntu@ip-172-31-93-26:/etc/nginx/sites-enabled$ sudo ln -s /etc/nginx/sites-available/backend_node /etc/nginx/sites-enabled/
ubuntu@ip-172-31-93-26:/etc/nginx/sites-enabled$ ls -l
        total 0
        lrwxrwxrwx 1 root root 39 Feb 23 21:44 backend_node -> /etc/nginx/sites-available/backend_node
        lrwxrwxrwx 1 root root 40 Feb 23 10:02 nodepop-react -> /etc/nginx/sites-available/nodepop-react
ubuntu@ip-172-31-93-26:/etc/nginx/sites-enabled$ cat backend_node 

        server {
            listen 80;
            server_name ec2-34-228-68-224.compute-1.amazonaws.com;

            location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
                proxy_hide_header X-Powered-By;  # Add this line to remove the header
            }

            location ~ ^/(images|stylesheets|css|img|sounds|fonts|js)/ {
                root /home/alex/backend_node/public;
                access_log off;
                expires max;
                add_header X-Owner AlexJustData;
            }
        }

ubuntu@ip-172-31-93-26:~$ sudo rm -rf /etc/nginx/sites-enabled/backend_node
ubuntu@ip-172-31-93-26:~$ sudo ln -s /etc/nginx/sites-available/backend_node /etc/nginx/sites-enabled/
ubuntu@ip-172-31-93-26:~$ cat /etc/nginx/sites-enabled/backend_node

        server {
            listen 80;
            server_name ec2-18-206-229-12.compute-1.amazonaws.com;

            location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
            }

            location ~ ^/(images|stylesheets|css|img|sounds|fonts|js)/ {
                root /home/alex/backend_node/public;
                access_log off;
                expires max;
                add_header X-Owner AlexJustData;
            }
        }

ubuntu@ip-172-31-93-26:~$ sudo nginx -t
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful
ubuntu@ip-172-31-93-26:~$ sudo systemctl reload nginx
```

#### comprimiendo archivos estáticos

```sh
ubuntu@ip-172-31-93-26:~$ sudo nano /etc/nginx/nginx.conf

    GNU nano 6.2  
# Descomenta esta linea 
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

Dado que Nginx suele ejecutarse bajo el usuario www-data o similar, el servidor web actualmente no tiene permiso para leer o acceder a los archivos dentro de /home/alex debido a la falta de permisos para "otros usuarios".

```sh
ubuntu@ip-172-31-93-26:~$ sudo ls -l /home
    total 8
    drwxr-x--- 7 alex   alex   4096 Feb 24 11:48 alex
    drwxr-x--- 6 ubuntu ubuntu 4096 Feb 24 11:17 ubuntu

# ajustando permisos
ubuntu@ip-172-31-93-26:~$ sudo chmod o+rx /home/alex
ubuntu@ip-172-31-93-26:~$ ls -l /home
    total 8
    drwxr-xr-x 7 alex   alex   4096 Feb 24 11:48 alex
    drwxr-x--- 6 ubuntu ubuntu 4096 Feb 24 11:17 ubuntu
```