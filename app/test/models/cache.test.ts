import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import * as faker from 'faker';

import * as App from 'app/server/server';

@suite('Models - Cache model')
export class CacheModelTest {

  private static CACHE_KEY = faker.lorem.word();

  @test('should insert')
  test_insert(done) {
    let cache = {
      key: CacheModelTest.CACHE_KEY,
      value: [],
      createdAt: new Date()
    };

    App.models.Cache.create(cache, (err, created) => {
      expect(err).to.not.exist;
      expect(created).to.exist;
      expect(created.id).to.exist;
      expect(created).property('key').eq(CacheModelTest.CACHE_KEY);

      done(err);
    });
  }

  @test('should throw error when dupe key')
  test_dupe(done) {
    let cache = {
      key: CacheModelTest.CACHE_KEY,
      value: [],
      createdAt: new Date()
    };

    App.models.Cache.create(cache, (err, created) => {
      // console.log(err);
      expect(err).to.exist;
      expect(err).property('message').to.contain('E11000 duplicate key');

      done();
    });
  }
}
