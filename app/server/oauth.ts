import {Server} from 'app/server/interface/server';

export = function (app: Server) {
  let root = `http://${app.get('domain')}:${app.get('port')}`;

  return {
    'facebook-login': {
      'provider': 'facebook',
      'module': 'passport-facebook',
      'clientID': app.get('oauth').facebook.clientId,
      'clientSecret': app.get('oauth').facebook.clientSecret,
      'callbackURL': root + '/auth/facebook/callback',
      'authPath': '/auth/facebook',
      'callbackPath': '/auth/facebook/callback',
      'successRedirect': '/auth/account/success',
      'failureRedirect': '/auth/account/failure',
      'scope': [
        'public_profile', 'email'
      ],
      'profileFields': ['id', 'email', 'gender', 'is_verified', 'name', 'verified', 'cover', 'link', 'picture'],
      'session': 'false'
    },
    'google-login': {
      'provider': 'google',
      'module': 'passport-google-oauth',
      'strategy': 'OAuth2Strategy',
      'clientID': app.get('oauth').google.clientId,
      'clientSecret': app.get('oauth').google.clientSecret,
      'callbackURL': root + '/auth/google/callback',
      'authPath': '/auth/google',
      'callbackPath': '/auth/google/callback',
      'successRedirect': '/auth/account/success',
      'failureRedirect': '/auth/account/failure',
      'scope': [
        'email',
        'profile'
      ],
      'session': 'false'
    }
  };
};
