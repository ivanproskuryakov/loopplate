import * as App from 'app/server/server';

export class EmailUtils {

  /**
   * get app's mailer object
   * @returns {Object}
   */
  public static getMailer(): any {
    return App.dataSources.mailgun.connector.transports[0].transporter;
  }

  /**
   * get app's mailer object
   * @returns {Object}
   */
  public static getLastSentEmail(): any {
    let mailer = EmailUtils.getMailer();
    return mailer.sentMail[mailer.sentMail.length - 1];
  }
}
