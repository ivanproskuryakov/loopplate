import * as _ from 'lodash';
import {UserIdentity} from 'app/interface/user/userIdentity';

export function get(quantity: number, userId: string): UserIdentity[] {
  return _.range(quantity).map(() => {
    return {
      userId: userId,
      provider: '',
      authScheme: '',
      externalId: ''
    };
  });
}
