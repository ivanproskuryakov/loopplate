import {MediaType} from 'app/interface/media/media';

export interface MediaMeta {
  location: string;
  type: MediaType;
  name?: string;
  description?: string;
  main?: boolean;
}
