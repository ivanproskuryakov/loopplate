import * as _ from 'lodash';
import * as faker from 'faker';
import {NotificationInterface} from 'app/notification/notificationInterface';

export function get(quantity: number, imageUrl?: string): NotificationInterface[] {
  return _.range(quantity).map<NotificationInterface>(index => ({
    url: faker.internet.url() + `/${index}`,
    title: faker.lorem.sentence() + index,
    description: faker.lorem.paragraph(),
    tags: faker.lorem.words(3).split(' '),
    imageUrl: imageUrl || faker.image.imageUrl()
  }));
}
