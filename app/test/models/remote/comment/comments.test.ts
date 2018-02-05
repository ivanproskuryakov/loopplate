import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import * as App from 'app/server/server';
import {Activity} from 'app/interface/activity/activity';

import {UserUtils} from 'app/test/utils/userUtils';
import * as activityMock from 'app/test/fixtures/models/activity';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';


@suite('Server - Routes - Comment - CommentsTest')
export class CommentsTest extends BaseRouteTest {

  private static Activity: Activity;
  private static Login: {user: User, token: AccessToken};

  static before(done) {
    BaseRouteTest.before(serverError => {
      if (serverError) {
        return done(serverError);
      }

      App.models.Activity.create(activityMock.get(1)[0])
        .then(created => {
          CommentsTest.Activity = created;
        })
        .then(() => UserUtils.registerUser())
        .then(login => CommentsTest.Login = login)
        .then(() => done())
        .catch(done);
    });
  }

  @test('should comment on activity')
  test_valid_comment(done) {
    let comment = {
      text: 'test comment',
      activityId: CommentsTest.Activity.id
    };

    this.getApiClient()
      .post('/comments')
      .set({Authorization: CommentsTest.Login.token.id})
      .send(comment)
      .expect(201)
      .expect('Content-Type', /json/)
      .expect('Location', new RegExp(`^${BaseRouteTest.ApiAddress}/comments/`))
      .expect(res => expect(res.body).to.be.empty)
      .end(done);
  }

  @test('should throw "no activity id" error')
  test_no_activity_comment(done) {
    let comment = {
      text: 'test comment'
    };

    this.getApiClient()
      .post('/comments')
      .set({Authorization: CommentsTest.Login.token.id})
      .send(comment)
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body.error).to.exist;
        expect(res.body.error.name).to.equal('ValidationError');
        expect(res.body.error.details.messages.activityId[0]).to.equal('can\'t be blank');
      })
      .end(done);
  }

  @test('should throw "no text" error')
  test_no_text_comment(done) {
    let comment = {
      activityId: CommentsTest.Activity.id
    };

    this.getApiClient()
      .post('/comments')
      .set({Authorization: CommentsTest.Login.token.id})
      .send(comment)
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body.error).to.exist;
        expect(res.body.error.name).to.equal('ValidationError');
        expect(res.body.error.details.messages.text[0]).to.equal('can\'t be blank');
      })
      .end(done);
  }

  @test('should throw "unauthorized" error')
  test_unauthorized(done) {
    let comment = {
      text: 'test comment',
      activityId: CommentsTest.Activity.id
    };

    this.getApiClient()
      .post('/comments')
      .send(comment)
      .expect(401)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body.error).to.exist;
        // expect(res.body.error.message).to.equal('Authorization Required');
      })
      .end(done);
  }

  @test('should reply on comment')
  test_reply(done) {
    App.models.Comment.findOne({where: {activityId: CommentsTest.Activity.id}})
      .then(replyOn => {
        let comment = {
          text: 'test reply',
          activityId: CommentsTest.Activity.id,
          replyOnId: replyOn.id
        };

        this.getApiClient()
          .post('/comments')
          .set({Authorization: CommentsTest.Login.token.id})
          .send(comment)
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', new RegExp(`^${BaseRouteTest.ApiAddress}/comments/`))
          .expect(res => expect(res.body).to.be.empty)
          .end(done);
      })
      .catch(done);
  }

  @test('should return user in body')
  test_user_include(done) {
    App.models.Comment.findOne({where: {activityId: CommentsTest.Activity.id}})
      .then(comment => {
        this.getApiClient()
          .get(`/comments/${comment.id}`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => {
            expect(res.body).to.exist;
            expect(res.body.user).property('id').not.null;
            expect(res.body.user).property('username').not.null;
            expect(res.body.user).property('email').not.null;
          })
          .end(done);
      });
  }
}
