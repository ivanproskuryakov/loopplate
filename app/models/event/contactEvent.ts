import {Promise} from 'es6-promise';
import {EmailService} from 'app/service/emailService';
import {Server} from 'app/server/interface/server';

/**
 * Events related methods for Contact model
 * @see https://docs.mongodb.com/ecosystem/use-cases/storing-comments/#one-document-per-comment
 * @author Nika Nikabadze
 */
export class ContactEvent {

  /**
   * contact model after save handler
   * send email when new instance of "contact" model is created
   * @param {Server} app
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onSaved(app: Server, ctx: any): Promise<void> {
    if (!ctx.instance || !ctx.isNewInstance) {
      return Promise.resolve<void>();
    }

    return EmailService.sendContactUsEmail(app, ctx.instance);
  }

}
