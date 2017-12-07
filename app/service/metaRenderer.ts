import {Promise} from 'es6-promise';
import {Server} from 'app/server/interface/server';
import {ActivityService} from 'app/service/activityService';
import {UserService} from 'app/service/userService';
import {StringHelper} from 'app/helper/stringHelper';

/**
 * MetaRendererService
 */
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
   * @param {Server} app
   */
  constructor(private app: Server) {
    this.defaultTitle = app.get('meta').title;
    this.defaultDescription = app.get('meta').description;
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
      .getActivities(this.app, {where: {slug: slug}}, null)
      .then(activities => {
        if (!activities || activities.length === 0) {
          // if activity not founded then return default metas
          return this.renderIndex();
        }

        let activity = activities[0];
        let html = this.generateHTML({
          title: activity.name + ' - ' + this.defaultTitle,
          description: StringHelper.toText(activity.description).substring(0, 200) + ' - ' + this.defaultDescription,
          keywords: activity.tags.map(x => x.value).join(', '),
          og: {
            type: 'article',
            url: ActivityService.getActivityUrl(this.app, activity),
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
      .getUser(this.app, username, null)
      .then(user => {
        let html = this.generateHTML({
          title: user.username + ' - ' + this.defaultTitle,
          description: user.username + ' - ' + (user.about || this.defaultDescription),
          keywords: user.username,
          og: {
            type: 'profile',
            url: UserService.getUserUrl(this.app, user),
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
    let template = this.app.loopback.template(this.META_TEMPLATE);

    return template(data);
  }
}
