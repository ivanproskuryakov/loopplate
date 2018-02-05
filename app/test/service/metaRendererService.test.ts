import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {UserUtils} from 'app/test/utils/userUtils';
import * as activityMock from 'app/test/fixtures/models/activity';

import {existsSync} from 'fs';
import * as cheerio from 'cheerio';

import * as App from 'app/server/server';
import {MetaRendererService} from 'app/service/metaRenderer';
import {ActivityService} from 'app/models/service/activity/activityService';
import {UserService} from 'app/models/service/user/userService';
import {Activity} from 'app/interface/activity/activity';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';

@suite('Service - MetaRendererService')
export class MetaRendererServiceTest {

  private static Activity: Activity;
  private static Login: { user: User, token: AccessToken };

  static before(done) {
    UserUtils.registerUser()
      .then(login => MetaRendererServiceTest.Login = login)
      .then(() => App.models.Activity.create(activityMock.get(1, null, null, null, MetaRendererServiceTest.Login.user.id)[0]))
      .then(created => {
        MetaRendererServiceTest.Activity = created.toJSON();
        MetaRendererServiceTest.Activity.user = MetaRendererServiceTest.Login.user;
      })
      .then(() => done())
      .catch(done);
  }

  @test('template file should exists')
  test_template_exists() {
    let template = (<any>new MetaRendererService()).META_TEMPLATE;

    expect(existsSync(template)).to.be.true;
  }

  @test('should get default values from config')
  test_default_values() {
    let renderer = <any>new MetaRendererService();

    expect(renderer.defaultTitle).to.equal(App.get('meta').title);
    expect(renderer.defaultDescription).to.equal(App.get('meta').description);
  }

  @test('should render index page meta')
  test_index() {

    return new MetaRendererService()
      .renderIndex()
      .then(html => {
        expect(html).to.exist;

        let $ = cheerio.load(html);
        expect($('title').text()).to.equal(App.get('meta').title);
        expect($('meta[name="description"]').attr('content')).to.equal(App.get('meta').description);
      });
  }

  @test('should render activity details page meta')
  test_activity() {

    return new MetaRendererService()
      .renderActivity(MetaRendererServiceTest.Activity.slug)
      .then(html => {
        expect(html).to.exist;

        let $ = cheerio.load(html);
        let expected = {
          title: MetaRendererServiceTest.Activity.name + ' - ' + App.get('meta').title,
          description: MetaRendererServiceTest.Activity.description.substring(0, 200) + ' - ' + App.get('meta').description,
          keywords: MetaRendererServiceTest.Activity.tags.map(x => x.value).join(', '),
          tags: MetaRendererServiceTest.Activity.tags.map(x => x.value),
          type: 'article',
          card: 'summary',
          image: MetaRendererServiceTest.Activity.media[0].location,
          url: ActivityService.getActivityUrl(MetaRendererServiceTest.Activity),
          publushTime: MetaRendererServiceTest.Activity.createdAt.toString(),
          author: MetaRendererServiceTest.Login.user.username,
          section: MetaRendererServiceTest.Activity.category
        };

        expect($('title').text()).to.equal(expected.title);
        expect($('meta[property="og:title"]').attr('content')).to.equal(expected.title);
        expect($('meta[property="twitter:title"]').attr('content')).to.equal(expected.title);

        expect($('meta[name="keywords"]').attr('content')).to.equal(expected.keywords);

        expect($('meta[name="description"]').attr('content')).to.equal(expected.description);
        expect($('meta[property="twitter:description"]').attr('content')).to.equal(expected.description);

        expect($('meta[property="og:type"]').attr('content')).to.equal(expected.type);
        expect($('meta[property="twitter:card"]').attr('content')).to.equal(expected.card);

        expect($('meta[property="og:image"]').attr('content')).to.equal(expected.image);
        expect($('meta[property="twitter:image"]').attr('content')).to.equal(expected.image);

        expect($('meta[property="og:url"]').attr('content')).to.equal(expected.url);
        expect($('meta[property="twitter:url"]').attr('content')).to.equal(expected.url);

        expect($('meta[property="article:published_time"]').attr('content')).to.equal(expected.publushTime);
        expect($('meta[property="article:author"]').attr('content')).to.equal(expected.author);
        expect($('meta[property="article:section"]').attr('content')).to.equal(expected.section);

        $('meta[property="article:tag"]')
          .toArray()
          .forEach((tag, i) => expect($(tag).attr('content')).to.equal(expected.tags[i]));
      });
  }

  @test('should render user collection page meta')
  test_user() {

    return new MetaRendererService()
      .renderUser(MetaRendererServiceTest.Login.user.username)
      .then(html => {
        expect(html).to.exist;

        let $ = cheerio.load(html);
        let expected = {
          title: MetaRendererServiceTest.Login.user.username + ' - ' + App.get('meta').title,
          description: MetaRendererServiceTest.Login.user.username + ' - ' + App.get('meta').description,
          keywords: MetaRendererServiceTest.Login.user.username,
          type: 'profile',
          card: 'summary',
          image: MetaRendererServiceTest.Login.user.avatar.location,
          url: UserService.getUserUrl(MetaRendererServiceTest.Login.user),
          firstName: MetaRendererServiceTest.Login.user.firstName,
          lastName: MetaRendererServiceTest.Login.user.lastName,
          username: MetaRendererServiceTest.Login.user.username
        };

        expect($('title').text()).to.equal(expected.title);
        expect($('meta[property="og:title"]').attr('content')).to.equal(expected.title);
        expect($('meta[property="twitter:title"]').attr('content')).to.equal(expected.title);

        expect($('meta[name="keywords"]').attr('content')).to.equal(expected.keywords);

        expect($('meta[name="description"]').attr('content')).to.equal(expected.description);
        expect($('meta[property="twitter:description"]').attr('content')).to.equal(expected.description);

        expect($('meta[property="og:type"]').attr('content')).to.equal(expected.type);
        expect($('meta[property="twitter:card"]').attr('content')).to.equal(expected.card);

        expect($('meta[property="og:image"]').attr('content')).to.equal(expected.image);
        expect($('meta[property="twitter:image"]').attr('content')).to.equal(expected.image);

        expect($('meta[property="og:url"]').attr('content')).to.equal(expected.url);
        expect($('meta[property="twitter:url"]').attr('content')).to.equal(expected.url);

        expect($('meta[property="profile:first_name"]').attr('content')).to.equal(expected.firstName);
        expect($('meta[property="profile:last_name"]').attr('content')).to.equal(expected.lastName);
        expect($('meta[property="profile:username"]').attr('content')).to.equal(expected.username);
      });
  }
}
