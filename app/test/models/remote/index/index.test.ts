import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';

import * as cheerio from 'cheerio';

import * as App from 'app/server/server';

@suite('Server - Routes - Index - IndexTest')
export class IndexTest extends BaseRouteTest {

  @test('should return meta tags on crawler request')
  test_crawler_meta(done) {
    this.getServerClient()
      .get('/')
      .set('user-agent', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(res => {
        expect(res.text).to.be.not.empty;
        let $ = cheerio.load(res.text);

        expect($('title').text()).to.equal(App.get('meta').title);
        expect($('meta[name="description"]').attr('content')).to.equal(App.get('meta').description);
      })
      .end(done);
  }

  @test('should return angular html on browser request')
  test_browser_meta(done) {
    this.getServerClient()
      .get('/')
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
