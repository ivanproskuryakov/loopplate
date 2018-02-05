import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import * as faker from 'faker';
import * as Promise from 'bluebird';
import * as App from 'app/server/server';

import * as socialProfilesMock from 'app/test/fixtures/models/socialProfile';
import {SocialProfile} from 'app/interface/socialProfile';

@suite('Models - SocialProfile model')
export class SocialProfileModelTest {

  @test('should create valid profiles')
  test_insert(done) {
    let profiles = socialProfilesMock.get(5);

    Promise.map(profiles, (profile: SocialProfile) => {
      return new Promise((resolve, reject) => {
        App.models.SocialProfile.create(profile, (err, created) => {
          expect(err).to.not.exist;
          expect(created).to.exist;
          expect(created.id).to.exist;
          expect(created.name).to.exist;
          expect(created.category).to.exist;
          expect(created.networks).to.exist;
          expect(created.networks.length).to.be.equal(3);

          resolve(created);
        });
      });
    }).then(() => done());
  }

  @test('should not create invalid profiles')
  test_insert_invalid(done) {
    let profiles = socialProfilesMock.invalid();

    Promise.map(profiles, (profile: SocialProfile) => {
      return new Promise((resolve, reject) => {
        App.models.SocialProfile.create(profile, (err, created) => {

          expect(err).to.exist;
          resolve();
        });
      });
    }).then(() => done());
  }

  @test('should update profile: name & category')
  test_update(done) {
    App.models.SocialProfile.findOne({}, (err, profile) => {
      expect(err).to.not.exist;

      let name = faker.lorem.words(1);
      let category = faker.lorem.words(1);
      profile.updateAttributes({
        name: name,
        category: category
      }, (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.exist;
        expect(result.name).equal(name);
        expect(result.category).equal(category);

        done();
      });
    });
  }

  @test('should update profile: add new network')
  test_network(done) {
    App.models.SocialProfile.findOne({}, (err, profile) => {
      expect(err).to.not.exist;

      let expectedLength = profile.networks.length + 1;
      let network = {
        category: faker.lorem.words(1),
        appid: faker.lorem.words(1),
        appsecret: faker.lorem.words(1),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };
      profile.networks.push(network);

      profile.save((err, result) => {
        expect(err).to.not.exist;
        expect(result).to.exist;
        expect(result.networks.length).equal(expectedLength);

        let savedNetwork: any = result.networks.filter(n => n.category === network.category)[0];
        expect(savedNetwork.appid).equal(network.appid);
        expect(savedNetwork.appsecret).equal(network.appsecret);
        expect(savedNetwork.username).equal(network.username);
        expect(savedNetwork.password).equal(network.password);

        done();
      });
    });
  }

  @test('should delete profile')
  test_delete(done) {
    App.models.SocialProfile.findOne({}, (err, profile) => {
      expect(err).to.not.exist;

      profile.delete(err => {
        expect(err).to.not.exist;

        done();
      });
    });
  }
}
