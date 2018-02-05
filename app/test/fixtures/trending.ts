import {Promise} from 'es6-promise';
import * as App from 'app/server/server';
import * as usersMock from 'app/test/fixtures/models/user';
import * as activitiesMock from 'app/test/fixtures/models/activity';
import {User} from 'app/interface/user/user';

export const Total = 20;
export const Tags = [
  /* Football */
  ['PremierLeague'],
  ['SerieA'],
  ['SerieA'],
  ['PremierLeague'],
  ['PremierLeague'],
  ['SerieA'],
  ['SerieA'],
  ['LaLiga'],
  /* basketball */
  ['NBA'],
  ['NBA'],
  ['WBA'],
  ['NBA'],
  ['NBA'],
  ['WBA'],
  /* volleyball */
  ['FIVB'],
  ['FIVB'],
  ['FIVB'],
  ['FIVB'],
  ['FIVB'],
  ['FIVB'],
  ['FIVB']
];

export const Categories = [
  'football',
  'football',
  'football',
  'football',
  'football',
  'football',
  'football',
  'football',

  'basketball',
  'basketball',
  'basketball',
  'basketball',
  'basketball',
  'basketball',

  'volleyball',
  'volleyball',
  'volleyball',
  'volleyball',
  'volleyball',
  'volleyball'
];

export const Users: User[] = [
  /* Football */
  usersMock.user('espn.com', 'website'),      // PremierLeague
  usersMock.user('mirror.co.uk', 'website'),  // SerieA
  usersMock.user('mirror.co.uk', 'website'),  // SerieA
  usersMock.user('espn.com', 'website'),      // PremierLeague
  usersMock.user('mirror.co.uk', 'website'),  // PremierLeague
  usersMock.user('espn.com', 'website'),      // SerieA
  usersMock.user('mirror.co.uk', 'website'),  // SerieA
  usersMock.user('uefa.com', 'website'),      // LaLiga

  usersMock.user('nba.com', 'website'),       // NBA
  usersMock.user('nba.com', 'website'),       // NBA
  usersMock.user('wba.com', 'website'),       // WBA
  usersMock.user('nba.com', 'website'),       // NBA
  usersMock.user('nba.com', 'website'),       // NBA
  usersMock.user('wba.com', 'website'),       // WBA

  usersMock.user('fivb.com', 'website'),      // FIVB
  usersMock.user('fivb.com', 'website'),      // FIVB
  usersMock.user('fivb.com', 'website'),      // FIVB
  usersMock.user('fivb.com', 'website'),      // FIVB
  usersMock.user('fivb.com', 'website'),      // FIVB
  usersMock.user('fivb.com', 'website')       // FIVB
];

/**
 * @returns {Promise}
 */
export function prepare(): Promise<void> {

  return App.models.Activity.destroyAll({})
    .then(() => {
      // generate users
      return Users
        .reduce((chain, item, index) => {

          return chain.then(() =>
            App.models.user.findOrCreate({where: {username: item.username}}, item)
              .then(result => Users[index] = result[0].toJSON())
          );
        }, Promise.resolve());
    })
    .then(() => new Promise((resolve, reject) => {
      // generate activities
      let activities = activitiesMock.get(Total, new Date);
      // set date to long before to test quantity after
      activities[0].createdAt = new Date(1960, 1);
      // set predefined tags & user
      activities.forEach((item, index) => {
        item.tags = Tags[index].map(value => ({value, rank: 0}));
        item.userId = Users[index].id;
        item.category = Categories[index];
      });

      // save
      App.models.Activity.create(activities, err => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    }));
}

/**
 * @returns {any[]}
 */
export function expected(): any[] {
  return [
    {
      category: 'football',
      tags: [
        {
          value: 'SerieA',
          rank: 4
        },
        {
          value: 'PremierLeague',
          rank: 2
        },
        {
          value: 'LaLiga',
          rank: 1
        }
      ],
      activities: [],
      'users': [
        {
          username: 'mirror.co.uk',
          firstName: undefined,
          lastName: undefined,
          youtube: [],
          email: undefined,
          id: undefined,
          updatedAt: undefined,
          avatar: {
            type: 'image',
            location: undefined,
          },
          background: null,
          followersCount: 0,
          isFollowing: false,
          followingsCount: 0,
          activitiesCount: 4
        },
        {
          username: 'espn.com',
          firstName: undefined,
          lastName: undefined,
          youtube: [],
          email: undefined,
          id: undefined,
          updatedAt: undefined,
          avatar: {
            type: 'image',
            location: undefined,
          },
          background: null,
          followersCount: 0,
          isFollowing: false,
          followingsCount: 0,
          activitiesCount: 3
        },
        {
          username: 'uefa.com',
          firstName: undefined,
          lastName: undefined,
          youtube: [],
          email: undefined,
          id: undefined,
          updatedAt: undefined,
          avatar: {
            type: 'image',
            location: undefined,
          },
          background: null,
          followersCount: 0,
          isFollowing: false,
          followingsCount: 0,
          activitiesCount: 1
        }
      ]
    },
    {
      category: 'basketball',
      tags: [
        {
          value: 'NBA',
          rank: 4
        },
        {
          value: 'WBA',
          rank: 2
        }
      ],
      activities: [],
      'users': [
        {
          username: 'nba.com',
          firstName: undefined,
          lastName: undefined,
          youtube: [],
          email: undefined,
          id: undefined,
          updatedAt: undefined,
          avatar: {
            type: 'image',
            location: undefined,
          },
          background: null,
          followersCount: 0,
          isFollowing: false,
          followingsCount: 0,
          activitiesCount: 4
        },
        {
          username: 'wba.com',
          firstName: undefined,
          lastName: undefined,
          youtube: [],
          email: undefined,
          id: undefined,
          updatedAt: undefined,
          avatar: {
            type: 'image',
            location: undefined,
          },
          background: null,
          followersCount: 0,
          isFollowing: false,
          followingsCount: 0,
          activitiesCount: 2
        }
      ]
    },
    {
      category: 'volleyball',
      tags: [
        {
          value: 'FIVB',
          rank: 6
        }
      ],
      activities: [],
      'users': [
        {
          username: 'fivb.com',
          firstName: undefined,
          lastName: undefined,
          youtube: [],
          email: undefined,
          id: undefined,
          updatedAt: undefined,
          avatar: {
            type: 'image',
            location: undefined,
          },
          background: null,
          followersCount: 0,
          isFollowing: false,
          followingsCount: 0,
          activitiesCount: 6
        }
      ]
    }
  ];
}
