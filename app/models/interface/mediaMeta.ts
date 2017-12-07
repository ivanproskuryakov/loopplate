import {MediaType} from 'app/models/interface/media';

/**
 * Media
 *
 * @author Nika Nikabadze
 */
export interface MediaMeta {
  location: string;
  type: MediaType;
  name?: string;
  description?: string;
  main?: boolean;
}
