import {Comment} from 'app/interface/comment';
import * as App from 'app/server/server';

export class CommentRepository {

  /**
   * @param {Comment} activity
   * @returns {Promise<Comment[]>}
   */
  public create(activity: Comment): Promise<Comment> {
    return App.models.Comment.create(activity);
  }

  /**
   * @param {Comment[]} activities
   * @returns {Promise<Comment[]>}
   */
  public createMany(activities: Comment[]): Promise<Comment[]> {
    return App.models.Comment.create(activities);
  }

  /**
   * @param {string} id
   * @param {Object} filter
   * @returns {any}
   */
  public findById(id: string, filter?: Object): Promise<Comment> {
    if (filter) {
      return App.models.Comment.findById(id, filter);
    }

    return App.models.Comment.findById(id);
  }

  /**
   * @param {Object} filter
   * @returns {any}
   */
  public find(filter: Object): Promise<Comment[]> {
    return App.models.Comment.find(filter);
  }

  /**
   * @param {Object} filter
   * @returns {any}
   */
  public findByFilter(filter: Object): Promise<Comment[]> {
    return App.models.Comment.find(filter);
  }

}
