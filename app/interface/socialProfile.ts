export interface SocialProfile {
  id?: any;
  name: string;
  category: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  networks: any[];
}
