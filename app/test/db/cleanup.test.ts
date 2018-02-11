import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import * as App from 'app/server/server';
import {Cleanup} from 'app/db/cleanup';

@suite('Service - cleanup')
export class CleanupTest {

  @test('should clean & import default data')
  test_clean(done) {
    new Cleanup()
      .start()
      .then(() => {

        App.models.user.count({}, (err, usersCount) => {
          expect(err).to.not.exist;

          App.models.Activity.count({}, (err, activitiesCount) => {
            expect(err).to.not.exist;

            App.models.Comment.count({}, (err, commentsCount) => {
              expect(err).to.not.exist;

              expect(usersCount).to.be.equal(1);
              expect(activitiesCount).to.be.equal(3);
              expect(commentsCount).to.be.equal(3);

              done();
            });
          });
        });
      })
      .catch(done);
  }
}
