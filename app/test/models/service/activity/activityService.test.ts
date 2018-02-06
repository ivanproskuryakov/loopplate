import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {Promise} from 'es6-promise';
import {promisify} from 'bluebird';
const moment = require('moment');
import * as nock from 'nock';
import * as faker from 'faker';

import * as activityMock from 'app/test/fixtures/models/activity';
import * as usersMock from 'app/test/fixtures/models/user';
import {HttpMock} from 'app/test/mock/httpMock';
import {UserUtils} from 'app/test/utils/userUtils';
import {ActivityUtils} from 'app/test/utils/activityUtils';

import * as App from 'app/server/server';
import {ServerError} from 'app/error/serverError';
import {ActivityService} from 'app/models/service/activity/activityService';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';
import {Activity} from 'app/interface/activity/activity';

@suite('Service - ActivityServiceTest')
export class ActivityServiceTest {

  private static fakeUrl = faker.internet.url();
  private static Activity: Activity;
  private static Login: {user: User, token: AccessToken};

  static before(done) {
    // setup fake url hook
    nock(ActivityServiceTest.fakeUrl)
      .get('/')
      .replyWithFile(200, 'app/test/fixtures/youtube.html');
    // setup yql url hook
    nock('https://query.yahooapis.com')
      .filteringPath(() => '/')
      .post('/')
      .replyWithFile(200, 'app/test/fixtures/yql.json');

    UserUtils.registerUser()
      .then(login => ActivityServiceTest.Login = login)
      .then(() => {
        let activity = activityMock.get(1, null, null, null,
          ActivityServiceTest.Login.user.id)[0];
        return App.models.Activity.create(activity);
      })
      .then(result => ActivityServiceTest.Activity = result)
      .then(() => done())
      .catch(done);
  }

  @test('should return activities by filter')
  test_get_activities() {

    return ActivityService.getActivities(
      {where: {userId: ActivityServiceTest.Login.user.id}},
      ActivityServiceTest.Login.user)
      .then(activities => {
        expect(activities).to.be.an('array');
        activities.forEach(item => {
          expect(item).to.have.property('comments');
          expect(item).to.have.property('isLiked');
          expect(item).to.have.property('likesCount');
          expect(item).to.have.property('user');
        });
      });
  }

  @test('should like activity')
  test_activity_like() {

    return ActivityService.like(ActivityServiceTest.Login.user, ActivityServiceTest.Activity.id)
      .then(() => App.models.Activity.findById(ActivityServiceTest.Activity.id))
      .then(activity => {
        expect(activity.likedUserIds).to.have.length(1);
      });
  }

  @test('should throw duplicate error when like already liked activity')
  test_activity_already_liked() {

    return ActivityService.like(ActivityServiceTest.Login.user, ActivityServiceTest.Activity.id)
      .then(activity => Promise.reject(new Error('like activity that already liked')))
      .catch(err => {
        expect(err.name).to.equal('ValidationError');

        return Promise.resolve();
      });
  }

  @test('should inject isLiked=true')
  test_inject_isliked_true() {

    return App.models.Activity.findById(ActivityServiceTest.Activity.id)
      .then(activity => ActivityService.injectProperties(activity, ActivityServiceTest.Login.user))
      .then(activity => {
        expect(activity.isLiked).to.be.true;
      });
  }

  @test('should inject isLiked=false')
  test_inject_isliked_false() {
    return App.models.Activity.findById(ActivityServiceTest.Activity.id)
      .then(activity => ActivityService.injectProperties(activity, <any>{id: 'some dummy id'}))
      .then((activity) => {
        expect(activity.isLiked).to.be.false;
      });
  }

  @test('should dislike activity')
  test_activity_dislike() {

    return ActivityService.dislike(ActivityServiceTest.Login.user, ActivityServiceTest.Activity.id)
      .then(() => App.models.Activity.findById(ActivityServiceTest.Activity.id))
      .then(activity => {
        expect(activity.likedUserIds).to.have.length(0);
      });
  }

  @test('should throw conflict error when dislike already disliked activity')
  test_activity_already_disliked() {

    return ActivityService.dislike(ActivityServiceTest.Login.user, ActivityServiceTest.Activity.id)
      .then(activity => Promise.reject(new Error('like activity that already disliked')))
      .catch(err => {
        expect(err.message).to.equal('Conflict');

        return Promise.resolve();
      });
  }

  @test('should inject likes count & is activity liked by the user')
  test_inject_likes() {
    const LikesCount = 3;
    let newActivity = ActivityServiceTest.Activity.toJSON();

    return ActivityUtils
      .createLikes(newActivity, LikesCount)
      .then(() => App.models.Activity.findOne({where: {id: newActivity.id}}))
      .then((updatedActivity) => ActivityService.injectProperties(updatedActivity, ActivityServiceTest.Login.user))
      .then((injectedActivity) => {
        expect(injectedActivity.likesCount).to.equal(LikesCount);
      });
  }

