import * as faker from 'faker';
import * as App from 'app/server/server';

import {User} from 'app/interface/user/user';
import {Activity} from 'app/interface/activity/activity';
import {Comment} from 'app/interface/comment';
import {ActivityRepository} from 'app/models/repository/activityRepository';
import {UserRepository} from 'app/models/repository/userRepository';
import {CommentRepository} from 'app/models/repository/commentRepository';

export class Cleanup {

  /**
   * @returns {Promise}
   */
  public start(): Promise<any[]> {
    return this
      .recreate('user')
      .then(() => this.recreate('userIdentity'))
      .then(() => this.recreate('Activity'))
      .then(() => this.recreate('Comment'))

      .then(() => this.createUser())
      .then(user => this.createActivities(user))
      .then(activities => this.createComments(activities))
  }

  /**
   * @returns {Promise<User>}
   */
  private createUser(): Promise<User> {
    const user: User = {
      email: 'volgodark@gmail.com',
      type: 'user',
      password: 'volgodark',
      username: 'volgodark',
      about: faker.lorem.paragraph()
    };
    let userRepository = new UserRepository();

    return userRepository.createForcing(user);
  }

  /**
   * @returns {Promise<Activity[]>}
   */
  private createActivities(user: User): Promise<Activity[]> {
    const activities: Activity[] = [{
      name: 'Premier League could have no English managers - Sam Allardyce',
      description: faker.lorem.paragraph(),
      source: 'http://www.bbc.com/sport/football/36295573',
      userId: user.id,
      category: 'root',
      tags: [{value: 'Fooball', rank: 0}, {value: 'UEFA', rank: 0}, {value: 'PremierLegue', rank: 0}],
      type: 'rss'
    }, {
      name: 'Barcelona win La Liga: Real Madrid boss admits rivals deserved to win',
      description: faker.lorem.paragraph(),
      source: 'http://www.bbc.com/sport/football/36294900',
      userId: user.id,
      category: 'root',
      tags: [{value: 'UEFA', rank: 0}, {value: 'Barcelona', rank: 0}],
      type: 'rss'
    }, {
      name: 'Cristiano Ronaldo scored twice as Real Madrid',
      description: faker.lorem.paragraph(),
      source: 'http://www.bbc.com/sport/football/36250293',
      userId: user.id,
      category: 'root',
      tags: [{value: 'Ronaldo', rank: 0}, {value: 'UEFA', rank: 0}, {value: 'Barcelona', rank: 0}],
      type: 'rss'
    }];
    let activityRepository = new ActivityRepository();

    return activityRepository.createMany(activities);
  }


  /**
   * @returns {Promise<Comment[]>}
   */
  private createComments(activities: Activity[]): Promise<Comment[]> {
    const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
    const comments: Comment[] = [{
      createdAt: new Date(Date.now() - (DAY_IN_MILLISECONDS * 4)),
      text: faker.lorem.sentences(),
      userId: activities[0].userId,
      activityId: activities[0].id
    }, {
      createdAt: new Date(Date.now() - (DAY_IN_MILLISECONDS * 3)),
      text: faker.lorem.sentences(),
      userId: activities[0].userId,
      activityId: activities[0].id
    }, {
      createdAt: new Date(Date.now() - (DAY_IN_MILLISECONDS * 2)),
      text: faker.lorem.sentences(),
      userId: activities[0].userId,
      activityId: activities[1].id
    }, {
      createdAt: new Date(Date.now() - (DAY_IN_MILLISECONDS)),
      text: faker.lorem.sentences(),
      userId: activities[0].userId,
      activityId: activities[2].id
    }];
    let commentRepository = new CommentRepository();

    return commentRepository.createMany(comments);
  }

  /**
   * @param {string} collection name of collection
   * @returns {Promise}
   */
  private recreate(collection: string): Promise<void> {
    return App.dataSources.mongo
      .automigrate(collection)
      .then(() => Promise.resolve())
      .catch((err: Error) => {
        console.log(err);

        return Promise.resolve()
      });
  }

}
