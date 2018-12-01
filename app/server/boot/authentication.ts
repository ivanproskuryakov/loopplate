import {Passport} from 'app/server/oauth/passport';

export = function enableAuthentication(app) {
  // enable authentication
  app.enableAuth();

  app.middleware('auth', app.loopback.token({
    model: app.model['accessToken']
  }));

  new Passport(app).register();

};
