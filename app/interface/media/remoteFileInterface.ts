export interface RemoteFile {
  name: string;
  container: string;
  etag: string;
  lastModified?: Date;
  size: number;
  location: string;
}
