import * as App from 'app/server/server';
import * as MockStorageProvider from 'app/test/mock/storageProvider';
import {DataSources} from 'app/db/dataSources';
import {BenchmarkHelper} from 'app/helper/benchmarkHelper';

let pkgcloud = require('pkgcloud');
let benchmark = new BenchmarkHelper();

before(done => {
  benchmark.startTimer();
  // inject mock provider in pkgcloud
  pkgcloud.providers.mock = {
    storage: MockStorageProvider
  };

  new DataSources()
    .update()
    .then(() => done())
    .catch(done);
});

// global after hook
after(done => {
  console.log(benchmark.getTime());
  App.dataSources.mongo.connector.db.dropDatabase(() => done());
});

