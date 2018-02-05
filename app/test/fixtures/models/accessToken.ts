import * as _ from 'lodash';
import * as faker from 'faker';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';

export function token(user?: User, id?: string): AccessToken {
  return <AccessToken>{
    id: id || faker.random.uuid(),
    userId: (user && user.id) || faker.random.uuid()
  };
}

export function get(quantity: number, user?: User): AccessToken[] {
  return _.range(quantity).map(() => token(user));
}
