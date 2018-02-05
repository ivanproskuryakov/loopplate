import * as Promise from 'bluebird';
import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import * as faker from 'faker';
import * as App from 'app/server/server';
import * as slug from 'slug';

import * as activitiesMock from 'app/test/fixtures/models/activity';
import {Activity} from 'app/interface/activity/activity';

@suite('Models - Activity model')
export class ActivityModelTest {

  @test('should create valid activities')
  test_insert() {
    let activities = activitiesMock.get(5);

    return Promise.map(activities, (activity: Activity) => App.models.Activity
      .create(activity)
      .then(created => {
        expect(created).to.exist;
        expect(created.id).to.exist;
        expect(created.name).to.exist;
        expect(created.description).to.exist;
        expect(created.category).to.exist;
        expect(created.media).to.exist.to.have.length.above(0);
        expect(created.createdAt).to.exist;
        expect(created.slug).to.exist;
        expect(created.tags).to.exist;
        expect(created.tags).to.be.an.instanceOf(Array);
        expect(created.tags.length).to.equal(3);
        expect(created.type).to.exist;
        expect(created.type).to.equal('rss');
      }));
  }

  @test('should not create invalid activities')
  test_insert_invalid() {
    let activities = activitiesMock.invalid();

    return Promise.map(activities, (activity: Activity) => {
        return App.models.Activity
          .create(activity)
          .then(() => Promise.reject(new Error('should not create invalid activity')))
          .catch(() => Promise.resolve());
      }
    );
  }

  @test('should update activity: name && description')
  test_update(done) {
    App.models.Activity.findOne({}, (err, activity) => {
      expect(err).to.not.exist;

      let name = faker.lorem.sentence();
      let description = faker.lorem.paragraph();
      let newSlug = slug(name, {remove: null});
      activity.updateAttributes({
        name: name,
        description: description
      }, (err: Error, result: Activity, c) => {
        expect(err).to.not.exist;
        expect(result).to.exist;
        expect(result.name).equal(name);
        expect(result.description).equal(description);
        expect(result.slug).equal(newSlug);

        done();
      });
    });
  }

  @test('should find activity by tag')
  test_find_by_tag(done) {
    App.models.Activity.findOne({}, (err, activity) => {
      expect(err).to.not.exist;
      expect(activity).to.exist;

      let tag = activity.tags[0];
      App.models.Activity.findOne({where: {'tags.value': tag.value}}, (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.exist;
        expect(result.id).to.exist;

        done();
      });
    });
  }

  @test('should delete activity')
  test_delete(done) {
    App.models.Activity.findOne({}, (err, activity) => {
      expect(err).to.not.exist;

      activity.delete(err => {
        expect(err).to.not.exist;

        done();
      });
    });
  }
}
