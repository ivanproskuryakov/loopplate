import {loopback as l} from 'loopback';
import {User} from 'app/models/interface/user';

export interface Server extends l {
  models(): {
    user: User
  }
}
