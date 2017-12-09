import {Promise} from 'es6-promise';
import {ServerError} from 'app/error/serverError';
import {Server} from 'app/server/interface/server';
import {User} from 'app/models/interface/user';
import {AccessToken} from 'app/models/interface/accessToken';
import {Contact} from 'app/models/interface/contact';

/**
 * @class EmailService
 */
export class EmailService {

  /**
   * @const
   * @type {string}
   */
  private static readonly ACCOUNT_DELETE_EMAIL_SUBJECT = 'Account delete request';

  /**
   * @const
   * @type {string}
   */
  private static readonly ACCOUNT_DELETE_EMAIL_TEMPLATE = 'app/templates/email/account-delete-email.ejs';

  /**
   * @const
   * @type {string}
   */
  private static readonly ACCOUNT_DELETE_CONFIRMATION_EMAIL_SUBJECT = 'Account delete confirmation';

  /**
   * @const
   * @type {string}
   */
  private static readonly ACCOUNT_DELETE_CONFIRMATION_EMAIL_TEMPLATE = 'app/templates/email/account-delete-confirmation-email.ejs';

  /**
   * @const
   * @type {string}
   */
  private static readonly WELCOME_EMAIL_SUBJECT = 'Thanks for registering.';

  /**
   * @const
   * @type {string}
   */
  private static readonly WELCOME_EMAIL_TEMPLATE = 'app/templates/email/welcome-email.ejs';

  /**
   * @const
   * @type {string}
   */
  private static readonly PASSWORD_RESET_EMAIL_SUBJECT = 'Password reset';

  /**
   * @const
   * @type {string}
   */
  private static readonly PASSWORD_RESET_EMAIL_TEMPLATE = 'app/templates/email/password-reset-email.ejs';

  /**
   * @const
   * @type {string}
   */
  private static readonly CONTACT_US_EMAIL_SUBJECT = 'Contact us';

  /**
   * @const
   * @type {string}
   */
  private static readonly CONTACT_US_EMAIL_TEMPLATE = 'app/templates/email/contact-us-email.ejs';

  /**
   * send's welcome email
   * @param {Server} app loopback app
   * @param {User} user newly registered user
   * @returns {Promise}
   */
  public static sendWelcomeEmail(app: Server, user: User): Promise<void> {
    if (user.type !== 'user') {
      return Promise.resolve<void>();
    }

    return new Promise<void>((resolve, reject) => {
      let template = app.loopback.template(EmailService.WELCOME_EMAIL_TEMPLATE);
      let html = template({
        user: user,
        host: `http://${app.get('domain')}`
      });
      app.models.Email.send({
        to: user.email,
        from: app.get('email'),
        subject: EmailService.WELCOME_EMAIL_SUBJECT,
        html: html
      }, function (err: Error) {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  /**
   * sends password reset email with reset url within
   * @param {Server} app loopback app
   * @param {User} user resetting the password
   * @param {AccessToken} accessToken token which was created by reset request
   * @returns {Promise}
   */
  public static sendPasswordResetEmail(app: Server, user: User, accessToken: AccessToken): Promise<void> {
    return new Promise<void>(resolve => {
      let resetUri = `http://${app.get('domain')}/user/password/reset?token=${accessToken.id}`;
      let template = app.loopback.template(EmailService.PASSWORD_RESET_EMAIL_TEMPLATE);
      let html = template({
        resetUri: resetUri
      });
      app.models.Email.send({
        to: user.email,
        from: app.get('email'),
        subject: EmailService.PASSWORD_RESET_EMAIL_SUBJECT,
        html: html
      }, () => resolve());
    });
  }

  /**
   * send's email with unique url to delete account
   * @param {Server} app loopback app
   * @param {string} id user's id
   * @returns {Promise}
   */
  public static sendAccountDeleteEmail(app: Server, id: string): Promise<void> {
    return app.models.user.findById(id)
      .then(user => {
        if (!user) {
          return Promise.reject(new ServerError('User not found', 404));
        }

        // create a temporary token
        return user.accessTokens.create({})
          .then(token => {
            let apiUrl = `http://${app.get('domain')}:${app.get('port')}${app.get('restApiRoot')}`;
            let deleteUri = `${apiUrl}/users/delete?token=${token.id}`;
            let template = app.loopback.template(EmailService.ACCOUNT_DELETE_EMAIL_TEMPLATE);
            let html = template({
              deleteUri: deleteUri
            });

            return new Promise((resolve, reject) => {
              app.models.Email.send({
                to: user.email,
                from: app.get('email'),
                subject: EmailService.ACCOUNT_DELETE_EMAIL_SUBJECT,
                html: html
              }, err => {
                if (err) {
                  return reject(err);
                }
                resolve();
              });
            });
          });
      });
  }

  /**
   * send's email with confirmation of account delete
   * @param {Server} app loopback app
   * @param {User} user already deleted user
   * @returns {Promise}
   */
  public static sendAccountDeleteConfirmationEmail(app: Server, user: User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let host = `http://${app.get('domain')}`;
      let template = app.loopback.template(EmailService.ACCOUNT_DELETE_CONFIRMATION_EMAIL_TEMPLATE);
      let html = template({
        host: host
      });
      app.models.Email.send({
        to: user.email,
        from: app.get('email'),
        subject: EmailService.ACCOUNT_DELETE_CONFIRMATION_EMAIL_SUBJECT,
        html: html
      }, err => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  /**
   * sends contact us email to system
   * @param {Server} app loopback app
   * @param {Contact} contact
   * @returns {Promise}
   */
  public static sendContactUsEmail(app: Server, contact: Contact): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let template = app.loopback.template(EmailService.CONTACT_US_EMAIL_TEMPLATE);
      let html = template({
        name: contact.name,
        email: contact.email,
        message: contact.message,
        phone: contact.phone
      });
      app.models.Email.send({
        to: app.get('email'),
        from: contact.email,
        subject: EmailService.CONTACT_US_EMAIL_SUBJECT,
        html: html
      }, err => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }
}
