import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import * as App from 'app/server/server';

import {UserUtils} from 'app/test/utils/userUtils';
import * as userMock from 'app/test/fixtures/models/user';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';


@suite('Server - Routes - User - FollowTest')
export class FollowTest extends BaseRouteTest {

  private static Follower: User;
  private static Login: {user: User, token: AccessToken};

  static before(done) {
    BaseRouteTest.before(serverError => {
      if (serverError) {
        return done(serverError);
      }

      App.models.user.create(userMock.get(1)[0])
        .then(created => {
          FollowTest.Follower = created;
        })
        .then(() => UserUtils.registerUser())
        .then(login => FollowTest.Login = login)
        .then(() => done())
        .catch(done);
    });
  }

  @test('should require auth to follow user')
  test_not_auth_like(done) {
    this.getApiClient()
      .post(`/Users/${FollowTest.Follower.id}/followers/follow`)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should follow user')
  test_valid_follow(done) {
    this.getApiClient()
      .post(`/Users/${FollowTest.Follower.id}/followers/follow`)
      .set({Authorization: FollowTest.Login.token.id})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should inject followersCount on user\'s public profile get')
  test_followersCount(done) {
    this.getApiClient()
      .get(`/users/${FollowTest.Follower.username}/profile`)
      .set({Authorization: FollowTest.Login.token.id})
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.have.property('followersCount');
        expect(res.body.followersCount).to.equal(1);
      })
      .end(done);
  }

  @test('should return duplicate error')
  test_dupe_follow(done) {
    this.getApiClient()
      .post(`/Users/${FollowTest.Follower.id}/followers/follow`)
      .set({Authorization: FollowTest.Login.token.id})
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body.error.name).to.equal('ValidationError');
      })
      .end(done);
  }

  @test('should return followers')
  test_followers(done) {
    this.getApiClient()
      .get(`/Users/${FollowTest.Follower.id}/followers`)
      .set({Authorization: FollowTest.Login.token.id})
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(1);
      })
      .end(done);
  }

  @test('should inject isFollowing = true')
  test_isFollowing_true_inject(done) {
    this.getApiClient()
      .get(`/users/${FollowTest.Follower.username}/profile`)
      .set({Authorization: FollowTest.Login.token.id})
      .expect(200)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body).to.have.property('isFollowing');
        expect(res.body.isFollowing).to.be.true;
      })
      .end(done);
  }

  @test('should inject isFollowing = false for non authenticated user')
  test_isFollowing_false_non_auth_inject(done) {
    this.getApiClient()
      .get(`/users/${FollowTest.Follower.username}/profile`)
      .expect(200)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body).to.have.property('isFollowing');
        expect(res.body.isFollowing).to.be.false;
      })
      .end(done);
  }

  @test('should require auth to unfollow user')
  test_not_auth_unfollow(done) {
    this.getApiClient()
      .delete(`/Users/${FollowTest.Follower.id}/followers/follow`)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should unfollow user')
  test_unfollow(done) {
    this.getApiClient()
      .delete(`/Users/${FollowTest.Follower.id}/followers/follow`)
      .set({Authorization: FollowTest.Login.token.id})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should return follow not found on already unfollow user')
  test_unfollow_not_found(done) {
    this.getApiClient()
      .delete(`/Users/${FollowTest.Follower.id}/followers/follow`)
      .set({Authorization: FollowTest.Login.token.id})
      .expect(409)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should inject isFollowing = false')
  test_isFollowing_false_inject(done) {
    this.getApiClient()
      .get(`/users/${FollowTest.Follower.username}/profile`)
      .set({Authorization: FollowTest.Login.token.id})
      .expect(200)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body).to.have.property('isFollowing');
        expect(res.body.isFollowing).to.be.false;
      })
      .end(done);
  }
}
