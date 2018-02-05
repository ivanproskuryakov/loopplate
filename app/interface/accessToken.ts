export interface AccessToken {
  id?: string;
  ttl?: number;
  created?: Date;
  userId: string;
}
