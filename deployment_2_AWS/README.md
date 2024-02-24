## Práctica 2 : enunciado


Si se accede al servidor web indicando la **dirección IP del servidor** en lugar del nombre de dominio, se deberá carga la práctica realizada en el módulo de **React o React Avanzado**.



> [!NOTE]
> **Frontend** :   
> `react-nodepop`  
> Es una aplicación de tipo dashboard que será la interfaz gráfica desde la que podremos gestionar el API de anuncios Nodepop. Una vez compilado, tu puedes ver nodepop-react en el browser. Local: http://localhost:3000.  
> En el archivo **.env** está la ruta del acceso al cliente api REACT_APP_API_BASE_URL=http://localhost:3001
> 
> **Backend** :  
> `nodepop-api`  https://github.com/davidjj76/nodepop-api   
> nodepop-api está enganchada a una base de datos Sqlite para que no sea una problema en la instalación de base de datos.  
> Una vez en marcha, tendremos nuestro backend corriendo en el puerto 3001 (configurable via archivo .env). Tenéis disponible un swagger en la ruta **/swagger** donde podréis probar los diferentes endpoints y ver cómo pasar los datos en las peticiones.
>

> Comenzamos...





`nodepop-api` es una API construida con NestJS, un framework de Node.js para construir aplicaciones del lado del servidor eficientes y escalables. Dado que NestJS se ejecuta en Node.js, es imprescindible tener Node.js instalado para ejecutar la aplicación, instalar dependencias y correr scripts definidos en package.json, como los de construcción, desarrollo, y pruebas.

`nodepop-react` es una aplicación React. Node.js es necesario para ejecutar npm o yarn para instalar las dependencias listadas en package.json y para ejecutar los scripts definidos, como start, build, test, y eject. Estos scripts hacen uso de react-scripts, que a su vez dependen de Node.js.

#### Instalo `node` en servidor

```sh
# instalar NVM (Node Version Manager) 
ubuntu@ip-172-31-93-26:~$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# recargo
ubuntu@ip-172-31-93-26:~$ logout

# instalado NVM (Node Version Manager) 
ubuntu@ip-172-31-93-26:~$ nvm
    Node Version Manager (v0.39.7)

# instalando node
ubuntu@ip-172-31-93-26:~$ nvm install --lts
```

#### Dependencias `react-nodepop` & `build` en local

```sh
# carpeta del proyecto en local con ocultos
➜  z_DevOps git:(main) ✗ la -l  deployment_2_AWS/react-nodepop
total 2120
-rw-r--r--@   1 alex  staff    48B Feb 23 09:41 .env
-rw-r--r--@   1 alex  staff   310B Dec 11 09:51 .gitignore
-rw-r--r--@   1 alex  staff   3.3K Dec 11 09:51 README.md
-rw-r--r--@   1 alex  staff   648K Feb 23 09:47 package-lock.json
-rw-r--r--@   1 alex  staff   902B Dec 11 09:51 package.json
drwxr-xr-x@   8 alex  staff   256B Dec 11 09:51 public
drwxr-xr-x@   9 alex  staff   288B Dec 11 09:51 src
-rw-r--r--@   1 alex  staff   388K Feb 23 09:47 yarn.lock

# antes de construir el buil e instalar dependencias
# cambio la dirección del api con la ip del servidor
➜  react-nodepop git:(web-xv) ✗ nano .env

    #REACT_APP_API_BASE_URL=http://localhost:3001/api
    REACT_APP_API_BASE_URL=http://18.206.229.12:3001/api

# instalo dependencias
➜  react-nodepop git:(web-xv) ✗ npm install

# construyo el build
➜  react-nodepop git:(web-xv) ✗ npm run build
        > nodepop-react@0.1.0 build
        > react-scripts build

# cargando build en servidor
➜  z_DevOps git:(main) ✗ scp -r -i _DevOps_.pem deployment_2_AWS/react-nodepop/build ubuntu@18.206.229.12:/home/ubuntu

ubuntu@ip-172-31-93-26:~$ ls -l
        total 4
        drwxr-xr-x 3 ubuntu ubuntu 4096 Feb 22 15:45 build

# cambio nombre
ubuntu@ip-172-31-93-26:~$ mv build nodepop-react
ubuntu@ip-172-31-93-26:~$ ls -l
        total 4
        drwxr-xr-x 3 alex alex 4096 Feb 22 14:37 nodepop-react
```

```sh
# en `/var/www/` para tener permisos
ubuntu@ip-172-31-93-26:~$ sudo mv /home/ubuntu/nodepop-react /var/www/
ubuntu@ip-172-31-93-26:~$ ls -l /var/www/
    total 8
    drwxr-xr-x 2 root   root   4096 Feb 22 15:53 html
    drwxr-xr-x 3 ubuntu ubuntu 4096 Feb 22 15:45 nodepop-react

# quiero que nginx encuentre index.html
ubuntu@ip-172-31-93-26:~$ ls -l /var/www/nodepop-react/
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

#### Configuro `Nginx` (servidor web, proxy inverso y balanceador de carga)

```sh
# instalando nginx
ubuntu@ip-172-31-93-26:~$ sudo apt-get install nginx
ubuntu@ip-172-31-93-26:~$ sudo reboot

