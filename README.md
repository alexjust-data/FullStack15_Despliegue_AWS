


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

## Práctica 2 : enunciado


Si se accede al servidor web indicando la **dirección IP del servidor** en lugar del nombre de dominio, se deberá carga la práctica realizada en el módulo de **React o React Avanzado**.

--- 


> [!NOTE]
> **Frontend** :   
> `react-nodepop`  
> Es una aplicación de tipo dashboard que será la interfaz gráfica desde la que podremos gestionar el API de anuncios Nodepop. Una vez compilado, tu puedes ver nodepop-react en el browser. Local: http://localhost:3000.  
> En el archivo **.env** está la ruta del acceso al cliente api *REACT_APP_API_BASE_URL=http://localhost:3001*
> 
> **Backend** :  
> `nodepop-api`  https://github.com/davidjj76/nodepop-api   
> nodepop-api está enganchada a una base de datos Sqlite para que no sea una problema en la instalación de base de datos.  
> Una vez en marcha, tendremos nuestro backend corriendo en el puerto 3001 (configurable via archivo .env). Tenéis disponible un swagger en la ruta **/swagger** donde podréis probar los diferentes endpoints y ver cómo pasar los datos en las peticiones.
>

> Comenzamos...





**Para "nodepop-api"***
Este proyecto es una API construida con NestJS, un framework de Node.js para construir aplicaciones del lado del servidor eficientes y escalables. Dado que NestJS se ejecuta en Node.js, es imprescindible tener Node.js instalado para ejecutar la aplicación, instalar dependencias y correr scripts definidos en package.json, como los de construcción, desarrollo, y pruebas.

**Para "nodepop-react"**
Este proyecto es una aplicación React. Node.js es necesario para ejecutar npm o yarn para instalar las dependencias listadas en package.json y para ejecutar los scripts definidos, como start, build, test, y eject. Estos scripts hacen uso de react-scripts, que a su vez dependen de Node.js.

#### Instalo `node` en servidor

```sh
# instalar NVM (Node Version Manager) 
ubuntu@ip-172-31-31-200:~$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# recargo
ubuntu@ip-172-31-31-200:~$ logout

# instalado NVM (Node Version Manager) 
ubuntu@ip-172-31-31-200:~$ nvm
    Node Version Manager (v0.39.7)

# instalando node
ubuntu@ip-172-31-31-200:~$ nvm install --lts
```

#### Dependencias `react-nodepop` & `build` en local

```sh
# carpeta del proyecto en local con ocultos
➜  react-nodepop git:(web-xv) ✗ ls -la

total 2120
drwxr-xr-x@ 11 alex  staff     352 Feb 23 09:33 .
drwxr-xr-x@ 11 alex  staff     352 Feb 22 20:19 ..
-rw-r--r--@  1 alex  staff      49 Dec 11 09:52 .env
drwxr-xr-x@ 13 alex  staff     416 Dec 11 09:52 .git
-rw-r--r--@  1 alex  staff     310 Dec 11 09:51 .gitignore
-rw-r--r--@  1 alex  staff    3362 Dec 11 09:51 README.md
-rw-r--r--@  1 alex  staff  663986 Feb 23 09:33 package-lock.json
-rw-r--r--@  1 alex  staff     902 Dec 11 09:51 package.json
drwxr-xr-x@  8 alex  staff     256 Dec 11 09:51 public
drwxr-xr-x@  9 alex  staff     288 Dec 11 09:51 src
-rw-r--r--@  1 alex  staff  397745 Feb 23 09:33 yarn.lock

# antes de construir el buil e instalar dependencias
# cambio la dirección del api con la ip del servidor
➜  react-nodepop git:(web-xv) ✗ nano .env

    #REACT_APP_API_BASE_URL=http://localhost:3001/api
    REACT_APP_API_BASE_URL=http://34.228.68.224/api

# instalo dependencias
➜  react-nodepop git:(web-xv) ✗ npm install

# construyo el build
➜  react-nodepop git:(web-xv) ✗ npm run build
        > nodepop-react@0.1.0 build
        > react-scripts build

# cargando build en servidor
➜  react-nodepop git:(web-xv) ✗ scp -r -i ../Devops.pem build ubuntu@34.228.68.224:/home/ubuntu

ubuntu@ip-172-31-31-200:~$ ls -l
        total 4
        drwxr-xr-x 3 ubuntu ubuntu 4096 Feb 22 15:45 build

# cambio nombre
ubuntu@ip-172-31-31-200:~$ mv build nodepop-react
ubuntu@ip-172-31-31-200:~$ ls -l
        total 4
        drwxr-xr-x 3 alex alex 4096 Feb 22 14:37 nodepop-react
```

