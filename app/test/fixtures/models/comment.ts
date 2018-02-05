import * as _ from 'lodash';
import * as faker from 'faker';
import {Comment} from 'app/interface/comment';

export function get(quantity: number,
                    userId?: string,
                    activityId?: string,
                    replyOnId?: string): Comment[] {
  return _.range(quantity).map(() => {
    return <any>{
      text: faker.lorem.paragraph(),
      activityId: activityId || '',
      userId: userId || '',
      replyOnId: replyOnId || null
    };
  });
}

export function invalid(): Comment[] {
  return [<any>{
    text: undefined,
    activityId: '',
    userId: ''
  }];
}
