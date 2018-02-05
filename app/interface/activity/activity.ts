import {db} from 'loopback-crud';
import {User} from 'app/interface/user/user';
import {MediaMeta} from 'app/interface/media/mediaMeta';
import {ActivityType} from 'app/interface/activity/activityType';
import {Tag} from 'app/interface/activity/tag';

/**
 * Activity
 */
export interface Activity {
  id?: any;
  name: string;
  description?: string;
  category?: string;
  type: ActivityType;
  source?: string;
  tags?: Tag[];
  media?: MediaMeta[];
  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId: any;
  timelineId?: string;
  achievements?: string[];

  isLiked?: boolean;
  likesCount?: number;
  likedUserIds?: string[];
  likes?: db.ReferencesManyRelation<User>;

  commentsCount?: number;
  comments?: db.DataAccessObject<db.DataObject<Comment>>;

  viewsCount?: number;
  views?: [{ ip: string, userId?: string }];

  user?: User;


  toJSON?: () => Activity;
}
