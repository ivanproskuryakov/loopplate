import {User} from 'app/interface/user/user';

export interface SummaryReportInterface {
  from: Date;
  to: Date;
  users: UserReportInterface[];
  categories: CategoryReportInterface[];
  quantity: number;
  total: number;
  newUsers: User[];
}

export interface CategoryReportInterface {
  category: string;
  quantity: number;
}

export interface UserReportInterface {
  username: string;
  quantity: number;
}
