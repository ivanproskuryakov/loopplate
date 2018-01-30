import {LoopBackApplication} from 'loopback';
import {PersistedModel} from 'loopback';

export interface Server extends LoopBackApplication {
  model(): {
    user: PersistedModel
  }
  // dataSources: {}
}
