import {Server as HttpServer} from 'http';
import {db} from 'loopback';
import {LoggerTransport} from 'app/helper/logHelper';
import {ActivityDataAccessObject} from 'app/models/interface/activity';
import {AccessTokenDataAccessObject} from 'app/models/interface/accessToken';
import {UserIdentityDataAccessObject} from 'app/models/interface/userIdentity';
import {ContactDataAccessObject} from 'app/models/interface/contact';
import {UserDataAccessObject} from 'app/models/interface/user';
import {EmailDataAccessObject} from 'app/models/interface/email';
import {MediaDataAccessObject} from 'app/models/interface/media';
import {Cache} from 'app/models/interface/cache';

export interface Server {
  dataSources: {
    mongo: {
      connector: {
        db: {
          dropDatabase: (cb: (err?: Error) => any) => any;
        }
        observe: (event: string, cb: (ctx: any, next: (err?: Error) => any) => any) => void;
      },
      automigrate: (collection: string, cb: (err: Error) => any) => any;
      autoupdate: (collection: string, cb: (err: Error) => any) => any;
    };
    mailgun: any;
  };
  loopback: any;
  models: {
    Activity: ActivityDataAccessObject;
    user: UserDataAccessObject;
    accessToken: AccessTokenDataAccessObject;
    Email: EmailDataAccessObject;
    userIdentity: UserIdentityDataAccessObject;
    userCredential: db.DataAccessObject<any>;
    Contact: ContactDataAccessObject;
    Media: MediaDataAccessObject;
    Cache: db.DataAccessObject<Cache<any>>;
  };
  start: () => void;
  emit: (e: string) => void;
  listen: (cb: () => void) => HttpServer;
  get: {
    (route: string, middleware: (req: any, res: any, next?: (err?: Error) => void) => void): void;
    (key: string): any;
    (key: 'oauth'): {
      facebook: {
        clientId: string,
        clientSecret: string
      },
      google: {
        clientId: string,
        clientSecret: string
      },
      yahoo: {
        clientId: string,
        clientSecret: string,
        disable?: boolean
      }
    };
    (key: 'storage'): {
      provider: string,
      key: string,
      keyId: string,
      region: string,
      container: string
    };
    (key: 'logs'): {
      transport: LoggerTransport,
      options: any,
      dir: string
    };
    (key: 'meta'): {
      title: string,
      description: string
    };
    (key: 'google'): {
      key: string
    };
    (key: 'twitter'): {
      key: string,
      secret: string,
      accessToken: string,
      accessTokenSecret: string
    };
    (key: 'instagram'): {
      clientId: string,
      clientSecret: string
    };
    (key: 'gettyimages'): {
      key: string,
      secret: string
    };
    (key: 'giphy'): {
      key: string
    };
  };
  use: (middleware: any) => void;
  removeAllListeners: (name: string) => void;
  updateDatasources: () => Promise<void>;
}
