import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import * as nock from 'nock';
import * as faker from 'faker';
const moment = require('moment');

import * as usersMock from 'app/test/fixtures/models/user';
import {MetaExtractor} from 'app/import/extractor/metaExtractor';

@suite('Import - MetaExtractorTest')
export class MetaExtractorTest {

  before(): void {
    // setup rss hook
    nock('http://www.site.com')
      .get('/rss.xml')
      .replyWithFile(200, 'app/test/fixtures/import/rss.xml')
      .persist()
      .get(/\/article\/([0-9]+)/)
      .replyWithFile(200, 'app/test/fixtures/import/site.html');
  }

  after(): void {
    nock.cleanAll();
  }


  @test('should extract activity')
  test_extract() {
    let extractor = new MetaExtractor();
    let expected = require('app/test/fixtures/import/meta-result.json');
    let user = usersMock.user();
    user.id = faker.random.uuid();

    return extractor
      .setSource('http://www.site.com/article/1')
      .extractActivity(user, 'football', 'link')
      .then(activity => {
        expect(activity).to.exist;

        expect(activity.source).to.equal(expected.source);
        expect(activity.description).to.equal(expected.description);
        expect(activity.media).to.have.lengthOf(1);
        expect(activity.media[0].location).to.equal(expected.image);
        expect(activity.media[0].main).to.be.true;
        expect(activity.name).to.equal(expected.name);
        expect(activity.category).to.equal(expected.category);
        expect(activity.tags).to.deep.equal(expected.tags);
        expect(activity.type).to.equal(expected.type);
        expect(activity.createdAt).to.exist;
        expect(moment(activity.createdAt).isAfter()).to.be.false;
        expect(activity.userId).to.exist;
      });
  }

  @test('should extract tags from keywords')
  test_extract_tags() {
    let extractor: any = new MetaExtractor();

    let tags_comma = extractor.getTagsFromKeywords('a,b,c');
    expect(tags_comma).to.deep.equal(['a', 'b', 'c']);
    let tags_space = extractor.getTagsFromKeywords('a b c');
    expect(tags_space).to.deep.equal(['a', 'b', 'c']);
  }
}
