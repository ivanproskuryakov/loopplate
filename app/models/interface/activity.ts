import {User} from 'app/models/interface/user';
import {PersistedModel} from 'loopback';

export interface Activity extends PersistedModel{
  id?: any;
  name: string;
  description?: string;

  createdAt?: Date;
  updatedAt?: Date;
  userId: any;

  isLiked?: boolean;
  likesCount?: number;
  likedUserIds?: string[];
  viewsCount?: number;

  user?: User;


  toJSON?: () => Activity;
}
