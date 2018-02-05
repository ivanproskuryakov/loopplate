import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import * as usersMock from 'app/test/fixtures/models/user';

import {UsersBlackList} from 'app/blackList/usersBlacklist';

@suite('Service - Blacklist - UsersBlackListTest')
export class UsersBlackListTest {

  @test('should return blacklist filtered users')
  test_filter() {
    let users = usersMock.get(10);
    let blacklist = [users[5].username, users[0].username, users[8].username];
    let result = new UsersBlackList(blacklist)
      .filter(users);

    expect(result).to.exist;
    expect(result).to.be.an.instanceOf(Array).lengthOf(7);
    blacklist.forEach(username => {
      expect(result.filter(x => blacklist.indexOf(x.username) !== -1)).to.be.empty;
    });
  }
}
