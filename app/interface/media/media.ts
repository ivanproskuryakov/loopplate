export type MediaRelation = 'profilePhoto' | 'profileBackground' | 'activity';
export type MediaType = 'image' | 'video' | 'audio';

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
