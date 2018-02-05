import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {ActivityRepository} from 'app/models/repository/activityRepository';
import * as ActivityDbMock from 'app/test/fixtures/models/activityDb';
import * as faker from 'faker';

const moment = require('moment');
const total = 10;
const category = faker.lorem.sentence();

@suite('Repository - ActivityRepositoryTest')
export class ActivityRepositoryTest {

  static before(done) {
    ActivityDbMock
      .persistActivitiesWithUsers(total, category)
      .then(() => done());
  }

  @test('should return activities by date period')
  test_find_activities() {
    let from = moment().subtract(1, 'hours').toDate();
    let to = moment().add(1, 'hours').toDate();
    const activityRepository = new ActivityRepository();

    return activityRepository
      .findActivities(from, to, category)
      .then(result => {
        expect(result).to.exist;
        expect(result).to.be.an.instanceOf(Array);
        expect(result.length).to.equal(total);
        result.forEach(item => {
          expect(item.user).to.exist;
        });
      });
  }

  @test('should return activities by past 5 hours')
  test_find_activities_by_past() {
    const activityRepository = new ActivityRepository();

    return activityRepository
      .findActivitiesByPast(5, category)
      .then(result => {
        expect(result).to.exist;
        expect(result).to.be.an.instanceOf(Array);
        expect(result.length).to.equal(total);
        result.forEach(item => {
          expect(item.user).to.exist;
        });
      });
  }


}