#### Configuro `Nginx` (servidor web, proxy inverso y balanceador de carga)

```sh
# instalando nginx
ubuntu@ip-172-31-31-200:~$ sudo apt-get install nginx
ubuntu@ip-172-31-31-200:~$ sudo reboot

# Abriendo puertos en el servidor
# HTTP 80 : 0.0.0.0/0
````

```sh
# en `/var/www/` para tener permisos
ubuntu@ip-172-31-31-200:~$ sudo mv /home/ubuntu/nodepop-react /var/www/
ubuntu@ip-172-31-31-200:/var/www$ ls -l
    total 8
    drwxr-xr-x 2 root   root   4096 Feb 22 15:53 html
    drwxr-xr-x 3 ubuntu ubuntu 4096 Feb 22 15:45 nodepop-react

# quiero que nginx encuentre index.html
ubuntu@ip-172-31-31-200:~$ ls -l /var/www/nodepop-react/
    total 44
    -rw-r--r-- 1 ubuntu ubuntu  369 Feb 22 15:44 asset-manifest.json
    -rw-r--r-- 1 ubuntu ubuntu 3870 Feb 22 15:44 favicon.ico
    -rw-r--r-- 1 ubuntu ubuntu  644 Feb 22 15:44 index.html
    -rw-r--r-- 1 ubuntu ubuntu 5347 Feb 22 15:45 logo192.png
    -rw-r--r-- 1 ubuntu ubuntu 9664 Feb 22 15:44 logo512.png
    -rw-r--r-- 1 ubuntu ubuntu  492 Feb 22 15:45 manifest.json
    -rw-r--r-- 1 ubuntu ubuntu   67 Feb 22 15:45 robots.txt
    drwxr-xr-x 4 ubuntu ubuntu 4096 Feb 22 15:44 static
```

React sirve para hacer una SPA single page aplication. No hay gran diferencia entre una página hecha en React a una página estática html. Por eso quiero que apunte a `index.html`. Cuando construimos el build : "It correctly bundles React in production mode and optimizes the build for the best performance" y recoje todo en el index.html.

```sh
# configuracion de nginx
ubuntu@ip-172-31-31-200:$ cd /etc/nginx/sites-available/
ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ ls -l
    total 4
    -rw-r--r-- 1 root root 2412 May 30  2023 default

ubuntu@ip-172-31-31-200:~$ cd /etc/nginx/sites-available
ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ sudo nano nodepop-react

    GNU nano 6.2  /etc/nginx/sites-available/nodepop-react *    
    server {
            listen 80;
            server_name _;
            root /var/www/nodepop-react;
            index index.html; # quiero que nginx encuentre index.html
            location / {
                    try_files $uri $uri/ =404 /index.html;
            }
    }

# compruebo
ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ ls -l
    total 4
    -rw-r--r-- 1 root root 2412 May 30  2023 default
    -rw-r--r-- 1 root root 206  Feb 22 16:02 nodepop-react

# elimino default porque los dos tienen puerto 80
ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ ls
    default       # listen 80 default_server;
    nodepop-react # listen 80;

ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ sudo rm default 

# activo configuración ~ acceso directo
ubuntu@ip-172-31-31-200:~$ sudo ln -s /etc/nginx/sites-available/nodepop-react /etc/nginx/sites-enabled/nodepop-react
ubuntu@ip-172-31-31-200:~$ cat /etc/nginx/sites-enabled/nodepop-react

    server {
            listen 80;
            server_name _;
            root /var/www/nodepop-react;
            index index.html;
            location / {
                    try_files $uri $uri/ =404 /index.html;
        }
    }

