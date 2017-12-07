import {db} from 'loopback';

export type MediaRelation = 'profilePhoto' | 'profileBackground' | 'activity';

export type MediaType = 'image' | 'video' | 'audio';

/**
 * Media
 *
 * @author Nika Nikabadze
 */
export interface Media {
  id?: string;
  location: string;
  type: MediaType;
  relation: MediaRelation;
  name: string;
  mimeType: string;
  size: number;
  container: string;
  userId: string;
  createdAt: Date;
}

export interface MediaDataAccessObject extends db.DataAccessObject<Media> {

}
