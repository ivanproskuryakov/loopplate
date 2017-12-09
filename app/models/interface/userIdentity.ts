import {PersistedModel} from 'loopback';

export interface UserIdentity extends PersistedModel{
  id?: any;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  provider: string;
  authScheme: string;
  externalId: string;
}
