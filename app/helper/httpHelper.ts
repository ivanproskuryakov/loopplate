import {IncomingMessage} from 'http';
import {Promise} from 'es6-promise';
import {parse} from 'url';
import * as _ from 'lodash';
import * as request from 'request';
let psl = require('psl');

/**
 * @classdesc helper methods for http requests
 */
export class HttpHelper {

  /**
   * @const
   * @type {string[]}
   */
  private static readonly ALLOWED_SUBDOMAINS = ['tumblr.com', 'wordpress.com'];

  /**
   * @const
   * @type {string[]}
   */
  private static readonly USER_AGENTS = [
    /* tslint:disable max-line-length */
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:51.0) Gecko/20100101 Firefox/51.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:51.0) Gecko/20100101 Firefox/51.0',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:51.0) Gecko/20100101 Firefox/51.0',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:51.0) Gecko/20100101 Firefox/51.0',
    'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
    /* tslint:enable max-line-length */
  ];

  public static getContents(url: string, withUserAgent = true, options: any = {}): Promise<string> {
    return this
      .download(url, withUserAgent, options)
      .then(response => this.readResponse(response));
  }

  /**
   * @param {string} url
   * @param {boolean} withUserAgent
   * @param {object} options
   * @returns {Promise<IncomingMessage>} response
   */
  public static download(url: string, withUserAgent = true, options: any = {}): Promise<IncomingMessage> {

    return new Promise((resolve, reject) => {
      let config: any = {
        url: url,
        method: 'GET',
        timeout: 30000,
        pool: false,
        agent: false
      };

      if (withUserAgent) {
        config.headers = {
          'user-agent': HttpHelper.getRandomAgent()
        };
      }

      _.assign(config, options);

      let req = request(config, (error, response, body) => {
      });

      req.setMaxListeners(50);
      req.on('response', resolve);
      req.on('error', reject);
    });
  }

  /**
   * @param {IncomingMessage} response
   * @returns {Promise<string>}
   */
  public static readResponse(response: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = [];

      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(Buffer.concat(body).toString()));
      response.on('error', reject);
    });
  }

  /**
   * @param {string} url
   * @returns {string}
   */
  public static getDomain(url: string): string {
    let hostname = parse(url).hostname.replace('www.', '');
    let parts = psl.parse(hostname);

    return this.ALLOWED_SUBDOMAINS.indexOf(parts.domain) === -1
      ? parts.domain
      : _.last(parts.subdomain.split('.')) + '.' + parts.domain;
  }

  /**
   * @param {string} url
   * @returns {boolean}
   */
  public static isValidUrl(url: string): boolean {
    const regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

    return url.match(regex) !== null;
  }

  /**
   * returns random user agent
   */
  private static getRandomAgent(): string {
    let min = 0;
    let max = HttpHelper.USER_AGENTS.length;
    let index = Math.floor(Math.random() * (max - min)) + min;

    return HttpHelper.USER_AGENTS[index];
  }
}
