import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import * as App from 'app/server/server';
import {CacheRepository} from 'app/models/repository/cacheRepository';

@suite('Repository - CacheRepositoryTest')
export class CacheRepositoryTest {

  @test('should set cache')
  test_set() {
    let cache = ['a', 'b', 'c'];
    let key = 'test-1';
    let cacheRepository = new CacheRepository();

    return cacheRepository.set(key, cache)
      .then(() => App.models.Cache.findOne({where: {key}}))
      .then(data => {
        expect(data).to.exist;
        expect(data).to.have.property('value').to.deep.equal(cache);
      });
  }

  @test('should update cache')
  test_reset() {
    let oldCache = ['a', 'b', 'c'];
    let newCache = ['d'];
    let key = 'test-2';
    let cacheRepository = new CacheRepository();

    return cacheRepository.set(key, oldCache)
      .then(() => cacheRepository.set(key, newCache))
      .then(data => {
        expect(data).to.exist;
        expect(data).to.have.property('value').to.deep.equal(newCache);
      });
  }

  @test('should get cache')
  test_get() {
    let cache = ['a', 'b', 'c'];
    let key = 'test-3';
    let cacheRepository = new CacheRepository();

    return cacheRepository.set(key, cache)
      .then(() => cacheRepository.get(key))
      .then(value => {
        expect(value).to.deep.equal(cache);
      });
  }

}