# Abriendo puertos en el servidor
# HTTP 80 : 0.0.0.0/0
```

React sirve para hacer una SPA single page aplication. No hay gran diferencia entre una página hecha en React a una página estática html. Por eso quiero que apunte a `index.html`. Cuando construimos el build : "It correctly bundles React in production mode and optimizes the build for the best performance" y recoje todo en el index.html.

```sh
# configuracion de nginx
ubuntu@ip-172-31-93-26:$ cd /etc/nginx/sites-available/
ubuntu@ip-172-31-93-26:/etc/nginx/sites-available$ ls -l
    total 4
    -rw-r--r-- 1 root root 2412 May 30  2023 default

ubuntu@ip-172-31-93-26:/etc/nginx/sites-available$ sudo nano nodepop-react

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
ubuntu@ip-172-31-93-26:/etc/nginx/sites-available$ ls -l
    total 4
    -rw-r--r-- 1 root root 2412 May 30  2023 default
    -rw-r--r-- 1 root root 206  Feb 22 16:02 nodepop-react

# elimino default porque los dos tienen puerto 80
ubuntu@ip-172-31-93-26:/etc/nginx/sites-available$ ls
    default       # listen 80 default_server;
    nodepop-react # listen 80;

ubuntu@ip-172-31-93-26:/etc/nginx/sites-available$ sudo rm default 

# activo configuración ~ acceso directo
ubuntu@ip-172-31-93-26:~$ sudo ln -s /etc/nginx/sites-available/nodepop-react /etc/nginx/sites-enabled/nodepop-react
ubuntu@ip-172-31-93-26:~$ cat /etc/nginx/sites-enabled/nodepop-react

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
ubuntu@ip-172-31-93-26:/etc/nginx/sites-available$ cd /etc/nginx/sites-enabled
ubuntu@ip-172-31-93-26:/etc/nginx/sites-enabled$ ls -l

    total 0
    lrwxrwxrwx 1 root root 34 Feb 22 09:37 default -> /etc/nginx/sites-available/default
    lrwxrwxrwx 1 root root 40 Feb 22 12:03 nodepop-react -> /etc/nginx/sites-available/nodepop-react

# elimino conexion directa default
ubuntu@ip-172-31-93-26:/etc/nginx/sites-enabled$ sudo rm default 

# comprovar sintaxi ok!
ubuntu@ip-172-31-93-26:/etc/nginx/sites-enabled$ sudo nginx -t

    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful

# recargamos
ubuntu@ip-172-31-93-26:/etc/nginx/sites-enabled$ sudo systemctl reload nginx
```

http://18.206.229.12/login -> aplicación corriendo en browser

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
ubuntu@ip-172-31-93-26:~$ npm install pm2 -g
ubuntu@ip-172-31-93-26:~$ pm2 -version
    5.3.1

# corriendo como un demonio
ubuntu@ip-172-31-93-26:~$ ps aux | grep pm2

    alex   574  0.0  3.3 1025676 32628 ?       Ssl  16:11   0:00 PM2 v5.3.1: God Daemon (/home/alex/.pm2)
    ubuntu 2103  3.0  5.7 1028888 55904 ?      Ssl  16:21   0:00 PM2 v5.3.1: God Daemon (/home/ubuntu/.pm2)
    ubuntu 2115  0.0  0.2   7004  2304 pts/0   S+   16:21   0:00 grep --color=auto pm2

# para que pm2 arranque cuando cae el servidor
ubuntu@ip-172-31-93-26:~$ pm2 startup

    [PM2] Init System found: systemd
    [PM2] To setup the Startup Script, copy/paste the following command:
    sudo env PATH=$PATH:/home/alex/.nvm/versions/node/v20.11.1/bin /home/alex/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u alex --hp /home/alex

# creo env
ubuntu@ip-172-31-93-26:~$ sudo env PATH=$PATH:/home/alex/.nvm/versions/node/v20.11.1/bin /home/alex/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u alex --hp /home/alex

# reiniciamos
ubuntu@ip-172-31-93-26:~$ sudo reboot
ubuntu@ip-172-31-93-26:~$ ps aux | grep pm2

alex   590  2.8  5.7 1028888 55784 ?       Ssl  16:23   0:00 PM2 v5.3.1: God Daemon (/home/alex/.pm2)
ubuntu 591  3.0  5.7 1028888 55900 ?       Ssl  16:23   0:00 PM2 v5.3.1: God Daemon (/home/ubuntu/.pm2)
ubuntu 1054  0.0  0.2   7004  2304 pts/0    S+   16:23   0:00 grep --color=auto pm2
```

#### Instalo `nodepop-api`

