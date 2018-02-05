import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {Promise} from 'es6-promise';

import * as fileMock from 'app/test/fixtures/file';

import {ServerError} from 'app/error/serverError';
import {MediaValidator} from 'app/models/service/media/mediaValidator';
import {MediaRelation} from 'app/interface/media/media';

@suite('Service - Media - MediaValidatorTest')
export class MediaValidatorTest {

  @test('should pass validation')
  test_validation() {
    let mediaRelation: MediaRelation = 'profilePhoto';
    let mediaValidator = new MediaValidator(mediaRelation, fileMock.get(null, 1));

    return mediaValidator.validate();
  }

  @test('should not pass validation with invalid mediaRelation')
  test_validate_invalid_media_type() {
    let mediaRelation: any = 'invalid_media_type';
    let mediaValidator = new MediaValidator(mediaRelation, fileMock.get('image/jpeg', 10));

    return mediaValidator.validate()
      .then(() => Promise.reject(new Error('validateRequest should not pass with invalid mediaRelation')))
      .catch((err: ServerError) => {
        expect(err.statusCode).to.equal(422);
        expect(err.message).to.equal('invalid relation');

        return Promise.resolve();
      });
  }

  @test('should not pass validation with invalid mimeType')
  test_validation_invalid_mimetype() {
    let mediaRelation: MediaRelation = 'profilePhoto';
    let mediaValidator = new MediaValidator(mediaRelation, fileMock.get('image/invalid', 1));

    return mediaValidator.validate()
      .then(() => Promise.reject(new Error('validation should not pass with invalid mimeType')))
      .catch((err: ServerError) => {
        expect(err.statusCode).to.equal(422);
        expect(err.message).to.equal('invalid mimeType');

        return Promise.resolve();
      });
  }

  @test('should not pass validation with file size limit exceed')
  test_validation_size_limit_exceed() {
    let mediaRelation: MediaRelation = 'profilePhoto';
    let mediaValidator = new MediaValidator(mediaRelation, fileMock.get('image/jpeg', 1000000));

    return mediaValidator.validate()
      .then(() => Promise.reject(new Error('validation should not pass with file size limit exceed')))
      .catch((err: ServerError) => {
        expect(err.statusCode).to.equal(422);
        expect(err.message).to.equal('file is too large');

        return Promise.resolve();
      });
  }
}
