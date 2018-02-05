import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import {HttpHelper} from 'app/helper/httpHelper';

@suite('Service - HttpHelper')
export class HttpHelperTest {

  @test('should parse domains')
  test_domain_parse() {
    let data = [
      {url: 'http://www.fifa.com', domain: 'fifa.com'},
      {url: 'http://sports.yahoo.com/ncaab', domain: 'yahoo.com'},
      {url: 'https://www.nytimes.com/section/sports/ncaafootball?partner=rss&emc=rss', domain: 'nytimes.com'},
      {url: 'https://f1fanatics.wordpress.com', domain: 'f1fanatics.wordpress.com'},
      {url: 'http://mybestcars.tumblr.com/', domain: 'mybestcars.tumblr.com'},
      {url: 'http://sss.facebook.com', domain: 'facebook.com'},
      {url: 'http://patternofbasketball.blogspot.com?asd=tr', domain: 'patternofbasketball.blogspot.com'},
      {url: 'http://aussiegolfer.com.au/asd/te', domain: 'aussiegolfer.com.au'},
      {url: 'http://www.tabletennisdaily.co.uk/', domain: 'tabletennisdaily.co.uk'}
    ];

    data.forEach(item => {
      expect(HttpHelper.getDomain(item.url)).to.eq(item.domain);
    });
  }
}
