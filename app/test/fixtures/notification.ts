import * as _ from 'lodash';
import * as faker from 'faker';

export function get(quantity: number, imageUrl?: string): any[] {
  return _.range(quantity).map(index => ({
    url: faker.internet.url() + `/${index}`,
    title: faker.lorem.sentence() + index,
    description: faker.lorem.paragraph(),
    tags: faker.lorem.words(3).split(' '),
    imageUrl: imageUrl || faker.image.imageUrl()
  }));
}
