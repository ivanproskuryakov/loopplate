import * as App from 'app/server/server';

import {User} from 'app/interface/user/user';
import {Activity} from 'app/interface/activity/activity';
import {Comment} from 'app/interface/comment';
import {ActivityRepository} from 'app/models/repository/activityRepository';
import {UserRepository} from 'app/models/repository/userRepository';
import {CommentRepository} from 'app/models/repository/commentRepository';
import {join} from "path";

export class Cleanup {
  /**
   * @const
   */
  private readonly SEED_DIRECTORY = join(__dirname, '../../data/seed/');


  /**
   * @returns {Promise}
   */
  public start(): Promise<any[]> {
    return this
      .recreate('user')
      .then(() => this.recreate('userIdentity'))
      .then(() => this.recreate('Activity'))
      .then(() => this.recreate('Comment'))

      .then(() => this.createUser())
      .then(user => this.createActivities(user))
      .then(activities => this.createComments(activities))
  }

  /**
   * @returns {Promise<User>}
   */
  private createUser(): Promise<User> {
    let user: User = require(`${this.SEED_DIRECTORY}/user.json`);
    let userRepository = new UserRepository();

    return userRepository.createForcing(user);
  }

  /**
   * @returns {Promise<Activity[]>}
   */
  private createActivities(user: User): Promise<Activity[]> {
    let activities: Activity[] = require(`${this.SEED_DIRECTORY}/activity.json`);
    let activityRepository = new ActivityRepository();

    activities.map(activity => {
      activity.userId = user.id
    });

    return activityRepository.createMany(activities);
  }


  /**
   * @returns {Promise<Comment[]>}
   */
  private createComments(activities: Activity[]): Promise<Comment[]> {
    const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

    let comments: Comment[] = require(`${this.SEED_DIRECTORY}/comment.json`);
    let commentRepository = new CommentRepository();

    comments.map(comment => {
      activities.map(activity => {
        comment.userId = activity.userId;
        comment.activityId = activity.id;
        comment.createdAt = new Date(Date.now() - (DAY_IN_MILLISECONDS * 4));
      });
    });

    return commentRepository.createMany(comments);
  }

  /**
   * @param {string} collection name of collection
   * @returns {Promise}
   */
  private recreate(collection: string): Promise<void> {
    return App.dataSources.mongo
      .automigrate(collection)
      .then(() => Promise.resolve())
      .catch((err: Error) => {
        console.log(err);

        return Promise.resolve()
      });
  }

}
