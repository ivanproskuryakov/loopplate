import {Server as HttpServer} from 'http';
import {LoopBackApplication} from 'loopback';
import {db} from 'loopback-crud';
import {LoggerTransport} from 'app/helper/logHelper';
import {Activity} from 'app/interface/activity/activity';
import {AccessToken} from 'app/interface/accessToken';
import {SocialProfile} from 'app/interface/socialProfile';
import {UserIdentity} from 'app/interface/user/userIdentity';
import {Contact} from 'app/interface/contact';
import {Comment} from 'app/interface/comment';
import {User} from 'app/interface/user/user';
import {EmailDataAccessObject} from 'app/interface/email';
import {Media} from 'app/interface/media/media';
import {Cache} from 'app/interface/cache';

export interface Server extends LoopBackApplication {
  dataSources: {
    mongo: {
      connector: {
        db: {
          dropDatabase: (cb: (err?: Error) => any) => any;
        }
        observe: (event: string, cb: (ctx: any, next: (err?: Error) => any) => any) => void;
      },
      automigrate: <T>(collection: string) => Promise<T>;
      autoupdate: (collection: string, cb: (err: Error) => any) => any;
    };
    mailgun: any;
  };
  loopback: any;
  models: {
    Activity: db.DataAccessObject<Activity>;
    user: db.DataAccessObject<User>;
    Comment: db.DataAccessObject<Comment>;
    SocialProfile: db.DataAccessObject<SocialProfile>;
    accessToken: db.DataAccessObject<AccessToken>;
    userIdentity: db.DataAccessObject<UserIdentity>;
    userCredential: db.DataAccessObject<any>;
    Contact: db.DataAccessObject<Contact>;
    Media: db.DataAccessObject<Media>;
    Cache: db.DataAccessObject<Cache<any>>;

    Email: EmailDataAccessObject;
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
    (key: 'getstream'): {
      apiKey: string,
      apiSecret: string,
      appId: string,
      disable?: boolean
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
