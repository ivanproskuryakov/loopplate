import {Promise} from 'es6-promise';
import {ActivityService} from 'app/models/service/activity/activityService';
import {UserService} from 'app/models/service/user/userService';
import {StringHelper} from 'app/helper/stringHelper';
import * as App from 'app/server/server';

export class MetaRendererService {
  /**
   * @const
   * @type {string}
   */
  private readonly META_TEMPLATE = 'app/templates/meta/index.ejs';
  /**
   * @property
   * @type {string}
   */
  private defaultTitle: string;
  /**
   * @property
   * @type {string}
   */
  private defaultDescription: string;

  /**
   * @constructor
   */
  constructor() {
    this.defaultTitle = App.get('meta').title;
    this.defaultDescription = App.get('meta').description;
  }

  /**
   * @returns {Promise<string>}
   */
  public renderIndex(): Promise<string> {

    return new Promise(resolve => {
      let html = this.generateHTML({
        title: this.defaultTitle,
        description: this.defaultDescription,
        keywords: '',
      });

      resolve(html);
    });
  }

  /**
   * @param {string} slug
   * @returns {Promise<string>}
   */
  public renderActivity(slug: string): Promise<string> {

    return ActivityService
      .getActivities({where: {slug: slug}}, null)
      .then(activities => {
        if (!activities || activities.length === 0) {
          // if activity not founded then return default metas
          return this.renderIndex();
        }

        let activity: any = activities[0];
        let html = this.generateHTML({
          title: activity.name + ' - ' + this.defaultTitle,
          description: StringHelper.toText(activity.description).substring(0, 200) + ' - ' + this.defaultDescription,
          keywords: activity.tags.map(x => x.value).join(', '),
          og: {
            type: 'article',
            url: ActivityService.getActivityUrl(activity),
            image: ActivityService.getMainMediaUrl(activity, 'image'),
            publishedTime: activity.createdAt,
            author: activity.user.username,
            section: activity.category,
            tag: activity.tags.map(x => x.value)
          }
        });

        return Promise.resolve(html);
      });
  }

  /**
   * @param {string} username
   * @returns {Promise<string>}
   */
  public renderUser(username: string): Promise<string> {

    return UserService
      .getUser(username, null)
      .then(user => {
        let html = this.generateHTML({
          title: user.username + ' - ' + this.defaultTitle,
          description: user.username + ' - ' + (user.about || this.defaultDescription),
          keywords: user.username,
          og: {
            type: 'profile',
            url: UserService.getUserUrl(user),
            image: user.avatar ? user.avatar.location : null,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
          }
        });

        return Promise.resolve(html);
      });
  }

  /**
   * @param {Object} data
   * @returns {string}
   */
  private generateHTML(data: any): string {
    let template = App.loopback.template(this.META_TEMPLATE);

    return template(data);
  }
}
