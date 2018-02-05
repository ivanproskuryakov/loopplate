import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';

import * as commentMock from 'app/test/fixtures/models/comment';
import * as activityMock from 'app/test/fixtures/models/activity';
import { UserUtils } from 'app/test/utils/userUtils';
import { ActivityUtils } from 'app/test/utils/activityUtils';
import { UserServiceTest } from 'app/test/models/service/userService.test';

import * as App from 'app/server/server';
import { CommentService } from 'app/models/service/commentService';
import { User } from 'app/interface/user/user';
import { AccessToken } from 'app/interface/accessToken';
import { Comment } from 'app/interface/comment';

@suite('Service - CommentServiceTest')
export class CommentServiceTest {

  private static Comment: Comment;
  private static Reply: Comment;
  private static Login: { user: User, token: AccessToken };

  static before() {

    return UserUtils.registerUser()
      .then(login => CommentServiceTest.Login = login)
      .then(() => App.models.Comment.create(commentMock.get(1, CommentServiceTest.Login.user.id, 'some id')[0]))
      .then(result => CommentServiceTest.Comment = result)
      .then(() => {
        return App.models.Comment.create(commentMock.get(1,
          CommentServiceTest.Login.user.id, 'some id', CommentServiceTest.Comment.id)[0]);
      })
      .then(result => CommentServiceTest.Reply = result);
  }

  @test('should create slugs')
  test_create_slugs() {

    return CommentService.getSlugs(CommentServiceTest.Comment)
      .then(({slug, fullSlug}) => {
        expect(slug).to.exist;
        expect(fullSlug).to.exist;
      });
  }

  @test('should create reply slugs')
  test_create_reply_slugs() {

    return CommentService.getSlugs(CommentServiceTest.Reply)
      .then(({slug, fullSlug}) => {
        expect(slug).to.exist;
        expect(fullSlug).to.exist;

        expect(slug).to.contain(CommentServiceTest.Comment.slug);
        expect(fullSlug).to.contain(CommentServiceTest.Comment.fullSlug);
      });
  }

  @test('should inject reply to user')
  test_inject_reply_to_user() {
    let comment = CommentServiceTest.Reply.toJSON();

    return CommentService.injectReplyToUser(
      comment,
      CommentServiceTest.Login.user)
      .then(() => {
        UserServiceTest.isPublicProfile(comment.replyTo);
      });
  }

  @test('should inject null on non reply comment')
  test_inject_reply_to_null() {
    let comment = CommentServiceTest.Comment.toJSON();

    return CommentService.injectReplyToUser(
      comment,
      CommentServiceTest.Login.user)
      .then(() => {
        expect(comment.replyTo).to.not.exist;
      });
  }

  @test('should inject comments')
  test_inject_comments() {
    const CommentsCount = 3;

    return App.models.Activity.create(
      activityMock.get(1, null, null, null, CommentServiceTest.Login.user.id)[0]
    ).then(result => {
      let activity = result.toJSON();

      return ActivityUtils.createComments(activity, CommentsCount, activity.userId)
        .then(() => CommentService.injectComments(activity, null))
        .then(() => {
          expect(activity).to.exist;
          expect(activity.comments).to.have.length(CommentsCount);
          (<any>activity.comments).forEach(comment => {
            expect(comment).to.exist;
            UserServiceTest.isPublicProfile(comment.user);
          });
        });
    });
  }
}
