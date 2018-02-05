import {suite, test, skip} from 'mocha-typescript';
import {expect} from 'chai';
import {Promise} from 'es6-promise';

import * as faker from 'faker';
import {HttpMock} from 'app/test/mock/httpMock';
import {UserUtils} from 'app/test/utils/userUtils';
import {EmailUtils} from 'app/test/utils/emailUtils';
import * as usersMock from 'app/test/fixtures/models/user';
import * as tokensMock from 'app/test/fixtures/models/accessToken';
import * as commentsMock from 'app/test/fixtures/models/comment';
import * as activitiesMock from 'app/test/fixtures/models/activity';
import * as userIdentitiesMock from 'app/test/fixtures/models/userIdentity';

import * as App from 'app/server/server';
import {ServerError} from 'app/error/serverError';
import {UserService} from 'app/models/service/user/userService';
import {EmailService} from 'app/service/emailService';

@suite('Service - UserService')
export class UserServiceTest {

  public static isPublicProfile(profile): void {
    expect(profile).to.exist;
    expect(profile.id).to.exist;
    expect(profile.username).to.exist;
    expect(profile.email).to.exist;
    expect(profile.password).to.not.exist;
    expect(profile.followersCount).to.exist;
    expect(profile.followersCount).to.be.a('number');
    expect(profile.isFollowing).to.exist;
    expect(profile.isFollowing).to.be.a('boolean');
    expect(profile.followingsCount).to.exist;
    expect(profile.followingsCount).to.be.a('number');
    expect(profile.activitiesCount).to.exist;
    expect(profile.activitiesCount).to.be.a('number');
  }

  public static isUser(user): void {
    expect(user).to.exist;
    expect(user.id).to.exist;
    expect(user.username).to.exist;
    expect(user.email).to.exist;
  }


  @test('should get deleted user')
  test_get_deleted_user() {
    let user = UserService.getDeletedUser();

    expect(user.username).to.equal(UserService.DELETED_USERNAME);
    expect(user.password).to.not.exist;
    expect(user.type).to.not.exist;
    expect(user.email).to.not.exist;
  }

  @test('should test password & confirmation on password reset')
  test_password_confirm() {
    let token = '';
    let password = faker.internet.password();
    let confirmation = faker.internet.password();

    return UserService.resetPassword(token, password, confirmation)
      .then(() => Promise.reject(new Error('passwords do not match should not pass')))
      .catch((err: ServerError) => {
        expect(err).to.exist;
        expect(err.message).to.equal('Passwords do not match');
        expect(err.statusCode).to.equal(400);

        return Promise.resolve();
      });
  }

  @test('should test token on password reset')
  test_token() {
    let token = 'some invalid token';
    let password = faker.internet.password();

    return UserService.resetPassword(token, password, password)
      .then(() => Promise.reject(new Error('invalid token should not pass')))
      .catch((err: ServerError) => {
        expect(err).to.exist;
        expect(err.message).to.equal('Token not found');
        expect(err.statusCode).to.equal(404);

        return Promise.resolve();
      });
  }

  @test('should test user on password reset')
  test_user() {

    return App.models.accessToken.create({userId: 'invalid id'})
      .then(token => {
        let password = faker.internet.password();

        return UserService.resetPassword(token.id, password, password);
      })
      .then(() => Promise.reject(new Error('invalid user should not pass')))
      .catch((err: ServerError) => {
        expect(err).to.exist;
        expect(err.message).to.equal('User not found');
        expect(err.statusCode).to.equal(404);

        return Promise.resolve();
      });
  }

  @test('should reset password')
  test_reset() {

    return UserUtils.registerUser()
      .then(({user, token}) => {
        let password = faker.internet.password();

        return UserService.resetPassword(token.id, password, password)
          .then(update => {
            expect(user.password).to.not.equal(update.password);
          });
      });
  }

  @test('should test domain on website user password reset')
  test_domain() {
    let email = faker.internet.email();

    return UserService.requestWebsiteUserReset(email)
      .then(() => Promise.reject(new Error('invalid email should not pass')))
      .catch((err: ServerError) => {
        expect(err).to.exist;
        expect(err.message).to.equal('User not found');
        expect(err.statusCode).to.equal(404);

        return Promise.resolve();
      });
  }

