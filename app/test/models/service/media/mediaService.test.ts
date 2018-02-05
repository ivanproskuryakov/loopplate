import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {Promise} from 'es6-promise';

import {UserUtils} from 'app/test/utils/userUtils';
import {HttpMock} from 'app/test/mock/httpMock';

import {ServerError} from 'app/error/serverError';
import {MediaService} from 'app/models/service/media/mediaService';
import {User} from 'app/interface/user/user';
import {MediaRelation} from 'app/interface/media/media';
import {AccessToken} from 'app/interface/accessToken';

@suite('Service - Media - MediaServiceTest')
export class MediaServiceTest {

  private static Login: {user: User, token: AccessToken};

  static before() {

    return UserUtils.registerUser()
      .then(login => MediaServiceTest.Login = login);
  }

  @test('should create media')
  test_create() {
    let mediaRelation: MediaRelation = 'profilePhoto';
    let req = HttpMock.createRequestByMedia(
      MediaServiceTest.Login.user,
      MediaServiceTest.Login.token,
      {relation: mediaRelation}
    );
    let res = HttpMock.createResponse();
    let mediaService = new MediaService();

    return mediaService.create(req, res)
      .then(result => {
        expect(result).to.exist;
        expect(result.id).to.exist;
        expect(result.location).to.exist;
        expect(result.relation).to.exist.to.equal(mediaRelation);
        expect(result.name).to.exist;
        expect(result.mimeType).to.exist;
      });
  }

  @test('should initialize private fields')
  test_initialize() {
    let mediaRelation: MediaRelation = 'profilePhoto';
    let req = HttpMock.createRequestByMedia(MediaServiceTest.Login.user,
      MediaServiceTest.Login.token, {relation: mediaRelation});
    let res = HttpMock.createResponse();
    let mediaService = new MediaService();

    return (<any>mediaService).initialize(req, res)
      .then(() => {
        expect(mediaService).to.have.property('file').not.null;
        expect(mediaService).to.have.property('mediaRelation').to.equal(mediaRelation);
      });
  }

  @test('should not pass validation with no user')
  test_validate_no_user() {
    let mediaRelation: MediaRelation = 'profilePhoto';
    let mediaService = new MediaService();
    (<any>mediaService).mediaRelation = mediaRelation;

    return (<any>mediaService).validateRequest()
      .then(() => Promise.reject(new Error('validateRequest should not pass with no user in request')))
      .catch((err: ServerError) => {
        expect(err.statusCode).to.equal(422);
        expect(err.message).to.equal('User not found');

        return Promise.resolve();
      });
  }

  @test('should not pass validation with no file')
  test_validate_no_file() {
    let mediaRelation: MediaRelation = 'profilePhoto';
    let mediaService = new MediaService();
    (<any>mediaService).mediaRelation = mediaRelation;
    (<any>mediaService).user = MediaServiceTest.Login.user;

    return (<any>mediaService).validateRequest()
      .then(() => Promise.reject(new Error('validateRequest should not pass with no file in request')))
      .catch((err: ServerError) => {
        expect(err.statusCode).to.equal(422);
        expect(err.message).to.equal('File not found');

        return Promise.resolve();
      });
  }

  @test('should upload file')
  test_file_upload() {
    let mediaRelation: MediaRelation = 'profilePhoto';
    let req = HttpMock.createRequestByMedia(MediaServiceTest.Login.user,
      MediaServiceTest.Login.token, {relation: mediaRelation});
    let res = HttpMock.createResponse();
    let mediaService = new MediaService();

    return (<any>mediaService).initialize(req, res)
      .then(() => (<any> mediaService).upload())
      .then(media => {
        expect(media).to.exist;
        expect(media).to.have.property('location').not.null;
        expect(media).to.have.property('relation').to.equal(mediaRelation);
        expect(media).to.have.property('name').not.null;
        expect(media).to.have.property('mimeType').not.null;
        expect(media).to.have.property('size').not.null;
        expect(media).to.have.property('container').not.null;
        expect(media).to.have.property('type').not.null;
      });
  }
}