# compruebo accesos directos
ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ cd /etc/nginx/sites-enabled
ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ ls -l
    total 0
    lrwxrwxrwx 1 root root 34 Feb 22 09:37 default -> /etc/nginx/sites-available/default
    lrwxrwxrwx 1 root root 40 Feb 22 12:03 nodepop-react -> /etc/nginx/sites-available/nodepop-react

# elimino conexion directa default
ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ sudo rm default 

# comprovar sintaxi ok!
ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ sudo nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

# recargamos
ubuntu@ip-172-31-31-200:/etc/nginx/sites-enabled$ sudo systemctl reload nginx
```


http://34.228.68.224/login -> aplicación corriendo en browser

Hasta ahora estamos comprovando que la aplicación funciona conectándonos directamente a la aplicación del servidor. No hay ningún intermediario entre el servidor y yo. Este es el paso primero que he de hacer cuando despliego una app:

1. La cargo al servidor y doy los pasos necesario para ver que todo funciona bien en el servidor.
2. si todo va bien, primer paso conseguido
3. a partir de ahora pondremos intermediarios entre el servidor y yo. Por ejemplo querremos que alguien esté pendiente de que no se apague nunca la app; y este es al caso del gestor de procesos con https://pm2.io/

Una vez que funciona configuro `Nginx` para salvar el directorio como archivos estaticos.  
Configuro Nginx para reenviar solicitudes al puerto de la aplicación React (si es diferente de 80 o 443).

**Para el frontend (react-nodepop):** Dado que has construido tu aplicación React (npm run build) y estás sirviendo los archivos estáticos a través de Nginx, no necesitas usar PM2 para el frontend, ya que Nginx está manejando la entrega de esos archivos estáticos. PM2 es útil para aplicaciones Node.js que necesitan mantenerse ejecutando como un servicio, como tu backend nodepop-api.

#### Configuro `PM2` como gestor de procesos

```sh
# instalando pm2
ubuntu@ip-172-31-31-200:~$ npm install pm2 -g
ubuntu@ip-172-31-31-200:~$ pm2 -version
    5.3.1

# corriendo como un demonio
ubuntu@ip-172-31-31-200:~$ ps aux | grep pm2
ubuntu 1416  0.0  2.7 1025932 26772 ?     Ssl  17:28   0:00 PM2 v5.3.1: God Daemon (/home/ubuntu/.pm2)
ubuntu 1554  0.0  0.2   7004  2304 pts/0  S+   17:47   0:00 grep --color=auto pm2

# para que pm2 arranque cuando cae el servidor
ubuntu@ip-172-31-31-200:~$ pm2 startup

    [PM2] Init System found: systemd
    [PM2] To setup the Startup Script, copy/paste the following command:
    sudo env PATH=$PATH:/home/alex/.nvm/versions/node/v20.11.1/bin /home/alex/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u alex --hp /home/alex

# creo env
ubuntu@ip-172-31-31-200:~$ sudo env PATH=$PATH:/home/alex/.nvm/versions/node/v20.11.1/bin /home/alex/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u alex --hp /home/alex

# reiniciamos
ubuntu@ip-172-31-31-200:~$ sudo reboot
ubuntu@ip-172-31-31-200:~$ ps aux | grep pm2

ubuntu      1406  0.0  0.2   7004  2304 pts/0    S+   17:20   0:00 grep --color=auto pm2
```

#### Instalo `nodepop-api`

```sh
ubuntu@ip-172-31-31-200:~$ git clone https://github.com/davidjj76/nodepop-api
    Cloning into 'nodepop-api'...

# instalando paquetes
ubuntu@ip-172-31-31-200:~/nodepop-api$ npm install
    added 1046 packages, and audited 1047 packages in 1m

    71 packages are looking for funding
    run `npm fund` for details

