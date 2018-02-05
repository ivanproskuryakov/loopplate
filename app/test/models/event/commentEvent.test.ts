import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';

import { UserUtils } from 'app/test/utils/userUtils';
import * as commentMock from 'app/test/fixtures/models/comment';
import { HttpMock } from 'app/test/mock/httpMock';
import { UserServiceTest } from 'app/test/models/service/userService.test';

import * as App from 'app/server/server';
import { CommentEvent } from 'app/models/event/commentEvent';
import { Comment } from 'app/interface/comment';
import { User } from 'app/interface/user/user';
import { AccessToken } from 'app/interface/accessToken';

@suite('Models - Events - CommentEventTest')
export class CommentEventTest {

  private static Comment: Comment;
  private static Reply: Comment;
  private static Login: { user: User, token: AccessToken };

  static before(done) {
    UserUtils.registerUser()
      .then(login => CommentEventTest.Login = login)
      .then(() => App.models.Comment.create(commentMock.get(1, CommentEventTest.Login.user.id, 'some id')[0]))
      .then(result => CommentEventTest.Comment = result)
      .then(() => {
        return App.models.Comment.create(commentMock.get(1,
          CommentEventTest.Login.user.id, 'some id', CommentEventTest.Comment.id)[0]);
      })
      .then(result => CommentEventTest.Reply = result)
      .then(() => done())
      .catch(done);
  }

  @test('should not create slugs on updated comment')
  test_not_create_slugs(done) {
    let ctx = {
      instance: <Comment>{},
      isNewInstance: false
    };

    CommentEvent.onCommentSaving(App, ctx)
      .then(() => {
        expect(ctx.instance.slug).to.not.exist;
        expect(ctx.instance.fullSlug).to.not.exist;
      })
      .then(() => done())
      .catch(done);
  }

  @test('should create slugs on created comment')
  test_create_slugs(done) {
    let ctx = {
      instance: <Comment>{},
      isNewInstance: true
    };

    CommentEvent.onCommentSaving(App, ctx)
      .then(() => {
        expect(ctx.instance.slug).to.exist;
        expect(ctx.instance.fullSlug).to.exist;
      })
      .then(() => done())
      .catch(done);
  }

  @test('should inject values on onRemoteFindOne')
  test_inject_on_onRemoteFindOne(done) {
    let ctx = {
      result: CommentEventTest.Reply,
      req: HttpMock.createRequestByLogin(CommentEventTest.Login.user, CommentEventTest.Login.token)
    };

    CommentEvent.onRemoteFindOne(App, ctx)
      .then(() => {
        expect(ctx.result).to.exist;

        // replyTo
        UserServiceTest.isPublicProfile(ctx.result.replyTo);
        // user
        UserServiceTest.isPublicProfile(ctx.result.user);
      })
      .then(() => done())
      .catch(done);
  }

  @test('should inject values on onRemoteFindById')
  test_inject_on_onRemoteFindById(done) {
    let ctx = {
      result: CommentEventTest.Reply,
      req: HttpMock.createRequestByLogin(CommentEventTest.Login.user, CommentEventTest.Login.token)
    };

    CommentEvent.onRemoteFindById(App, ctx)
      .then(() => {
        expect(ctx.result).to.exist;

        // replyTo
        UserServiceTest.isPublicProfile(ctx.result.replyTo);
        // user
        UserServiceTest.isPublicProfile(ctx.result.user);
      })
      .then(() => done())
      .catch(done);
  }

  @test('should inject values on onRemoteFindOrCreate')
  test_inject_on_onRemoteFindOrCreate(done) {
    let ctx = {
      result: CommentEventTest.Reply,
      req: HttpMock.createRequestByLogin(CommentEventTest.Login.user, CommentEventTest.Login.token)
    };

    CommentEvent.onRemoteFindOrCreate(App, ctx)
      .then(() => {
        expect(ctx.result).to.exist;

        // replyTo
        UserServiceTest.isPublicProfile(ctx.result.replyTo);
        // user
        UserServiceTest.isPublicProfile(ctx.result.user);
      })
      .then(() => done())
      .catch(done);
  }

  @test('should inject values on onRemoteFind')
  test_inject_on_onRemoteFind(done) {
    let ctx = {
      result: [CommentEventTest.Reply],
      req: HttpMock.createRequestByLogin(CommentEventTest.Login.user, CommentEventTest.Login.token)
    };

    CommentEvent.onRemoteFind(App, ctx)
      .then(() => {
        expect(ctx.result[0]).to.exist;

        // replyTo
        UserServiceTest.isPublicProfile(ctx.result[0].replyTo);
        // user
        UserServiceTest.isPublicProfile(ctx.result[0].user);
      })
      .then(() => done())
      .catch(done);
  }

}
