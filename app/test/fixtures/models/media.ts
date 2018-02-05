import * as _ from 'lodash';
import * as faker from 'faker';
import {Media, MediaType, MediaRelation} from 'app/interface/media/media';
import {User} from 'app/interface/user/user';

export function get(quantity: number,
                    user: User,
                    type?: MediaType,
                    relation?: MediaRelation,
                    size?: number): Media[] {
  return _.range(quantity).map<Media>(() => ({
    relation: relation || 'profilePhoto',
    userId: user.id,
    type: type || 'image',
    location: faker.image.imageUrl(),
    name: faker.system.fileName('', ''),
    container: faker.lorem.word(),
    mimeType: faker.system.mimeType(),
    size: size || 1,
    createdAt: new Date()
  }));
}