# mode development
ubuntu@ip-172-31-31-200:~/nodepop-api$ npm run start

    > nodepop-api@0.0.1 start
    > nest start

[Nest] 1639   - 02/22/2024, 6:37:05 PM   [NestFactory] Starting Nest application...
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] AppModule dependencies initialized +98ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] TypeOrmModule dependencies initialized +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] PassportModule dependencies initialized +0ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] ConfigModule dependencies initialized +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] JwtModule dependencies initialized +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] ServeStaticModule dependencies initialized +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] TypeOrmCoreModule dependencies initialized +122ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] TypeOrmModule dependencies initialized +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] UsersModule dependencies initialized +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] AdvertsModule dependencies initialized +2ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [InstanceLoader] AuthModule dependencies initialized +0ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [RoutesResolver] AuthController {/api/auth}: +133ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [RouterExplorer] Mapped {/api/auth/signup, POST} route +3ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [RouterExplorer] Mapped {/api/auth/login, POST} route +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [RouterExplorer] Mapped {/api/auth/me, GET} route +0ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [RoutesResolver] AdvertsController {/api/v1/adverts}: +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [RouterExplorer] Mapped {/api/v1/adverts/tags, GET} route +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [RouterExplorer] Mapped {/api/v1/adverts, POST} route +0ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [RouterExplorer] Mapped {/api/v1/adverts, GET} route +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [RouterExplorer] Mapped {/api/v1/adverts/:id, GET} route +1ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [RouterExplorer] Mapped {/api/v1/adverts/:id, DELETE} route +0ms
[Nest] 1639   - 02/22/2024, 6:37:05 PM   [NestApplication] Nest application successfully started +5ms

    Nodepop API running in port 3001
    Try me in http://localhost:3001/swagger

###############################
# abrir el puerto 3001 de aws #
###############################
```

http://34.228.68.224:3001/swagger/ -> está funcionando



#### `Nginx` como un proxy inverso 

Si lo estás sirviendo como archivos estáticos con Nginx, entonces la configuración de `proxy` para `/` no es necesaria.

```sh
ubuntu@ip-172-31-31-200:~$ cd /etc/nginx/sites-available
ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ ls -s
    total 4
    4 nodepop-react

# eliminio archivo antiguo
ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ sudo rm nodepop-react 

# actualizando para proxy inverso 
ubuntu@ip-172-31-31-200:/etc/nginx/sites-available$ sudo nano nodepop-react

        server {
            listen 80 default_server;
            server_name _;

            # Configura la ubicación para la documentación de Swagger
            location /swagger {
                proxy_pass http://127.0.0.1:3001;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
                proxy_redirect off;
            }

            # Configura la ubicación para tu API
            location /api {
                proxy_pass http://127.0.0.1:3001;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
                proxy_redirect off;
            }

            # Configura la ubicación para tu aplicación frontend React
            location / {
                root /var/www/nodepop-react;
                index index.html;
                try_files $uri $uri/ =404 /index.html;
            }
        }
```

```sh
# elimino archivo simbólico anterior
ubuntu@ip-172-31-31-200:~$ sudo rm /etc/nginx/sites-enabled/nodepop-react

# creando archivo simbolico actualizado
ubuntu@ip-172-31-31-200:~$ sudo ln -s /etc/nginx/sites-available/nodepop-react /etc/nginx/sites-enabled/nodepop-react

# confirmando
ubuntu@ip-172-31-31-200:~$ cat /etc/nginx/sites-enabled/nodepop-react

        server {
            listen 80 default_server;
            server_name _;

            # Configura la ubicación para la documentación de Swagger
            location /swagger {
                proxy_pass http://127.0.0.1:3001;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
                proxy_redirect off;
            }

            # Configura la ubicación para tu API
            location /api {
                proxy_pass http://127.0.0.1:3001;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
                proxy_redirect off;
            }

            # Configura la ubicación para tu aplicación frontend React
            location / {
                root /var/www/nodepop-react;
                index index.html;
                try_files $uri $uri/ =404 /index.html;
            }
        }