```sh
ubuntu@ip-172-31-93-26:~$ git clone https://github.com/davidjj76/nodepop-api
    Cloning into 'nodepop-api'...

# instalando paquetes
ubuntu@ip-172-31-93-26:~/nodepop-api$ npm install
    added 1046 packages, and audited 1047 packages in 1m

    71 packages are looking for funding
    run `npm fund` for details

# mode development
ubuntu@ip-172-31-93-26:~/nodepop-api$ npm run start

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

http://18.206.229.12/swagger/ -> está funcionando



#### `Nginx` como un proxy inverso 

Si lo estás sirviendo como archivos estáticos con Nginx, entonces la configuración de `proxy` para `/` no es necesaria.

```sh
ubuntu@ip-172-31-93-26:~$ cd /etc/nginx/sites-available
ubuntu@ip-172-31-93-26:/etc/nginx/sites-available$ ls -s

    total 8
    -rw-r--r-- 1 root root 874 Feb 24 15:31 backend_node
    -rw-r--r-- 1 root root 202 Feb 24 16:14 nodepop-react

# eliminio archivo antiguo
ubuntu@ip-172-31-93-26:/etc/nginx/sites-available$ sudo rm nodepop-react 

# actualizando para proxy inverso 
ubuntu@ip-172-31-93-26:/etc/nginx/sites-available$ sudo nano nodepop-react

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
ubuntu@ip-172-31-93-26:~$ sudo rm /etc/nginx/sites-enabled/nodepop-react

# creando archivo simbolico actualizado
ubuntu@ip-172-31-93-26:~$ sudo ln -s /etc/nginx/sites-available/nodepop-react /etc/nginx/sites-enabled/nodepop-react

# confirmando
ubuntu@ip-172-31-93-26:~$ cat /etc/nginx/sites-enabled/nodepop-react

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
ubuntu@ip-172-31-93-26:~$ pm2 init simple

    File /home/ubuntu/ecosystem.config.js generated

ubuntu@ip-172-31-93-26:~$ ls -l

    total 12
    -rw-rw-r--  1 ubuntu ubuntu   83 Feb 24 16:34 ecosystem.config.js
    drwxrwxr-x 10 ubuntu ubuntu 4096 Feb 24 16:28 nodepop-api

# edito archivo
ubuntu@ip-172-31-93-26:~$ nano ecosystem.config.js

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

ubuntu@ip-172-31-93-26:~$ pm2 start ecosystem.config.js
    [PM2] Applying action restartProcessId on app [nodepop-api](ids: [ 0 ])
    [PM2] [nodepop-api](0) ✓
┌────┬────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name           │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ nodepop-api    │ default     │ 0.39.7  │ fork    │ 1887     │ 0s     │ 1    │ online    │ 0%       │ 17.9mb   │ ubuntu   │ disabled │
└────┴────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

# haciendo foto
ubuntu@ip-172-31-93-26:~$ pm2 save
    [PM2] Saving current process list...
    [PM2] Successfully saved in /home/ubuntu/.pm2/dump.pm2

# arranco
ubuntu@ip-172-31-93-26:~$ pm2 startup
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.11.1/bin /home/ubuntu/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# ejecuto comando PATH
ubuntu@ip-172-31-93-26:~$ sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.11.1/bin /home/ubuntu/.nvm/versions/node/v20.11.1/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

http://34.228.68.224/adverts -> funcionando correctamente!!!

```sh
#######################
# elimino puerto 3000 #
#######################
```

Siempre es buena idea después de hacer cambios en la configuración de servicios como Nginx:

* Verificar el Estado del Servicio: Comprobar que el servicio se está ejecutando correctamente con `sudo systemctl status nginx`.
* Probar la Configuración de Nginx: Asegurarse de que la configuración de Nginx es correcta con `sudo nginx -t` antes de reiniciar el servicio.
* Revisar los Logs: Mantener una vista en los logs de Nginx con `tail -f /var/log/nginx/error.log` puede ser útil para atrapar errores inmediatamente después de reiniciar el servicio o intentar acceder a la aplicación.

#### Archivos estáticos de la aplicación

El proyecto, cuando ejecutas el comando `npm run build` o `yarn build`, compila la aplicación y genera una carpeta `build` con todos los archivos necesarios para producción, incluyendo HTML, CSS, JavaScript y activos estáticos como imágenes. No se mantiene la misma estructura de directorios que tienes en desarrollo (como la carpeta public), pero todos los archivos necesarios están incluidos en la carpeta build.

La carpeta build (o dist en algunos otros setups) es la que sirves con `Nginx`. Los archivos estáticos ya están incorporados dentro de los subdirectorios correspondientes y los archivos HTML, CSS, y JavaScript ya tienen los caminos correctos entre ellos.

Dado que cuando ejecutas el comando `npm run build` o `yarn build`, por defecto pone todos los activos estáticos en la carpeta static, tu configuración de Nginx ya debería funcionar correctamente para servir estos archivos, como se indica en la sección location de tu configuración de Nginx:

![](/deployment_2_AWS/img/1.png)