  @test('should not save activity view from crawler')
  test_crawler_save_activity_view() {
    let activity = ActivityServiceTest.Activity.toJSON();
    let req = HttpMock.createRequestByLogin(ActivityServiceTest.Login.user, ActivityServiceTest.Login.token);
    req.headers = {
      'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    };

    return ActivityService.updateActivityViews(activity, req)
      .then<Activity>(() => App.models.Activity.findById(activity.id))
      .then(result => {
        expect(result.views).to.not.exist;
      });
  }

  @test('should save activity view')
  test_save_activity_view() {
    let activity = ActivityServiceTest.Activity.toJSON();
    let req = HttpMock.createRequestByLogin(ActivityServiceTest.Login.user, ActivityServiceTest.Login.token);

    return ActivityService.updateActivityViews(activity, req)
      .then<Activity>(() => App.models.Activity.findById(activity.id))
      .then(result => {
        expect(result.views).to.have.length.above(0);
        expect(result.views[result.views.length - 1].userId.toString())
          .to.equal(ActivityServiceTest.Login.user.id.toString());
        expect(result.views[result.views.length - 1].ip).to.equal('127.0.0.1');
      });
  }

  @test('should not save dupe activity view')
  test_dupe_save_activity_view() {
    let activity = ActivityServiceTest.Activity.toJSON();
    let req = HttpMock.createRequestByLogin(ActivityServiceTest.Login.user, ActivityServiceTest.Login.token);

    return App.models.Activity.findById(activity.id)
      .then(previous => {
        return ActivityService.updateActivityViews(activity, req)
          .then<Activity>(() => App.models.Activity.findById(activity.id))
          .then(result => {
            expect(result.views.length).to.equal(previous.views.length);
          });
      });
  }

  @test('should inject views count')
  test_inject_views_count() {
    const ViewCount = 3;
    let newActivity = ActivityServiceTest.Activity.toJSON();

    return ActivityUtils.createViews(newActivity, ViewCount)
      .then(() => App.models.Activity.findOne({where: {id: newActivity.id}}))
      .then((updatedActivity) => ActivityService.injectProperties(updatedActivity, ActivityServiceTest.Login.user))
      .then((injectedActivity) => {
        expect(injectedActivity.viewsCount).to.equal(ViewCount);
      });
  }

  @test('should validate empty payload')
  test_validate_empty_payload() {

    return (<any>ActivityService).validateActivity(null)
      .then(() => Promise.reject('should not pass validation'))
      .catch((err: ServerError) => {
        expect(err.message).to.equal('payload is required');
        expect(err.statusCode).to.equal(422);
      });
  }

  @test('should require type in payload')
  test_require_type_in_payload() {

    return (<any>ActivityService).validateActivity({})
      .then(() => Promise.reject('should not pass validation'))
      .catch((err: ServerError) => {
        expect(err.message).to.equal('type is required');
        expect(err.statusCode).to.equal(422);
      });
  }

  @test('should require name in payload when posting text activity')
  test_require_name_payload() {

    let validate = (<any>ActivityService).validateActivity;
    let validateError = (err: ServerError) => {
      expect(err.message).to.equal('title is required');
      expect(err.statusCode).to.equal(422);
    };

    return validate({
      type: 'text'
    })
      .then(() => Promise.reject('should not pass validation'))
      .catch(validateError);
  }

  @test('should require source in payload for link activity')
  test_require_source_in_payload() {

    return (<any>ActivityService).validateActivity({
      type: 'link'
    })
      .then(() => Promise.reject('should not pass validation'))
      .catch((err: ServerError) => {
        expect(err.message).to.equal('link source is required');
        expect(err.statusCode).to.equal(422);
      });
  }

  @test('should require media in payload for image activity')
  test_require_media_in_payload() {

    return (<any>ActivityService).validateActivity({
      type: 'image',
      tags: ['a', 'b', 'c']
    })
      .then(() => Promise.reject('should not pass validation'))
      .catch((err: ServerError) => {
        expect(err.message).to.equal('media is required');
        expect(err.statusCode).to.equal(422);
      });
  }

  @test('should post text activity')
  test_post_text() {
    let payload = {
      type: 'text',
      name: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      tags: ['tag1', 'tag2', 'tag3']
    };

    return ActivityService.post(ActivityServiceTest.Login.user, payload)
      .then(activity => {
        expect(activity).to.exist;
        expect(activity.name).to.equal(payload.name);
        expect(activity.description).to.equal(payload.description);
        expect(activity.tags).to.have.length(3);
        expect(activity.tags[0]).to.deep.equal({value: 'Tag1', rank: 0});
        expect(activity.tags[1]).to.deep.equal({value: 'Tag2', rank: 0});
        expect(activity.tags[2]).to.deep.equal({value: 'Tag3', rank: 0});
        expect(activity.type).to.equal('text');
        expect(activity.slug).to.exist;
        expect(activity.createdAt).to.exist;
        expect(activity.userId).to.equal(ActivityServiceTest.Login.user.id);
      });
  }


  @test('should post text activity with name only')
  test_post_text_name_only() {
    let payload = {
      type: 'text',
      name: faker.lorem.sentence(),
    };

    return ActivityService.post(ActivityServiceTest.Login.user, payload)
      .then(activity => {
        expect(activity).to.exist;
        expect(activity.name).to.equal(payload.name);
        expect(activity.type).to.equal('text');
        expect(activity.slug).to.exist;
        expect(activity.createdAt).to.exist;
        expect(activity.userId).to.equal(ActivityServiceTest.Login.user.id);
      });
  }

  @test('should post link activity')
  test_post_link() {
    let payload = {
      type: 'link',
      source: ActivityServiceTest.fakeUrl
    };

    return ActivityService.post(ActivityServiceTest.Login.user, payload)
      .then(activity => {
        expect(activity).to.exist;
        expect(activity.name).to.equal('World of Warcraft: Legion - Anduins Theme');
        expect(activity.description).to.equal('The Tomb of Sargeras has been reopened, and the demons of the ' +
          'Burning Legion pour into our world. Their full, terrifying might is fixed on summoning the Dark...');
        expect(activity.media).to.have.length(2);
        expect(activity.media[0].location).to.equal('https://i.ytimg.com/vi/EvWH1KKOsoY/maxresdefault.jpg');
        expect(activity.media[0].type).to.equal('image');
        expect(activity.media[1].location).to.equal('https://www.youtube.com/embed/EvWH1KKOsoY');
        expect(activity.media[1].type).to.equal('video');
        expect(activity.source).to.equal(ActivityServiceTest.fakeUrl);
        expect(activity.tags).to.have.length(2);
        expect(activity.tags[0]).to.deep.equal({value: 'WorldOfWarcraftLegion', rank: 2});
        expect(activity.tags[1]).to.deep.equal({value: 'LegionMusic', rank: 0});
        expect(activity.type).to.equal('link');
        expect(activity.slug).to.exist;
        expect(activity.createdAt).to.exist;
        expect(activity.userId).to.equal(ActivityServiceTest.Login.user.id);
      });
  }

  @test('should post image activity')
  test_post_image() {
    let payload = {
      type: 'image',
      media: [{
        location: faker.image.imageUrl(),
        type: 'image'
      }],
      name: 'name value',
      description: 'description value',
      tags: ['tag1', 'tag2', 'tag3']
    };

    return ActivityService.post(ActivityServiceTest.Login.user, payload)
      .then(activity => {
        expect(activity).to.exist;
        expect(activity.name).to.equal(payload.name);
        expect(activity.description).to.equal(payload.description);
        expect(activity.media).to.have.length(1);
        expect(activity.media[0].location).to.equal(payload.media[0].location);
        expect(activity.media[0].type).to.equal(payload.media[0].type);
        expect(activity.tags).to.have.length(3);
        expect(activity.tags[0]).to.deep.equal({value: 'Tag1', rank: 0});
        expect(activity.tags[1]).to.deep.equal({value: 'Tag2', rank: 0});
        expect(activity.tags[2]).to.deep.equal({value: 'Tag3', rank: 0});
        expect(activity.type).to.equal('image');
        expect(activity.slug).to.exist;
        expect(activity.createdAt).to.exist;
        expect(activity.userId).to.equal(ActivityServiceTest.Login.user.id);
      });
  }

  @test('should remove old activities with no action on it')
  test_remove_no_action() {
    let activities = activityMock.get(11, moment().subtract(90, 'days').toDate());
    activities[0].achievements = ['trending'];
    activities[2].likedUserIds = ['guid'];
    activities[3].createdAt = new Date();
    // activities[9] - with comments

    let expectedDBCount = 4;
    let expectedDeletedCount = 7;

    return Promise.all([
      App.models.Activity.destroyAll({}),
      App.models.Comment.destroyAll({})
    ])
      .then(() => promisify(App.models.Activity.create).call(App.models.Activity, activities, {}))
      .then(activities => App.models.Comment.create({text: 'test', activityId: activities[9].id, userId: 'test'}))
      .then(() => ActivityService.removeUnusedRssActivities())
      .then(count => {
        expect(count).to.eq(expectedDeletedCount);

        return App.models.Activity.find({});
      })
      .then(result => {
        expect(result).to.be.instanceof(Array).have.lengthOf(expectedDBCount);

      });
  }

  @test('should get valid activity url')
  test_activity_url() {
    let activity = activityMock.get(1)[0];
    activity.user = usersMock.get(1)[0];

    let expected = `http://${App.get('domain')}/u/${activity.user.username}/a/${activity.slug}`;
    let result = ActivityService.getActivityUrl(activity);

    expect(result).to.eq(expected);
  }

  @test('should get valid activity related url')
  test_activity_related_url() {
    let activity = activityMock.get(1)[0];
    activity.user = usersMock.get(1)[0];
    let resource = 'youtube';

    let expected = `http://${App.get('domain')}/u/${activity.user.username}/a/${activity.slug}/${resource}`;
    let result = ActivityService.getActivityRelatedUrl(activity, resource);

    expect(result).to.eq(expected);
  }
}
