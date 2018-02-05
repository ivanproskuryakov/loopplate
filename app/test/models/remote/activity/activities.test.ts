import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import nock = require('nock');
import * as faker from 'faker';

import {UserUtils} from 'app/test/utils/userUtils';
import * as activityMock from 'app/test/fixtures/models/activity';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';

import * as cheerio from 'cheerio';

import * as App from 'app/server/server';
import {ActivityService} from 'app/models/service/activity/activityService';
import {Activity} from 'app/interface/activity/activity';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';

@suite('Server - Routes - Activity - ActivitiesTest')
export class ActivitiesTest extends BaseRouteTest {

  private static fakeUrl = faker.internet.url();
  private static Activity: Activity;
  private static Login: { user: User, token: AccessToken };

  static before(done) {
    // setup fake url hook
    nock(ActivitiesTest.fakeUrl)
      .get('/')
      .replyWithFile(200, 'app/test/fixtures/youtube.html');
    // setup yql url hook
    nock('https://query.yahooapis.com')
      .filteringPath(() => '/')
      .post('/')
      .replyWithFile(200, 'app/test/fixtures/yql.json');

    BaseRouteTest.before(serverError => {
      if (serverError) {
        return done(serverError);
      }

      UserUtils.registerUser()
        .then(login => ActivitiesTest.Login = login)
        .then(() => App.models.Activity.create(activityMock.get(1, null, null, null, ActivitiesTest.Login.user.id)[0]))
        .then(created => {
          ActivitiesTest.Activity = created.toJSON();
          ActivitiesTest.Activity.user = ActivitiesTest.Login.user;
        })
        .then(() => done())
        .catch(done);
    });
  }

  @test('should return user in body')
  test_user_include(done) {
    this.getApiClient()
      .get(`/Activities/${ActivitiesTest.Activity.id}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body).to.exist;
        expect(res.body.user).property('id').not.null;
        expect(res.body.user).property('username').not.null;
        expect(res.body.user).property('email').not.null;
      })
      .end(done);
  }

  @test('should require auth to post activity')
  test_require_auth_to_activity_post(done) {
    this.getApiClient()
      .post(`/Activities`)
      .send({})
      .expect(401)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should post activity[type=text]')
  test_activity_text_post(done) {
    let payload = {
      type: 'text',
      name: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      tags: ['tag1', 'tag2', 'tag3']
    };

    this.getApiClient()
      .post(`/Activities`)
      .send(payload)
      .set({Authorization: ActivitiesTest.Login.token.id})
      .expect(201)
      .expect('Content-Type', /json/)
      .expect('Location', new RegExp(`^${BaseRouteTest.ApiAddress}/Activities/`))
      .expect(res => {
        expect(res.body).to.be.empty;
      })
      .end(done);
  }

  @test('should post activity[type=link]')
  test_activity_link_post(done) {
    let payload = {
      type: 'link',
      source: ActivitiesTest.fakeUrl
    };

    this.getApiClient()
      .post(`/Activities`)
      .send(payload)
      .set({Authorization: ActivitiesTest.Login.token.id})
      .expect(201)
      .expect('Content-Type', /json/)
      .expect('Location', new RegExp(`^${BaseRouteTest.ApiAddress}/Activities/`))
      .expect(res => {
        expect(res.body).to.be.empty;
      })
      .end(done);
  }

  @test('should post activity[type=image]')
  test_activity_image_post(done) {
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

    this.getApiClient()
      .post(`/Activities`)
      .send(payload)
      .set({Authorization: ActivitiesTest.Login.token.id})
      .expect(201)
      .expect('Content-Type', /json/)
      .expect('Location', new RegExp(`^${BaseRouteTest.ApiAddress}/Activities/`))
      .expect(res => {
        expect(res.body).to.be.empty;
      })
      .end(done);
  }

  @test('should not post activity[type=image] with invalid media meta')
  test_activity_image_post_invalid_media_meta(done) {
    let payload = {
      type: 'image',
      media: [{
        type: 'image'
      }],
      name: 'name value',
      description: 'description value',
      tags: ['tag1', 'tag2', 'tag3']
    };

    this.getApiClient()
      .post(`/Activities`)
      .send(payload)
      .set({Authorization: ActivitiesTest.Login.token.id})
      .expect(422)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body.error).not.to.be.empty;
      })
      .end(done);
  }

  @test('should return meta tags on crawler request')
  test_crawler_meta(done) {
    this.getServerClient()
      .get(`/u/${ActivitiesTest.Login.user.username}/a/${ActivitiesTest.Activity.slug}`)
      .set('user-agent', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(res => {
        expect(res.text).to.be.not.empty;
        let $ = cheerio.load(res.text);
        let expected = {
          title: ActivitiesTest.Activity.name + ' - ' + App.get('meta').title,
          description: ActivitiesTest.Activity.description.substring(0, 200) + ' - ' + App.get('meta').description,
          keywords: ActivitiesTest.Activity.tags.map(x => x.value).join(', '),
          tags: ActivitiesTest.Activity.tags.map(x => x.value),
          type: 'article',
          card: 'summary',
          image: ActivitiesTest.Activity.media[0].location,
          url: ActivityService.getActivityUrl(ActivitiesTest.Activity),
          publushTime: ActivitiesTest.Activity.createdAt.toString(),
          author: ActivitiesTest.Login.user.username,
          section: ActivitiesTest.Activity.category
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
      })
      .end(done);
  }

  @test('should return angular html on browser request')
  test_browser_meta(done) {
    this.getServerClient()
      .get(`/u/${ActivitiesTest.Login.user.username}/a/${ActivitiesTest.Activity.slug}`)
      .redirects(1)
      /* tslint:disable max-line-length */
      .set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
      /* tslint:enable max-line-length */
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(res => {
        expect(res.text).to.be.not.empty;
        let $ = cheerio.load(res.text);

        expect($('title').text()).to.not.equal(App.get('meta').title);
        expect($('meta[name="description"]').attr('content')).to.not.equal(App.get('meta').description);
        expect($('body').attr('ng-class')).to.equal('appState');
      })
      .end(done);
  }
}
