import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import {TagsBlackList} from 'app/blackList/tagsBlacklist';

@suite('Service - Blacklist - TagsBlackListTest')
export class TagsBlackListTest {

  @test('should return blacklist filtered tags')
  test_filter() {
    let source = ['A', 'B', 'c', 'd', 'eF'];
    let blacklistTags = ['b', 'ef'];

    let result = new TagsBlackList(blacklistTags)
      .filter(source);

    expect(result).to.exist;
    expect(result).to.be.an.instanceOf(Array).to.deep.equal(['A', 'c', 'd']);
  }

  @test('should return blacklist replaced tags')
  test_replace() {
    let source = [
      'A B C',
      'B B D',
      'c b c',
      'd',
      'Fe',
      'Hector Bellerin',
      'Robert Fernandez',
      'football news',
      'Arsenal news',
      'Arsenal football news',
      'Barcelona news',
      'Barcelona football news',
      'Deportivo news',
      'Deportivo football news',
      'Juventus news'
    ];
    let blacklistTags = ['b', 'fe', 'news', 'football'];

    let expected = [
      'AC',
      'D',
      'cc',
      'd',
      '',
      'HectorBellerin',
      'RobertFernandez',
      '',
      'Arsenal',
      'Arsenal',
      'Barcelona',
      'Barcelona',
      'Deportivo',
      'Deportivo',
      'Juventus'
    ];

    let result = new TagsBlackList(blacklistTags)
      .replace(source);

    expect(result).to.exist;
    expect(result).to.be.an.instanceOf(Array).to.deep.equal(expected);
  }
}
