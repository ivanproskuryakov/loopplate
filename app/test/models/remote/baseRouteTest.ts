import * as App from 'app/server/server';
import * as supertest from 'supertest';
import {Server} from 'http';

/**
 * Base class for server route tests
 * starts / shutdown server
 */
export class BaseRouteTest {

  /**
   * @property {String} serverAddress url of server
   */
  public static ServerAddress: string;
  /**
   * @property {String} apiAddress url of api
   */
  public static ApiAddress: string;

  /**
   * @property {http.Server} server that runs loopback app
   */
  protected static httpServer: Server;

  static before(done: (err?: Error) => void): void {
    BaseRouteTest.startServer(done);
  }

  static after(done: (err?: Error) => void): void {
    BaseRouteTest.stopServer(done);
  }

  /**
   * @private starts server and initializes props like serverAddress & apiAddress
   * @param {function} done
   */
  private static startServer(done: (err?: Error) => void): void {
    BaseRouteTest.httpServer = App.listen(() => {
      BaseRouteTest.ServerAddress = App.get('url').replace(/\/$/, '');
      BaseRouteTest.ApiAddress = BaseRouteTest.ServerAddress + App.get('restApiRoot');

      done();
    });
  }

  /**
   * @private stops server
   * @link https://github.com/strongloop/strong-gateway/blob/master/server/server.js#L49
   * @param {function} done
   */
  private static stopServer(done: (err?: Error) => void): void {
    App.removeAllListeners('started');
    App.removeAllListeners('loaded');
    BaseRouteTest.httpServer.close(() => {
      BaseRouteTest.httpServer = null;

      done();
    });
  }

  /**
   * returns api client with api address already set
   * @returns {supertest.SuperTest<supertest.Test>}
   */
  protected getApiClient(): supertest.SuperTest<supertest.Test> {
    return supertest(BaseRouteTest.ApiAddress);
  }

  /**
   * returns server client with server address already set
   * @returns {supertest.SuperTest<supertest.Test>}
   */
  protected getServerClient(): supertest.SuperTest<supertest.Test> {
    return supertest(BaseRouteTest.ServerAddress);
  }
}
