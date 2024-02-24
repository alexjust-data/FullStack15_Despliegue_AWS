1. [Práctica 1 : enunciado](Practica_1_enunciado)  
    I. [Creo usuario y bloqueo su acceso](#creo-usuario-y-bloqueo-su-acceso)
    II. [Configurando MongoDB](#configurando-mongodb)


2. [Práctica 1 : enunciado](Practica_2_enunciado)  
   2.1. [Creo usuario y bloqueo su acceso](Creo_usuario_&_bloqueo_su_acceso)  
   2.2. [Subo app al servidor](cargo_app_&_creo_propietario_alex)  
   2.3. [instalo react-nodepop y abro sus puertos](instalo_app_&_abro_puertos)  
   2.4. [PM2 como gestor de procesos](PM2_gestor_procesos)  



## Práctica 1 : enunciado
```sh
➜  z_DevOps ssh -i DevOps.pem ubuntu@34.228.68.224
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
➜  z_DevOps chmod 600 Devops.pem 
➜  z_DevOps ssh -i DevOps.pem ubuntu@34.228.68.224

ubuntu@ip-172-31-31-200:~$ 
```

#### Creo usuario y bloqueo su acceso

```sh
# creando usuario
ubuntu@ip-172-31-31-200:~$ sudo adduser alex
    Adding user `alex' ...
    Adding new group `alex' (1001) ...
    Adding new user `alex' (1001) with group `alex' ...
    Creating home directory `/home/alex' ...
    Copying files from `/etc/skel' ...

# impido que el usuario inicie sesión
ubuntu@ip-172-31-31-200:~$ sudo passwd -l alex
    passwd: password expiry information changed.

#### ojo ####
# lo tengo desbloqueado
sudo passwd -u alex

```


#### Configurando `MongoDB`

```sh
# instalo según instrucciones mongo
ubuntu@ip-172-31-31-200:~$ sudo apt-get install gnupg curl

# importo clave pública
ubuntu@ip-172-31-31-200:~$ curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# copiando los paquetes de mongo en el archivo para instalarlo
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# recarga base de datos del paquete, actualiza
sudo apt-get update

# instalando mongo
sudo apt-get install -y mongodb-org

# arrancando mongo
ubuntu@ip-172-31-81-69:~$ sudo systemctl start mongod

# verificando
ubuntu@ip-172-31-31-200:~$ sudo systemctl status mongod
● mongod.service - MongoDB Database Server
     Loaded: loaded (/lib/systemd/system/mongod.service; disabled; vendor preset: enabled)
     Active: active (running) since Fri 2024-02-23 11:10:26 UTC; 2min 1s ago

ubuntu@ip-172-31-31-200:~$ ps aux |grep mongo
mongodb     2340  0.9 15.2 2633172 148224 ?      Ssl  11:10   0:01 /usr/bin/mongod --config /etc/mongod.conf
ubuntu      2381  0.0  0.2   7008  2304 pts/1    S+   11:12   0:00 grep --color=auto mongo
```

```sh
# creo usuario admin
ubuntu@ip-172-31-31-200:~$ mongosh 
Current Mongosh Log ID:	65d87f48c76063556a62b0e6
Connecting to:		mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.5
Using MongoDB:		7.0.5
Using Mongosh:		2.1.5

test> use admin
switched to db admin
admin> db.createUser(
...   {
...     user: "admin",
...     pwd: "6y1axb",
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
ubuntu@ip-172-31-31-200:~$ sudo nano /etc/mongod.conf

        #security:
        security:
            authorization: enabled

# reinicio
ubuntu@ip-172-31-31-200:~$ sudo systemctl restart mongod
ubuntu@ip-172-31-31-200:~$ sudo systemctl status mongod
● mongod.service - MongoDB Database Server
     Loaded: loaded (/lib/systemd/system/mongod.service; disabled; vendor preset: enabled)
     Active: active (running) since Fri 2024-02-23 11:24:00 UTC; 5s ago
```

#### Creando base de datos para app `backend_node` en Mongodb
```sh
# Cada app debe tener acceso a su base de datos de mongo
ubuntu@ip-172-31-31-200:~$ mongosh --authenticationDatabase admin -u admin -p
    Enter password: ******
    Using MongoDB:		7.0.5
    Using Mongosh:		2.1.5

    For mongosh info see: https://docs.mongodb.com/mongodb-shell/

    test> show databases
        admin   132.00 KiB
        config   60.00 KiB
        local    40.00 KiB

    test> use backend_node_db
        switched to db backend_node_db

    backend_node_db> db.createUser(
        ...   {
        ...     user: "user1",
        ...     pwd:  "user1password",
        ...     roles: [ { role: "readWrite", db: "backend_node_db" }]
        ...   }
        ... )
    { ok: 1 }

    backend_node_db> exit


ubuntu@ip-172-31-31-200:~$ mongosh --authenticationDatabase backend_node_db -u user1 -p
    Enter password: *************

    test> use backend_node_db
        switched to db backend_node_db
    backend_node_db> show collections

    backend_node_db> 
```

creando bd `nodepop`

```sh
ubuntu@ip-172-31-31-200:~$ mongosh --authenticationDatabase admin -u admin -p
Enter password: ******

    test> use nodepop
    switched to db nodepop
    nodepop> db.createUser(
            {
                user: "user2",
                pwd:"user2password",
                roles: [ { role: "readWrite", db: "nodepop" }]
            }
        )
    { ok: 1 }
    nodepop> 


# reinicio
ubuntu@ip-172-31-31-200:~$ sudo systemctl restart mongod
ubuntu@ip-172-31-31-200:~$ sudo systemctl status mongod
    ● mongod.service - MongoDB Database Server
        Loaded: loaded (/lib/systemd/system/mongod.service; disabled; vendor preset: enabled)
        Active: active (running) since Fri 2024-02-23 11:24:00 UTC; 5s ago
```


#### Instalo `node` en servidor

```sh
# instalar NVM (Node Version Manager) 
alex@ip-172-31-31-200:~$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

alex@ip-172-31-31-200:~$ logout
ubuntu@ip-172-31-31-200:~$ sudo -u alex -i

# version
alex@ip-172-31-31-200:~$ nvm
    Node Version Manager (v0.39.7)

# instalando node
alex@ip-172-31-31-200:~$ nvm install --lts
    Creating default alias: default -> lts/* (-> v20.11.1)
```

#### Configuro `PM2` como gestor de procesos

```sh
# instalando pm2
alex@ip-172-31-31-200:~$ npm install pm2 -g
    5.3.1

# mirando procesos pm2
alex@ip-172-31-31-200:~$ ps aux | grep pm2

    ubuntu 571  0.0  2.7 1228352 27168 ?       Ssl  09:12   0:04 PM2 v5.3.1: God Daemon (/home/ubuntu/.pm2)
    alex 3465  3.5  5.7 1029036 56236 ?       Ssl  12:38   0:00 PM2 v5.3.1: God Daemon (/home/alex/.pm2)
    alex 3477  0.0  0.2   7008  2304 pts/0    S+   12:38   0:00 grep --color=auto pm2

# generando PATH
alex@ip-172-31-31-200:~$ pm2 startup

    [PM2] Init System found: systemd
    [PM2] To setup the Startup Script, copy/paste the following command:
    sudo env PATH=$PATH:/home/alex/.nvm/versions/node/v20.11.1/bin /home/alex/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u alex --hp /home/alex

# cambio a ubuntu
alex@ip-172-31-31-200:~$ logout

# creo env PATH
ubuntu@ip-172-31-31-200:~$ sudo env PATH=$PATH:/home/alex/.nvm/versions/node/v20.11.1/bin /home/alex/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u alex --hp /home/alex

# reseteo
ubuntu@ip-172-31-31-200:~$ sudo reboot
ubuntu@ip-172-31-31-200:~$ ps aux | grep pm2

    ubuntu 576  0.8  5.6 1224680 54844 ?       Ssl  12:44   0:00 PM2 v5.3.1: God Daemon (/home/ubuntu/.pm2)
    alex 577  0.4  5.2 1025936 50884 ?       Ssl  12:44   0:00 PM2 v5.3.1: God Daemon (/home/alex/.pm2)
    ubuntu 1059  0.0  0.2   7008  2304 pts/0    S+   12:45   0:00 grep --color=auto pm2
```

#### Cargando la app `backend_node` al servidor

```sh
# cargo app de local a ubuntu
➜  z_DevOps scp -r -i Devops.pem backend_node ubuntu@34.228.68.224:/home/ubuntu 

ubuntu@ip-172-31-31-200:~$ ls -l
total 16
    drwxr-xr-x  8 ubuntu ubuntu 4096 Feb 23 12:25 backend_node
    -rw-rw-r--  1 ubuntu ubuntu  750 Feb 23 08:27 ecosystem.config.js
    drwxrwxr-x 10 ubuntu ubuntu 4096 Feb 22 18:37 nodepop-api
    -rw-rw-r--  1 ubuntu ubuntu   85 Feb 23 09:05 package-lock.json

# hago propietario a alex
ubuntu@ip-172-31-31-200:~$ sudo chown -R alex:alex backend_node/

# muevo app de grupo
ubuntu@ip-172-31-31-200:~$ sudo mv backend_node /home/alex/
ubuntu@ip-172-31-31-200:~$ sudo -u alex -i
alex@ip-172-31-31-200:~$ ls -l
    total 4
    drwxr-xr-x 8 alex alex 4096 Feb 23 12:25 backend_node

# instalando dependencias
alex@ip-172-31-31-200:~/backend_node$ npm install
    added 252 packages, and audited 253 packages in 9s
```

#### `Nginx` configuración

```sh
# establecemos la direccion dns
ubuntu@ip-172-31-31-200:~$ cd /etc/nginx/sites-available
ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ sudo nano backend_node

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
            }
        }

# Habilitar la Configuración
ubuntu@ip-172-31-31-200:~$ sudo ln -s /etc/nginx/sites-available/backend_node /etc/nginx/sites-enabled/

# recargando nginx
ubuntu@ip-172-31-31-200:~$ sudo systemctl reload nginx
ubuntu@ip-172-31-31-200:~$ sudo nginx -t
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### `pm2`

```sh
# generando `ecosystem.config.js` para iniciar la aplicación
alex@ip-172-31-31-200:~$ pm2 init simple

    File /home/alex/ecosystem.config.js generated

alex@ip-172-31-31-200:~$ ls -l
    total 8
    drwxr-xr-x 8 alex alex 4096 Feb 23 12:25 backend_node
    -rw-rw-r-- 1 alex alex   83 Feb 23 14:40 ecosystem.config.js

# creando archivo
alex@ip-172-31-31-200:~$ nano ecosystem.config.js
    GNU nano 6.2 ecosystem.config.js *

    module.exports = {
    apps: [{
        name: 'backend_node',
        script: 'node ./bin/www', // o 'npm' y en args: 'start'
        cwd: '/home/alex/backend_node'
    }]
    };

    # module.exports = {
    # apps: [{
    #     name: 'backend_node',
    #     script: './bin/www',
    #     env: {
    #         MONGODB_URI: 'mongodb://user1:user1password@127.0.0.1/backend_node_db'
    #     }
    # }]
    # };

# pm2 start ecosystem.config.js
```

#### Problemas encontrados

Dado que no puedo modificar el codigo de la app y no se como conectar la app con mongo

```sh
alex@ip-172-31-31-200:~$ nano ~/.bashrc

        # ~/.bashrc: executed by bash(1) for non-login shells.
        # see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
        # for examples

        export MONGODB_URI='mongodb://user2:user1password@127.0.0.1/nodepop'

        # If not running interactively, don't do anything

alex@ip-172-31-31-200:~$ source ~/.bashrc
alex@ip-172-31-31-200:~$ echo $MONGODB_URI
        mongodb://user1:user1password@127.0.0.1/backend_node_db

alex@ip-172-31-31-200:~$ nano ecosystem.config.js 

        module.exports = {
        apps : [{
            name: 'backend_node',
            script: 'node ./bin/www',
            cwd: '/home/alex/backend_node',
            env: {
                "NODE_ENV": "development",
                "MONGODB_URI": "mongodb://user2:user2password@127.0.0.1/nodepop"
            }
        }]
        };

```

```sh
ubuntu@ip-172-31-31-200:~$ sudo systemctl status mongod
● mongod.service - MongoDB Database Server
     Loaded: loaded (/lib/systemd/system/mongod.service; disabled; vendor preset: enabled)
     Active: active (running) since Fri 2024-02-23 18:52:00 UTC; 26s ago

ubuntu@ip-172-31-31-200:~$ ps aux |grep mongo
mongodb     5784  3.7 15.1 2635156 147584 ?      Ssl  18:51   0:01 /usr/bin/mongod --config /etc/mongod.conf
ubuntu      5840  0.0  0.2   7008  2304 pts/2    S+   18:52   0:00 grep --color=auto mongo
```

NOTA : acabé modificando el archivo `/lib/connectMongoose.js`

```js
'use strict';

const mongoose = require('mongoose');

mongoose.connection.on('error', function (err) {
  console.error('mongodb connection error:', err);
  process.exit(1);
});

mongoose.connection.once('open', function () {
  console.info('Connected to mongodb.');
});

// Usamos la variable de entorno MONGODB_URI. Si no está definida, usamos una dirección predeterminada.
const mongoDBUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1/nodepop';

const connectionPromise = mongoose.connect(mongoDBUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// exportamos la promesa de la conexión (https://mongoosejs.com/docs/connections.html)
module.exports = connectionPromise;

```

#### Que mongo se reinicie siempre

```sh
ubuntu@ip-172-31-31-200:~$ sudo systemctl enable mongod

    Created symlink /etc/systemd/system/multi-user.target.wants/mongod.service → /lib/systemd/system/mongod.service.
```

#### archivos estáticos de la aplicación

```sh
ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ sudo nano backend_node 

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


ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ sudo ln -s /etc/nginx/sites-available/backend_node /etc/nginx/sites-enabled/
ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ ls -l
        total 0
        lrwxrwxrwx 1 root root 39 Feb 23 21:44 backend_node -> /etc/nginx/sites-available/backend_node
        lrwxrwxrwx 1 root root 40 Feb 23 10:02 nodepop-react -> /etc/nginx/sites-available/nodepop-react
ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ cat backend_node 

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



ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ sudo rm backend_node
ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ sudo ln -s /etc/nginx/sites-available/backend_node /etc/nginx/sites-enabled/
ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ sudo nginx -t
        nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
        nginx: configuration file /etc/nginx/nginx.conf test is successful
ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ sudo systemctl reload nginx
```

#### para comprimir los estáticos

```sh
ubuntu@ip-172-31-39-104:/etc/nginx$ sudo nano nginx.conf

# Descomenta esta linea de nano
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/java>
```