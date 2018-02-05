import {Promise} from 'es6-promise';
import {EmailService} from 'app/service/emailService';

/**
 * Events related methods for Contact model
 */
export class ContactEvent {

  /**
   * contact model after save handler
   * send email when new instance of "contact" model is created
   * @param {Object} ctx
   * @returns {Promise}
   */
  public static onSaved(ctx: any): Promise<void> {
    if (!ctx.instance || !ctx.isNewInstance) {
      return Promise.resolve<void>();
    }

    return EmailService.sendContactUsEmail(ctx.instance);
  }

}
