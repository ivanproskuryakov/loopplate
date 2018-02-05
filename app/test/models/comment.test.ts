import * as Promise from 'bluebird';
import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import * as faker from 'faker';

import * as commentsMock from 'app/test/fixtures/models/comment';
import * as App from 'app/server/server';
import * as usersMock from 'app/test/fixtures/models/user';
import * as activityMock from 'app/test/fixtures/models/activity';
import {UserUtils} from 'app/test/utils/userUtils';
import {User} from 'app/interface/user/user';
import {Activity} from 'app/interface/activity/activity';
import {Comment} from 'app/interface/comment';


@suite('Models - Comment model')
export class CommentModelTest {

  private static User: User;
  private static Activity: Activity;

  public static before(done) {
    UserUtils.createUser(usersMock.get(1)[0])
      .then(user => CommentModelTest.User = user)
      .then(() => App.models.Activity.create(activityMock.get(1)[0]))
      .then(activity => CommentModelTest.Activity = activity)
      .then(() => done())
      .catch(done);
  }

  @test('should create valid comments')
  test_insert(done) {
    let comments = commentsMock.get(
      5,
      CommentModelTest.User.id,
      CommentModelTest.Activity.id);

    Promise.map(comments, (comment: Comment) => App.models.Comment.create(comment)
      .then(comment => {
        expect(comment).to.exist;
        expect(comment.id).to.exist;
        expect(comment.text).to.exist;
        expect(comment.slug).to.exist;
        expect(comment.fullSlug).to.exist;
        expect(comment.userId).to.exist;
      }))
      .then(() => done())
      .catch(done);
  }

  @test('should not create invalid comments')
  test_insert_invalid(done) {
    let comments = commentsMock.invalid();

    Promise.map(comments, (comment: Comment) => {
      return new Promise((resolve, reject) => {
        App.models.Comment.create(comment, err => {

          expect(err).to.exist;
          resolve();
        });
      });
    }).then(() => done());
  }

  @test('should update comment: text')
  test_update(done) {
    App.models.Comment.findOne({}, (err, comment) => {
      expect(err).to.not.exist;

      let text = faker.lorem.paragraph();
      comment.updateAttributes({
        text: text
      }, err => {
        expect(err).to.not.exist;

        done();
      });
    });
  }

  @test('should delete user')
  test_delete(done) {
    App.models.Comment.findOne({}, (err, comment) => {
      expect(err).to.not.exist;

      comment.delete(err => {
        expect(err).to.not.exist;

        done();
      });
    });
  }
}