  @test('should test email sent on website user password reset')
  test_email() {
    let domain = faker.internet.domainName();
    let websiteUser = usersMock.user(null, 'website',
      `${UserService.WEBSITE_USER_DEFAULT_USERNAME}@${domain}`);
    let requestedByEmail = faker.internet.email(null, null, domain);

    return UserUtils.createUser(websiteUser)
      .then(user => {

        return UserService.requestWebsiteUserReset( requestedByEmail)
          .then(() => UserUtils.findUserLatestToken(user))
          .then(token => {
            let email = EmailUtils.getLastSentEmail();

            expect(email).to.exist;
            expect(email.data.to).to.equal(requestedByEmail);
            expect(email.data.from).to.equal(App.get('email'));
            expect(email.data.subject).to.equal((<any>EmailService).PASSWORD_RESET_EMAIL_SUBJECT);
            expect(email.data.html).to.contain(App.get('domain'));
            expect(email.data.html).to.contain(token.id);
          });
      });
  }

  @test('should get public profile by id')
  test_public_profile_by_id() {
    return UserUtils.createUser(usersMock.user())
      .then(user => UserService.getUserProfile( null, user.id, null))
      .then(UserServiceTest.isPublicProfile);
  }

  @test('should get public profile by username')
  test_public_profile_by_username() {
    return UserUtils.createUser(usersMock.user())
      .then(user => UserService.getUserProfile( user.username, null, null))
      .then(UserServiceTest.isPublicProfile);
  }

  @test('should get public profile for deleted user')
  test_public_profile_deleted() {
    return UserService.getUserProfile( null, null, null)
      .then(profile => {
        expect(profile).to.deep.equal(UserService.getDeletedUser());
      });
  }

  @test('should return user not found')
  test_public_profile_not_found() {
    return UserService.getUserProfile( 'some invalid username', null, null)
      .then(() => Promise.reject(new Error('invalid user profile returned')))
      .catch((err: ServerError) => {
        expect(err).to.exist;
        expect(err.message).to.equal('User not found');
        expect(err.statusCode).to.equal(404);

        return Promise.resolve();
      });
  }

  @test('should return user\'s activity stream')
  test_activity_stream() {
    let username = faker.internet.userName();
    const STREAM_LENGTH = 20;

    // fill data
    return App.models.user.create(usersMock.user(username))
      .then(user => new Promise((resolve, reject) => {
        App.models.Activity.create(activitiesMock.get(STREAM_LENGTH, null, null, null, user.id), err => {
          if (err) {
            return reject(err);
          }

          resolve();
        });
      }))
      .then(() => UserService.getUserActivities( username, {}, null))
      .then(data => {
        expect(data.length).to.equal(STREAM_LENGTH);
        data.forEach(item => {
          expect(item).to.have.property('comments');
          expect(item).to.have.property('isLiked');
          expect(item).to.have.property('likesCount');
          expect(item).to.have.property('user');
        });
      });
  }

  @test('should return user\'s activity stream not found')
  test_activity_stream_not_found() {
    return UserService.getUserActivities( '', {}, null)
      .then(() => Promise.reject(new Error('invalid user stream returned')))
      .catch((err: ServerError) => {
        expect(err).to.exist;
        expect(err.message).to.equal('User not found');
        expect(err.statusCode).to.equal(404);

        return Promise.resolve();
      });
  }

  @test('should return user from request object')
  test_get_user_from_request() {

    return UserUtils.registerUser()
      .then(login => {
        let req = HttpMock.createRequestByLogin(null, login.token);

        return UserService.getUserFromRequest(req)
          .then(user => {
            expect(user).to.exist;
            expect(user.username).to.equal(login.user.username);
            expect(user.id).to.deep.equal(login.user.id);
          });
      });
  }

  @test('should return user not found from request object')
  test_get_user_from_request_not_found() {
    let req = HttpMock.createRequestByLogin(null, {id: 'invalid token', userId: ''});

    return UserService.getUserFromRequest(req)
      .then(() => Promise.reject(new Error('invalid user stream returned')))
      .catch((err: ServerError) => {
        expect(err).to.exist;
        expect(err.message).to.equal('User not found');
        expect(err.statusCode).to.equal(404);

        return Promise.resolve();
      });
  }

  @test('should set user from request object')
  test_set_user_from_request() {

    return UserUtils.registerUser()
      .then(login => {
        let instance: any = {};
        let field = 'userId';
        let replace = true;
        let req = HttpMock.createRequestByLogin(null, login.token);

        return UserService.setUserFromRequest(req, instance, field, replace)
          .then(() => {
            expect(instance[field]).to.deep.equal(login.user.id);
          });
      });
  }

