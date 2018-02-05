import * as _ from 'lodash';
import * as faker from 'faker';
import {User} from 'app/interface/user/user';

export function user(username?: string, type?: string, email?: string): User {
  return <User>{
    username: username || faker.internet.userName(),
    password: faker.internet.password(),
    email: email || faker.internet.email(),
    type: type || 'user',
    avatar: {type: 'image', location: faker.image.imageUrl()},
    background: null,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    rss: [
      {name: faker.lorem.words(), url: faker.internet.url(), category: faker.lorem.word()},
      {name: faker.lorem.words(), url: faker.internet.url(), category: faker.lorem.word()},
      {name: faker.lorem.words(), url: faker.internet.url(), category: faker.lorem.word()}
    ]
  };
}

export function userWebsiteEmptyRSS(): User {
  return <User>{
    username: faker.internet.userName(),
    password: faker.internet.password(),
    email: faker.internet.email(),
    type: 'website',
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    rss: []
  };
}

export function get(quantity: number, type?: string): User[] {
  return _.range(quantity).map(() => {
    return user(null, type);
  });
}

export function invalid(): User[] {
  return [{
    username: faker.internet.userName(),
    password: undefined,
    email: faker.internet.email(),
    type: 'user',
    rss: [
      {name: faker.lorem.words(), url: faker.internet.url(), category: faker.lorem.word()},
      {name: faker.lorem.words(), url: faker.internet.url(), category: faker.lorem.word()},
      {name: faker.lorem.words(), url: faker.internet.url(), category: faker.lorem.word()}
    ]
  }, {
    username: faker.internet.userName(),
    password: undefined,
    email: faker.internet.email(),
    type: 'user',
    rss: [{name: faker.lorem.words(), url: faker.internet.url(), category: faker.lorem.word()}]
  }, {
    username: faker.internet.userName(),
    password: faker.internet.password(),
    email: undefined,
    type: 'user',
    rss: [{name: faker.lorem.words(), url: faker.internet.url(), category: faker.lorem.word()}]
  }];
}
