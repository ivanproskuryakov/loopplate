import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import {UserUtils} from 'app/test/utils/userUtils';
import {ActivityUtils} from 'app/test/utils/activityUtils';
import * as activityMock from 'app/test/fixtures/models/activity';
import {HttpMock} from 'app/test/mock/httpMock';
import {UserServiceTest} from 'app/test/models/service/userService.test';

import * as App from 'app/server/server';
import {ActivityEvent} from 'app/models/event/activityEvent';
import {Activity} from 'app/interface/activity/activity';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';

@suite('Models - Events - ActivityEventTest')
export class ActivityEventTest {

  private static LikesCount = 1;
  private static CommentsCount = 3;
  private static Activity: Activity;
  private static Login: { user: User, token: AccessToken };

  static before() {
    return UserUtils.registerUser()
      .then(login => ActivityEventTest.Login = login)
      .then(() => {
        let activity = activityMock.get(1, null, null, null, ActivityEventTest.Login.user.id)[0];
        activity.likedUserIds = [ActivityEventTest.Login.user.id];
        return App.models.Activity.create(activity);
      })
      .then(result => ActivityEventTest.Activity = result)
      .then(() => App.models.Activity.update({id: ActivityEventTest.Activity.id}, {timelineId: null}))
      .then(() => {
        return ActivityUtils.createComments(ActivityEventTest.Activity,
          ActivityEventTest.CommentsCount, ActivityEventTest.Login.user.id);
      });
  }

  @test('should not add activity to timeline on update')
  test_add_new_to_timeline_on_update() {
    return ActivityEvent
      .onActivitySaved({instance: ActivityEventTest.Activity, isNewInstance: false})
      .then(() => App.models.Activity.findOne({where: {id: ActivityEventTest.Activity.id}, fields: ['timelineId']}))
      .then(({timelineId}) => {
        expect(timelineId).to.not.exist;
      });
  }

  @test('should add activity to timeline on create')
  test_add_new_to_timeline_on_save() {
    return ActivityEvent
      .onActivitySaved({instance: ActivityEventTest.Activity, isNewInstance: true})
      .then(() => App.models.Activity.findOne({where: {id: ActivityEventTest.Activity.id}, fields: ['timelineId']}))
      .then(({timelineId}) => {
        expect(timelineId).to.equal('mock id');
      });
  }

  @test('should inject values on onRemoteFindOne')
  test_inject_on_onRemoteFindOne() {
    let ctx = {
      result: ActivityEventTest.Activity,
      req: HttpMock.createRequestByLogin(ActivityEventTest.Login.user, ActivityEventTest.Login.token)
    };

    return ActivityEvent
      .onRemoteFindOne(ctx)
      .then(() => {
        expect(ctx.result).to.exist;

        // likes count
        expect(ctx.result.likesCount).to.equal(ActivityEventTest.LikesCount);
        // is liked
        expect(ctx.result.isLiked).to.be.true;
        // user
        UserServiceTest.isPublicProfile(ctx.result.user);
        // comments
        expect(ctx.result.comments).to.have.length(ActivityEventTest.CommentsCount);
      });
  }

  @test('should inject values on onRemoteFindById')
  test_inject_on_onRemoteFindById() {
    let ctx = {
      result: ActivityEventTest.Activity,
      req: HttpMock.createRequestByLogin(ActivityEventTest.Login.user, ActivityEventTest.Login.token)
    };

    return ActivityEvent
      .onRemoteFindOne(ctx)
      .then(() => {
        expect(ctx.result).to.exist;

        // likes count
        expect(ctx.result.likesCount).to.equal(ActivityEventTest.LikesCount);
        // is liked
        expect(ctx.result.isLiked).to.be.true;
        // user
        UserServiceTest.isPublicProfile(ctx.result.user);
        // comments
        expect(ctx.result.comments).to.have.length(ActivityEventTest.CommentsCount);
      });
  }

  @test('should inject values on onRemoteFind')
  test_inject_on_onRemoteFind() {
    let ctx = {
      result: [ActivityEventTest.Activity],
      req: HttpMock.createRequestByLogin(ActivityEventTest.Login.user, ActivityEventTest.Login.token)
    };

    return ActivityEvent
      .onRemoteFind(ctx)
      .then(() => {
        expect(ctx.result[0]).to.exist;

        // likes count
        expect(ctx.result[0].likesCount).to.equal(ActivityEventTest.LikesCount);
        // is liked
        expect(ctx.result[0].isLiked).to.be.true;
        // user
        UserServiceTest.isUser(ctx.result[0].user);

        // comments
        // expect(ctx.result[0].comments).to.have.length(ActivityEventTest.CommentsCount);
      });
  }

  @test('should fix username filter in onBeforeRemoteFindOne')
  test_fix_username_filter_on_onRemoteFindOne() {
    let ctx = {
      args: {
        filter: {
          where: {
            slug: 'some-slug',
            username: ActivityEventTest.Login.user.username
          }
        }
      }
    };

    return ActivityEvent
      .onBeforeRemoteFindOne(ctx)
      .then(() => {
        let where: any = ctx.args.filter.where;

        expect(where).to.exist;
        expect(where).to.have.property('slug');
        expect(where).to.not.have.property('username');
        expect(where).to.have.property('userId');
        expect(where.userId.toString()).to.equal(ActivityEventTest.Login.user.id.toString());
      });
  }
}
