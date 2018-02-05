import {createHmac, randomBytes, HexBase64Latin1Encoding} from 'crypto';
import * as cookieParser from 'cookie-parser';
import slug = require('slug');
import {Server} from 'app/server/interface/server';
import {ServerError} from 'app/error/serverError';
import {User} from 'app/interface/user/user';

export class Passport {

  /**
   * @type {string}
   */
  private readonly PASSWORD = 'password';

  /**
   * @param {Server} app
   */
  constructor(private app: Server) {
  }

  public register(): void {
    this.configureSocialProviders();
    this.registerSocialCallbacks();
  }

  private configureSocialProviders(): void {
    let providers = require('app/server/oauth')(this.app);

    // set cookie parser, to parse cookies from passport- success redirect
    this.app.use(cookieParser(this.app.get('cookieSecret')));

    // Passport configurators..
    let loopbackPassport = require('loopback-component-passport');
    let PassportConfigurator = loopbackPassport.PassportConfigurator;
    let passportConfigurator = new PassportConfigurator(this.app);

    passportConfigurator.init();
    passportConfigurator.setupModels({
      userModel: this.app.models.user,
      userIdentityModel: this.app.models.userIdentity,
      userCredentialModel: this.app.models.userCredential,
    });

    // configure each provider
    Object.keys(providers).forEach((name: string) => {
      let config = providers[name];

      config.session = config.session !== false;
      config.profileToUser = (provider, profile, options) => this.profileToUser(provider, profile, options);

      passportConfigurator.configureProvider(name, config);
    });
  }

  private registerSocialCallbacks() {
    let root = `http://${this.app.get('domain')}:${this.app.get('port')}`;

    this.app.get('/auth/account/success', function (req, res) {
      // extract cookies from signedCookies set by loopback-component-passport
      // extract redirect url from config
      let redirectTo = root
        + `/user/login/social/`
        + `?access_token=${req.signedCookies.access_token}`
        + `&user=${req.signedCookies.userId}`;

      res.redirect(redirectTo);
    });

    this.app.get('/auth/account/failure', function (req, res, next) {
      return next(new ServerError('Authorization Error', 401));
    });
  }


  /**
   * @link https://github.com/strongloop/loopback-component-passport/blob/master/lib/models/user-identity.js#L55
   * @param {string} provider name
   * @param {object} profile from social network
   * @param {object} options provider options
   * @returns {User} user model
   */
  private profileToUser(provider: string, profile: any, options: any): User {
    let password = this.generatePassword(this.PASSWORD);
    let id = profile.id;
    let email = profile.emails && profile.emails[0] && profile.emails[0].value;
    let firstName = profile.name && profile.name.givenName;
    let lastName = profile.name && profile.name.familyName;
    let middleName = profile.name && profile.name.middleName;
    let username = slug(firstName + lastName + id);

    // Let's create a user for that
    return {
      username: username,
      password: password,
      email: email,
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      type: 'user'
    };
  }

  /**
   * @link https://github.com/strongloop/loopback-component-passport/blob/master/lib/models/utils.js#L37
   * @param {String} hmacKey The hmac key, default to 'loopback'
   * @param {String} algorithm The algorithm, default to 'sha1'
   * @param {String} encoding The string encoding, default to 'hex'
   * @returns {String} The generated key
   */
  private generatePassword(hmacKey: string, algorithm?: string, encoding?: HexBase64Latin1Encoding): string {
    algorithm = algorithm || 'sha1';
    encoding = encoding || 'hex';

    let hmac = createHmac(algorithm, hmacKey);
    let buf: Buffer = randomBytes(32);
    hmac.update(buf);
    return hmac.digest(encoding);
  }
}
