import {User} from 'app/models/interface/user';

/**
 * @interface SummaryReportInterface
 */
export interface SummaryReportInterface {
  from: Date;
  to: Date;
  quantity: number;
  total: number;
  newUsers: User[];
}
