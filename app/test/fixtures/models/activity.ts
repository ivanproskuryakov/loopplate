import * as _ from 'lodash';
import * as slug from 'slug';
import * as faker from 'faker';

import {Activity} from 'app/interface/activity/activity';
import {ActivityType} from 'app/interface/activity/activityType';
import {Tag} from 'app/interface/activity/tag';
import {MediaMeta} from 'app/interface/media/mediaMeta';

export function get(quantity: number,
                    createdAt?: Date,
                    tags?: Tag[],
                    type?: ActivityType,
                    userId?: string,
                    category?: string): Activity[] {
  return _.range(quantity).map(index => {
    let activity: Activity = {
      name: faker.lorem.sentence() + index,
      description: faker.lorem.paragraph(),
      tags: tags || faker.lorem.words(3).split(' ').map(value => ({value, rank: 1})),
      media: [{
        location: faker.image.imageUrl(),
        type: 'image',
        main: true
      }],
      category: category || faker.lorem.word(),
      source: faker.internet.url() + `/${index}`,
      userId: userId || faker.random.uuid(),
      type: type || 'rss',
      slug: slug(faker.lorem.sentence())
    };

    if (createdAt) {
      activity.createdAt = createdAt;
    }

    return activity;
  });
}

export function invalid(): Activity[] {
  return [{
    name: undefined,
    description: faker.lorem.paragraph(),
    tags: faker.lorem.words(3).split(' ').map(value => ({value, rank: 1})),
    media: [{
      location: faker.image.imageUrl(),
      type: 'image',
      main: true
    }],
    category: faker.lorem.word(),
    source: faker.internet.url(),
    createdAt: faker.date.recent(),
    userId: '',
    type: 'rss'
  }, {
    name: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    tags: faker.lorem.words(3).split(' ').map(value => ({value, rank: 1})),
    category: faker.lorem.words(),
    source: faker.internet.url(),
    createdAt: faker.date.recent(),
    userId: '',
    type: undefined
  }, {
    name: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    tags: faker.lorem.words(3).split(' ').map(value => ({value, rank: 1})),
    category: undefined,
    source: faker.internet.url(),
    createdAt: faker.date.recent(),
    userId: '',
    type: 'rss'
  }, {
    name: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    tags: faker.lorem.words(3).split(' ').map(value => ({value, rank: 1})),
    category: undefined,
    source: faker.internet.url(),
    createdAt: faker.date.recent(),
    userId: '',
    type: 'rss',
    media: [<MediaMeta>{
      type: 'image',
      main: true
    }]
  }];
}
