export interface UserIdentity {
  id?: any;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  provider: string;
  authScheme: string;
  externalId: string;
}
