import {Promise} from 'es6-promise';
import * as async from 'async';
let yql = require('yql-node');

import * as App from 'app/server/server';
import {StringHelper} from 'app/helper/stringHelper';

export class YahooClient {
  /**
   * quantity of retries for running query
   * @type {number}
   */
  private readonly QUERY_EXEC_RETRY_COUNT = 3;
  /**
   * delay before another retry (in ms)
   * @type {number}
   */
  private readonly QUERY_EXEC_RETRY_DELAY = 600;

  /**
   * extracts tags from text
   * @param {string} text
   * @returns {Promise<string[]>} tags
   */
  analyzeText(text: string): Promise<string[]> {
    let query = `select * from contentanalysis.analyzeAndUpdateActivityTags where text="${this.toQueryParameter(text)}";`;

    return this.runQuery(query)
      .then<string[]>((response: QueryResult) => {
        let keywords: any[] = response.query && response.query.results &&
          response.query.results.entities && response.query.results.entities.entity;
        if (!keywords) {
          return [];
        }
        // when keywords count is equal to 1,
        // it returns as object not as array
        if (!Array.isArray(keywords)) {
          keywords = [keywords];
        }

        return keywords.map(entity => entity.text.content);
      });
  }

  /**
   * run yql query with retries (count defined in static QueryExecRetryCount)
   * @param {string} query
   */
  private runQuery(query: string): Promise<QueryResult> {

    return new Promise((resolve, reject) => {
      async.retry(
        {times: this.QUERY_EXEC_RETRY_COUNT, interval: this.QUERY_EXEC_RETRY_DELAY},
        (cb: (err: Error, result: any) => void) => {
          this.getClient().execute(query, cb);
        }, (err, response) => {
          if (err) {

            return reject(err);
          }

          let result: QueryResult = JSON.parse(response);
          resolve(result);
        });
    });
  }

  /**
   * create query parameter out of text
   * @param {string} text
   * @returns {string}
   */
  private toQueryParameter(text: string): string {
    // convert html into text
    let body = StringHelper.toText(text);

    // remove illegal chars from body
    const invalidChars = ['\'s', '\'', '"', '\\.\\.\\.', '/'];
    invalidChars.forEach(invalid =>
      body = body.replace(new RegExp(invalid, 'g'), '') || body);

    return body;
  }

  /**
   * creates yql client
   * @private
   * @returns {Object}
   */
  private getClient(): any {
    let client = yql.formatAsJSON();
    let clientId = App.get('oauth').yahoo.clientId;
    let clientSecret = App.get('oauth').yahoo.clientSecret;

    if (clientId && clientSecret) {

      return client.withOAuth(clientId, clientSecret);
    } else {

      return client;
    }
  }

}

/**
 * YQL query result interface
 */
interface QueryResult {
  query: {
    count: number;
    created: string,
    lang: string;
    results?: {
      entities?: {
        entity: [{
          score: number;
          text: {
            start: number;
            end: number;
            endchar: number;
            startchar: number;
            content: string;
          },
          wiki_url: string;
        }]
      }
    }
  };
}
