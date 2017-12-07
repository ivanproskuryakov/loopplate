import {Passport} from 'app/server/oauth/passport';

export = function enableAuthentication(app) {
  // enable authentication
  app.enableAuth();

  app.middleware('auth', app.loopback.token({
    model: app.models.accessToken
  }));

  new Passport(app).register();

};
