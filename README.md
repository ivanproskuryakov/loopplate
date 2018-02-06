## Quick start
Build, launch server and watch for changes
```
gulp app:watch
``` 
Also, the line `0.0.0.0 dev.loopplate.com` added to yours `/etc/hosts` will add some meaning to your urls, 
where "dev.loopplate.com" is default domain on dev environment.


Running tests
```
npm test
```


## Detailed Description
NOTE: Boilerplate in active developing process. https://12factor.net/

### I. Codebase
Apps codebase contains both backend and frontend parts.
- Backend with its settings is located inside /app directory,
- /build directory is transpiled version of typescript running with node.js
- /data directory for backend assets, like the list of available countries used by the app.
- /public is where AnguarJS SPA located with needed assets and stylesheets.

### II. Dependencies
Backend dependencies controlled by NPM, bower used for the frontend, `package.json` and `bower.json` 
are the corresponding files with all needed dependencies, 
```npm install``` and ```bower install``` - common commands to install them.

### III. Config
Running environments: production, development and test.
A setting file for each environment located in app/server directory.
An official documentation technical aspects with needed details, see http://loopback.io/doc/en/lb3/Environment-specific-configuration.html


### IV. Backing services
MongoDb is a storage of choice, app can be converted to SQL based database since it's based on Looback's DAO.
For more info, see https://loopback.io/doc/en/lb3/Defining-data-sources.html.
Outbound emails are sent using mailgun that connected as a datasource and listed in datasources.json file.
Logs and errors are sent to sentry.io saas storage.


### V. Build, release, run
Builds done with https://github.com/shipitjs/shipit - it is simple, does the jobs and written on js.
Commands ```shipit production deploy``` and ```shipit staging deploy``` deploy production and staging accordingly.

On deployment git repo, and runs the commands in the following steps:
1. `npm install` - installs backend node dependencies on remote server
2. `npm rebuild node-sass` - rebuilding `node-sass` vendor otherwise node-sass is broken and can't be used
3. `bower install --allow-root` - frontend dependencies using bower
4. `gulp app:build`- the actual build of the app, once the required vendors are in place
5. `pm2 delete all` - kills/removes the actual node app and workers from the list, no mater if there any or not
6. `pm2 start pm2.json` - start the app and workers based on settings from pm2.json file
7. `node build/command/sitemap.js` - generates sitemap.xml file
8. In the end  update to slack


### VI. Processes
Commands needed both for dev and deployment made with gulp, see `gulpfile.js`.

- `gulp app:build` - build the app
- `gulp app:watch` - watch for changes both in frontend and backend codebase, compile, run "server:watch".
- `gulp server:watch` - launch server.js in background and restarts if changes were done in "/build" directory

Frontend:
- `gulp frontend:sass` - compile sass
- `gulp frontend:sass` - compile sass + watch for changes
- `gulp frontend:loopback` - generate Angular $resource services based on backend code, see https://github.com/strongloop/loopback-sdk-angular
- `gulp frontend:rjs` - compiles javascript into a single file using RequireJS
- `gulp frontend:templatecache` - concatenate and register AngularJS templates in the $templateCache
- `gulp frontend:clean` - concatenate and register AngularJS templates in the $templateCache

Backend:
- `gulp backend:symlink` - symlink /node_modules/app with /node_modules, needed for absolute paths
- `gulp backend:build` - clean and rebuild
- `gulp backend:watch` - watch for changes and recompile

Db:
- `mongodump_mongorestore.sh` - shell script to restore db from remote production to local development environment.


### VII. Port binding
 - Development: 8080
 - Production: 80
  
### VIII. Concurrency
Due the nature of Node event-loop repeatedly takes a one single event at the time, no JavaScript code is executed in parallel.
Parallelism can be achieved by starting several workers(server/server.js), see http://pm2.keymetrics.io/docs/usage/cluster-mode/

### IX. Disposability
pm2-start stop
http://pm2.keymetrics.io/docs/usage/signals-clean-restart/

### X. Dev/prod parity
Backup production database to your local frequently manually or using `mongodump_mongorestore.sh`, 
since manifest tells us to have identical production, development and environments.

### XI. Logs
On production logs go to sentry.io, development sends logs to console, test environment do not output any logs(mock).
winston npm library is used for logs transportation, https://github.com/winstonjs/winston       

### XII. Admin processes
`node build/command/sitemap.js` - generate sitemap.xml file.
`node build/command/sendSummary.js` - send summary email with a list of new users.
`node build/db/updateDataSources.js` - migration command to detect difference between DB and schema, alter DB schema to match schema.
`node build/db/cleanup.js` - truncate database and populates it with the demo data.
