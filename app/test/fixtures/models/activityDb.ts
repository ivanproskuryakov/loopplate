import * as App from 'app/server/server';
import * as activitiesMock from 'app/test/fixtures/models/activity';
import * as usersMock from 'app/test/fixtures/models/user';

/**
 * @returns {Promise}
 */
export function persistActivitiesWithUsers(total: number, categoryName: string) {
  let user = usersMock.user();
  let activities = activitiesMock.get(total);

  return App.models.user
    .create(user)
    .then(user => {

      activities.forEach((activity) => {
        activity.userId = user.id;
        activity.category = categoryName;
      });

      return Promise.resolve(activities)
    })
    .then(() => App.models.Activity.create(activities));
}