  @test('should replace user from request object')
  test_replace_user_from_request() {

    return UserUtils.registerUser()
      .then(login => {
        let instance: any = {userId: 'some fake id'};
        let field = 'userId';
        let replace = true;
        let req = HttpMock.createRequestByLogin(null, login.token);

        return UserService.setUserFromRequest(req, instance, field, replace)
          .then(() => {
            expect(instance[field]).to.deep.equal(login.user.id);
          });
      });
  }

  @test('should ignore user from request object')
  test_ignore_user_from_request() {

    return UserUtils.registerUser()
      .then(login => {
        let instance: any = {userId: 'some fake id'};
        let field = 'userId';
        let replace = false;
        let req = HttpMock.createRequestByLogin(null, login.token);

        return UserService.setUserFromRequest(req, instance, field, replace)
          .then(() => {
            expect(instance[field]).to.not.deep.equal(login.user.id);
          });
      });
  }

  @test('should get user followings')
  test_get_user_followings() {
    const FOLLOWINGS_COUNT = 5;

    return App.models.user.create(usersMock.user())
      .then(user => {
        return usersMock.get(FOLLOWINGS_COUNT).reduce((chain, follower) => {
          return chain.then(() => {
            follower.followersIds = [user.id];
            return App.models.user.create(follower);
          });
        }, Promise.resolve())
          .then(() => Promise.resolve(user));
      })
      .then(user => UserService.getUserFollowings(user))
      .then(followings => expect(followings).to.have.length(FOLLOWINGS_COUNT));
  }

  @test('should get user activity count')
  test_get_user_activity_count() {
    const ACTIVITIES_COUNT = 10;

    return App.models.user.create(usersMock.user())
      .then(user => {
        let activities = activitiesMock.get(ACTIVITIES_COUNT, null, null, null, user.id);
        return new Promise((resolve, reject) => {
          App.models.Activity.create(activities, err => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        })
          .then(() => UserService.getUserActivityCount(user))
          .then(count => expect(count).to.equal(ACTIVITIES_COUNT));
      });
  }

  @test('should inject followersCount')
  test_inject_followersCount() {
    const FollowersCount = 3;

    return UserUtils.createUser()
      .then(user => UserUtils.createFollowers(user, FollowersCount))
      .then(user => {
        return UserService.injectFollowersCount(user)
          .then(() => {
            // followers count
            expect(user.followersCount).to.equal(FollowersCount);
          });
      });
  }

  @test('should inject user')
  test_inject_user() {
    let activity: any = {};

    return UserUtils.createUser()
      .then(user => {
        activity.userId = user.id;

        UserService.injectUser(activity)
          .then(() => {
            UserServiceTest.isPublicProfile(activity.user);
          });
      });
  }

  @test('should inject deleted user')
  test_inject_deleted_user() {
    let activity: any = {};
    let user: any = {userId: 'id'};

    return UserService.injectUserProfile(activity, user)
      .then(() => {
        expect(activity.user).to.deep.equal(UserService.getDeletedUser());
      });
  }

  @test('should delete account')
  @skip
  test_account_delete() {

    return UserUtils.createUser()
      .then(user => {
        let userIdentity = userIdentitiesMock.get(1, user.id)[0];
        let tokens = tokensMock.get(10, user);
        let comments = commentsMock.get(20, user.id);
        let activities = activitiesMock.get(20, null, null, null, user.id);

        // fill data
        return App.models.userIdentity.create(userIdentity)
          .then(() => App.models.accessToken.create(tokens))
          .then(() => App.models.Comment.create(comments))
          .then(() => App.models.Activity.create(activities))
          .then(() => UserService.deleteAccount(tokens[0].id))
          .then(() => {
            let email = EmailUtils.getLastSentEmail();

            expect(email).to.exist;
            expect(email.data.to).to.equal(user.email);
            expect(email.data.from).to.equal(App.get('email'));
            expect(email.data.subject).to.equal((<any>EmailService).ACCOUNT_DELETE_CONFIRMATION_EMAIL_SUBJECT);
            expect(email.data.html).to.contain(App.get('domain'));
          })
          .then(() => {
            return Promise.all([
              App.models.Comment.count({userId: user.id}),
              App.models.Activity.count({userId: user.id}),
              App.models.Media.count({userId: user.id}),
              App.models.userIdentity.count({userId: user.id}),
              App.models.user.count({id: user.id})
            ]);
          })
          .then(counts => {
            counts.forEach(count => expect(count).to.equal(0));
          });
      });
  }
}