```

```sh
# generando archivo ecosystem.config.js
ubuntu@ip-172-31-31-200:~$ pm2 init simple
    File /home/ubuntu/ecosystem.config.js generated

ubuntu@ip-172-31-31-200:~$ ls -l
total 12
    -rw-rw-r--  1 ubuntu ubuntu   83 Feb 22 19:05 ecosystem.config.js
    drwxrwxr-x 10 ubuntu ubuntu 4096 Feb 22 18:37 nodepop-api
    -rw-rw-r--  1 ubuntu ubuntu   85 Feb 22 17:32 package-lock.json

# edito archivo
ubuntu@ip-172-31-31-200:~$ nano ecosystem.config.js

    module.exports = {
    apps : [
        {
        name: "nodepop-api", # Nombre descriptivo para tu aplicación
        script: "npm", # Usando npm como comando para ejecutar el script
        args: "start", # Argumentos pasados al script, en este caso, ejecutando `npm start`
        cwd: "/home/ubuntu/nodepop-api", # Directorio donde se encuentra tu proyecto
        env: {
            NODE_ENV: "production", # Establece la variable de entorno NODE_ENV a "production"
            PORT: 3001, # Establece el puerto en el que tu aplicación debería escuchar
            # Aquí puedes agregar cualquier otra variable de entorno que tu aplicación necesite
        }
        },
        # Aquí puedes agregar más configuraciones para otras aplicaciones si es necesario
    ]
    };

ubuntu@ip-172-31-31-200:~$ pm2 start ecosystem.config.js
    [PM2] Applying action restartProcessId on app [nodepop-api](ids: [ 0 ])
    [PM2] [nodepop-api](0) ✓
┌────┬────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name           │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ nodepop-api    │ default     │ 0.39.7  │ fork    │ 1887     │ 0s     │ 1    │ online    │ 0%       │ 17.9mb   │ ubuntu   │ disabled │
└────┴────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

# haciendo foto
ubuntu@ip-172-31-31-200:~$ pm2 save
    [PM2] Saving current process list...
    [PM2] Successfully saved in /home/ubuntu/.pm2/dump.pm2

# arranco
ubuntu@ip-172-31-31-200:~$ pm2 startup
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.11.1/bin /home/ubuntu/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# ejecuto comando PATH
ubuntu@ip-172-31-31-200:~$ sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.11.1/bin /home/ubuntu/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

http://34.228.68.224/adverts -> funcionando correctamente!!!

```sh
#######################
# elimino puerto 3000 #
#######################
```

Siempre es buena idea después de hacer cambios en la configuración de servicios como Nginx:

* Verificar el Estado del Servicio: Comprobar que el servicio se está ejecutando correctamente con sudo systemctl status nginx.
* Probar la Configuración de Nginx: Asegurarse de que la configuración de Nginx es correcta con sudo nginx -t antes de reiniciar el servicio.
* Revisar los Logs: Mantener una vista en los logs de Nginx con tail -f /var/log/nginx/error.log puede ser útil para atrapar errores inmediatamente después de reiniciar el servicio o intentar acceder a la aplicación.

#### Archivos estáticos de la aplicación

El proyecto, cuando ejecutas el comando `npm run build` o `yarn build`, compila la aplicación y genera una carpeta `build` con todos los archivos necesarios para producción, incluyendo HTML, CSS, JavaScript y activos estáticos como imágenes. No se mantiene la misma estructura de directorios que tienes en desarrollo (como la carpeta public), pero todos los archivos necesarios están incluidos en la carpeta build.

La carpeta build (o dist en algunos otros setups) es la que sirves con `Nginx`. Los archivos estáticos ya están incorporados dentro de los subdirectorios correspondientes y los archivos HTML, CSS, y JavaScript ya tienen los caminos correctos entre ellos.

Dado que cuando ejecutas el comando `npm run build` o `yarn build`, por defecto pone todos los activos estáticos en la carpeta static, tu configuración de Nginx ya debería funcionar correctamente para servir estos archivos, como se indica en la sección location de tu configuración de Nginx:

![](/img/1.png)

