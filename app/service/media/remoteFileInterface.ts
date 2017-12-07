/**
 * @interface RemoteFileInterface
 */
export interface RemoteFileInterface {
  name: string;
  container: string;
  etag: string;
  lastModified?: Date;
  size: number;
  location: string;
}
