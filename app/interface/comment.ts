import {User} from 'app/interface/user/user';

export interface Comment {
  id?: string;
  text: string;
  slug?: string;
  fullSlug?: string;
  user?: User;
  userId: string;
  activityId: string;
  replyOn?: Comment;
  replyTo?: User;
  replyOnId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  toJSON?: () => Comment;
}
