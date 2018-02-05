import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import {UserUtils} from 'app/test/utils/userUtils';
import * as activityMock from 'app/test/fixtures/models/activity';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';

import * as App from 'app/server/server';
import {Activity} from 'app/interface/activity/activity';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';


@suite('Server - Routes - Activity - LikesTest')
export class LikesTest extends BaseRouteTest {

  private static Activity: Activity;
  private static Login: {user: User, token: AccessToken};

  static before(done) {
    BaseRouteTest.before(serverError => {
      if (serverError) {
        return done(serverError);
      }

      UserUtils.registerUser()
        .then(login => LikesTest.Login = login)
        .then(() => App.models.Activity.create(activityMock.get(1, null, null, null, LikesTest.Login.user.id)[0]))
        .then(created => {
          LikesTest.Activity = created;
        })
        .then(() => done())
        .catch(done);
    });
  }

  @test('should require auth to like activity')
  test_not_auth_like(done) {
    this.getApiClient()
      .post(`/Activities/${LikesTest.Activity.id}/likes/like`)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should like activity')
  test_valid_like(done) {
    this.getApiClient()
      .post(`/Activities/${LikesTest.Activity.id}/likes/like`)
      .set({Authorization: LikesTest.Login.token.id})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should inject likesCount on activity get')
  test_likesCount(done) {
    this.getApiClient()
      .get(`/Activities/${LikesTest.Activity.id}`)
      .set({Authorization: LikesTest.Login.token.id})
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.have.property('likesCount');
        expect(res.body.likesCount).to.equal(1);
      })
      .end(done);
  }

  @test('should return duplicate error')
  test_dupe_like(done) {
    this.getApiClient()
      .post(`/Activities/${LikesTest.Activity.id}/likes/like`)
      .set({Authorization: LikesTest.Login.token.id})
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body.error.name).to.equal('ValidationError');
      })
      .end(done);
  }

  @test('should return likes')
  test_likes(done) {
    this.getApiClient()
      .get(`/Activities/${LikesTest.Activity.id}/likes`)
      .set({Authorization: LikesTest.Login.token.id})
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(1);
      })
      .end(done);
  }

  @test('should inject isLiked = true')
  test_isLiked_true_inject(done) {
    this.getApiClient()
      .get(`/Activities/${LikesTest.Activity.id}`)
      .set({Authorization: LikesTest.Login.token.id})
      .expect(200)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body).to.have.property('isLiked');
        expect(res.body.isLiked).to.be.true;
      })
      .end(done);
  }

  @test('should inject isLiked = false for non authenticated user')
  test_isLiked_false_non_auth_inject(done) {
    this.getApiClient()
      .get(`/Activities/${LikesTest.Activity.id}`)
      .expect(200)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body).to.have.property('isLiked');
        expect(res.body.isLiked).to.be.false;
      })
      .end(done);
  }

  @test('should require auth to dislike activity')
  test_not_auth_dislike(done) {
    this.getApiClient()
      .delete(`/Activities/${LikesTest.Activity.id}/likes/like`)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should dislike activity')
  test_dislike(done) {
    this.getApiClient()
      .delete(`/Activities/${LikesTest.Activity.id}/likes/like`)
      .set({Authorization: LikesTest.Login.token.id})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should return like not found on already disliked activity')
  test_dislike_not_found(done) {
    this.getApiClient()
      .delete(`/Activities/${LikesTest.Activity.id}/likes/like`)
      .set({Authorization: LikesTest.Login.token.id})
      .expect(409)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should inject isLiked = false')
  test_isLiked_false_inject(done) {
    this.getApiClient()
      .get(`/Activities/${LikesTest.Activity.id}`)
      .set({Authorization: LikesTest.Login.token.id})
      .expect(200)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body).to.have.property('isLiked');
        expect(res.body.isLiked).to.be.false;
      })
      .end(done);
  }
}
