import {Promise} from 'es6-promise';
import * as bluebird from 'bluebird';

const moment = require('moment');
let randomstring = require('randomstring');

import {Comment} from 'app/interface/comment';
import {CommentRepository} from 'app/models/repository/commentRepository';
import {Activity} from 'app/interface/activity/activity';
import {User} from 'app/interface/user/user';
import {UserService} from 'app/models/service/user/userService';

export class CommentService {

  /**
   * @static
   * @param {Comment} comment
   * @returns {Promise<{slug: string, fullSlug: string}>}
   */
  public static getSlugs(comment: Comment): Promise<{ slug: string, fullSlug: string }> {
    let commentRepository = new CommentRepository();

    return new Promise<{ slug: string, fullSlug: string }>(resolve => {
      // generate initial slugs
      let slug = randomstring.generate(5);
      let fullSlug = `${moment(comment.createdAt || new Date()).format('YYYY.MM.DD.HH.mm.ss')}:${slug}`;

      resolve({slug: slug, fullSlug: fullSlug});
    })
      .then(result => {
        if (!comment.replyOnId) {
          return Promise.resolve(result);
        }

        // add parent slugs to initially generated slugs
        return commentRepository.findById(comment.replyOnId)
          .then((parent: Comment) => {
            result.slug = `${parent.slug}/${result.slug}`;
            result.fullSlug = `${parent.fullSlug}/${result.fullSlug}`;

            return Promise.resolve(result);
          });
      });
  }

  /**
   * @static
   * @param {Comment} comment
   * @param {User} currentUser
   * @returns {Promise}
   */
  public static injectReplyToUser(comment: Comment, currentUser: User): Promise<void> {
    if (!comment.replyOnId) {
      return Promise.resolve<void>(null);
    }
    let commentRepository = new CommentRepository();

    return commentRepository.findById(comment.replyOnId, {
      fields: ['userId']
    })
      .then(replyOn => UserService.getUserProfile(null, replyOn.userId, currentUser))
      .then(replyTo => {
        comment.replyTo = replyTo;
      });
  }

  /**
   * @static
   * @param {Activity} activity
   * @param {User} currentUser
   * @returns {Promise}
   */
  public static injectComments(activity: Activity, currentUser: User): Promise<Activity> {
    let commentRepository = new CommentRepository();

    return commentRepository
      .find({
        where: {activityId: activity.id}
      })
      .then(comments => bluebird.map(
        comments,
        (comment: Comment) => {
          let commentJson = comment.toJSON();

          return bluebird.all([
            CommentService.injectReplyToUser(commentJson, currentUser),
            UserService.injectUserProfile(commentJson, currentUser)
          ])
            .then(() => commentJson);
        },
        {concurrency: 10}
      ))
      .then((comments: any) => {
        activity.comments = comments;

        return activity;
      });
  }
}
