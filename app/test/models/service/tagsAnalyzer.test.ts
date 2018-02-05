import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import * as activitiesMock from 'app/test/fixtures/models/activity';

import {Promise} from 'es6-promise';
import {TagsAnalyzer} from 'app/models/service/activity/tagsAnalyzer';

@suite('Service - Analysis - TagsAnalyzerTest')
export class TagsAnalyzerTest {

  @test('should fix html by removing nested anchor tags')
  test_html_fix() {
    let analysis = new TagsAnalyzer();
    let input = [
      `<html><body><a><div><a href=""></a></div></a></body></html>`,
      `<html><body><a><div></div></a></body></html>`,
      `<html><body><a><div><a></body></html>`,
      `<html><body><a href=""></a></div></a></div></a></body></html>`
    ];
    let output = [
      `<html><head></head><body><a></a><div><a></a><a href=""></a></div></body></html>`,
      `<html><head></head><body><a><div></div></a></body></html>`,
      `<html><head></head><body><a></a><div><a></a><a></a></div></body></html>`,
      `<html><head></head><body><a href=""></a></body></html>`,
    ];

    return Promise.all(input.map((html, i) => {
      return (<any>analysis)
        .fixHtml(html)
        .then(result => {
          expect(result).to.exist;
          expect(result).to.equal(output[i]);
        });
    }));
  }

  @test('should filter empty, dupe tags')
  test_empty_dupes() {
    let activity = activitiesMock.get(1, null, [{value: 'ArseneWenger', rank: 100}])[0];
    let sourceTags = [
      'Arsene Wenger  ',
      ' leave Arsenal',
      'ChelseaFC',
      'Chelsea FC ',
      'ChelseaFC ',
      'ChelseaFC ! $ - _ = +',
      'a',
      'b ',
      '  c   ',
      'Землетрясение    ',
      ''
    ];

    new TagsAnalyzer().analyzeAndUpdateActivityTags(activity, sourceTags);
    expect(activity.tags).to.have.lengthOf(3);
    expect(activity.tags[0]).to.deep.equal({value: 'ArseneWenger', rank: 0});
    expect(activity.tags[1]).to.deep.equal({value: 'LeaveArsenal', rank: 0});
    expect(activity.tags[2]).to.deep.equal({value: 'ChelseaFC', rank: 0});
  }

  @test('should filter empty, dupe, blacklist tags')
  test_empty_blacklist_dupes() {
    let activity = activitiesMock.get(1, null, [])[0];
    let sourceTags = [
      'Arsene Wenger  ',
      ' Leave Arsenal',
      'ChelseaFC',
      'Chelsea FC ',
      'ChelseaFC news',
      'ChelseaFC ! $ - _ = +',
      'a',
      'b ',
      '  c   ',
      'Землетрясение    ',
      ''
    ];

    new TagsAnalyzer().analyzeAndUpdateActivityTags(activity, sourceTags);

    expect(activity.tags).to.have.lengthOf(4);
    expect(activity.tags[0]).to.deep.equal({value: 'ArseneWenger', rank: 0});
    expect(activity.tags[1]).to.deep.equal({value: 'LeaveArsenal', rank: 0});
    expect(activity.tags[2]).to.deep.equal({value: 'ChelseaFC', rank: 0});
  }
}
