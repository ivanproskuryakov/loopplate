import {Promise} from 'es6-promise';
import * as faker from 'faker';
import * as App from 'app/server/server';

import {User} from 'app/models/interface/user';
import {Activity} from 'app/models/interface/activity';

export class Cleanup {


  /**
   * starts the cleanup process
   * @returns {Promise}
   */
  public start(): Promise<void> {
    return this
      .createUsers()
      .then(users => this.createActivities(users));
  }

  /**
   * creates users
   * @returns {Promise<User[]>}
   */
  public createUsers(): Promise<User[]> {

    return this.recreate('user')
      .then(() => this.recreate('userIdentity'))
      .then(() => new Promise((resolve, reject) => {
        App.models.user.create([{
          email: 'foo@bar.com',
          type: 'user',
          password: 'foobar',
          username: 'foo'
        }, {
          email: 'john@doe.com',
          type: 'user',
          password: 'johndoe',
          username: 'john'
        }, {
          email: 'jane@doe.com',
          type: 'user',
          password: 'janedoe',
          username: 'jane'
        }], (err: Error, users: User[]) => {
          if (err) {
            console.log(err);
          }

          resolve(users);
        });
      }));
  }

  /**
   * creates activities
   * @returns {Promise<Activity[]>}
   */
  public createActivities(users: User[]): Promise<Activity[]> {

    return this.recreate('Activity')
      .then(() =>
        new Promise((resolve, reject) => {
          App.models.Activity.create([{
            name: 'Premier League could have no English managers - Sam Allardyce',
            description: faker.lorem.paragraph(),
            source: 'http://www.bbc.com/sport/football/36295573',
            userId: users[0].id,
            category: 'root',
            tags: [{value: 'Fooball', rank: 0}, {value: 'UEFA', rank: 0}, {value: 'PremierLegue', rank: 0}],
            type: 'rss'
          }, {
            name: 'Barcelona win La Liga: Real Madrid boss admits rivals deserved to win',
            description: faker.lorem.paragraph(),
            source: 'http://www.bbc.com/sport/football/36294900',
            userId: users[1].id,
            category: 'root',
            tags: [{value: 'UEFA', rank: 0}, {value: 'Barcelona', rank: 0}],
            type: 'rss'
          }, {
            name: 'Cristiano Ronaldo scored twice as Real Madrid',
            description: faker.lorem.paragraph(),
            source: 'http://www.bbc.com/sport/football/36250293',
            userId: users[2].id,
            category: 'root',
            tags: [{value: 'Ronaldo', rank: 0}, {value: 'UEFA', rank: 0}, {value: 'Barcelona', rank: 0}],
            type: 'rss'
          }], (err: Error, activities: Activity[]) => {
            if (err) {
              return reject(err);
            }

            resolve(activities);
          });
        }));
  }


  /**
   * creates or recreates collection
   * @param {string} collection name of collection
   * @returns {Promise}
   */
  private recreate(collection: string): Promise<void> {

    return new Promise<void>((resolve, reject) => {
      let db = App.dataSources.mongo;
      db.automigrate(collection, (err: Error) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

}
