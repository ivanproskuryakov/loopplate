import {Promise} from 'es6-promise';
import {EmailService} from 'app/service/emailService';
import {Server} from 'app/server/interface/server';

export class ContactEvent {

  /**
   * after save handler
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
