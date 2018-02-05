import {Server} from 'app/server/interface/server';
import * as loopback from 'loopback';
import * as boot from 'loopback-boot';

let App: Server = loopback();

module.exports = App;
export = App;

App.start = () => {
  return App.listen(() => {
    App.emit('started');
    let baseUrl = App.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (App.get('loopback-component-explorer')) {
      let explorerPath = App.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(
  App,
  {
    'appRootDir': __dirname
  },
  (err: Error) => {
    if (err) {
      throw err;
    }

    // start the server if `$ node server.js`
    if (require.main === module) {
      App.start();
    }
  }
);


if (process.env.NODE_ENV === 'development') {
  // kill process when nodemon requests shutdown
  // to fix issue with: Error: listen EADDRINUSE 0.0.0.0:8080
  // https://github.com/remy/nodemon#controlling-shutdown-of-your-script
  process.once('SIGUSR2', () => process.kill(process.pid, 'SIGUSR2'));
}
