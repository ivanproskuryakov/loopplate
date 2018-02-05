import * as Promise from 'bluebird';
import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import * as faker from 'faker';

import * as usersMock from 'app/test/fixtures/models/user';
import * as App from 'app/server/server';
import {User} from 'app/interface/user/user';

@suite('Models - User model')
export class UserModelTest {

  @test('should create valid users')
  test_insert(done) {
    let users = usersMock.get(5);

    Promise.map(users, (user: User) => {
      return new Promise((resolve, reject) => {
        App.models.user.create(user, (err, created) => {
          expect(err).to.not.exist;
          expect(created).to.exist;
          expect(created.id).to.exist;
          expect(created.rss).to.exist;
          expect(created.rss.length).to.be.equal(3);

          resolve(created);
        });
      });
    }).then(() => done());
  }

  @test('should not create invalid users')
  test_insert_invalid(done) {
    let users = usersMock.invalid();

    Promise.map(users, (user: User) => {
      return new Promise((resolve, reject) => {
        App.models.user.create(user, (err, created) => {

          expect(err).to.exist;
          resolve();
        });
      });
    }).then(() => done());
  }

  @test('should update user: email && username')
  test_update(done) {
    App.models.user.findOne({}, (err, user) => {
      expect(err).to.not.exist;

      let email = faker.internet.email();
      let username = faker.internet.userName();
      user.updateAttributes({
        email: email,
        username: username
      }, (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.exist;
        expect(result.email).equal(email);
        expect(result.username).equal(username);

        done();
      });
    });
  }

  @test('should delete user')
  test_delete(done) {
    App.models.user.findOne({}, (err, user) => {
      expect(err).to.not.exist;

      user.delete(err => {
        expect(err).to.not.exist;

        done();
      });
    });
  }
}
