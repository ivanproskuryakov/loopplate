import * as _ from 'lodash';
import * as faker from 'faker';
import {SocialProfile} from 'app/interface/socialProfile';

export function get(quantity: number): SocialProfile[] {
  return _.range(quantity).map(() => {
    return {
      name: faker.lorem.words(1),
      category: faker.lorem.words(1),
      tags: faker.lorem.words(2).split(' '),
      networks: [{
        network: faker.lorem.words(1),
        appid: faker.lorem.words(1),
        appsecret: faker.lorem.words(1),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }, {
        network: faker.lorem.words(1),
        appid: faker.lorem.words(1),
        appsecret: faker.lorem.words(1),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }, {
        network: faker.lorem.words(1),
        appid: faker.lorem.words(1),
        appsecret: faker.lorem.words(1),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }]
    };
  });
}

export function invalid(): SocialProfile[] {
  return [{
    name: undefined,
    category: faker.lorem.words(1),
    networks: [{
      type: faker.lorem.words(1),
      appid: faker.lorem.words(1),
      appsecret: faker.lorem.words(1),
      username: faker.internet.userName(),
      password: faker.internet.password(),
    }]
  }, {
    name: undefined,
    category: undefined,
    networks: [{
      type: faker.lorem.words(1),
      appid: faker.lorem.words(1),
      appsecret: faker.lorem.words(1),
      username: faker.internet.userName(),
      password: faker.internet.password(),
    }]
  }];
}

export function facebook(): SocialProfile {
  const socialProfiles: any = require('app/test/fixtures/social.json');

  return {
    name: 'facebook',
    category: socialProfiles.test1.category,
    networks: [
      socialProfiles.test1.networks[0]
    ]
  };
}

export function invalidFacebook(): SocialProfile {
  const socialProfiles: any = require('app/test/fixtures/social.json');

  return {
    name: 'facebook',
    category: socialProfiles.test1.category,
    networks: [{
      network: 'facebook',
      page: faker.lorem.words(1),
      username: faker.lorem.words(1),
      password: faker.internet.password(),
      access_token: faker.lorem.words(1),
    }]
  };
}
