import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
let FormData = require('form-data');

import * as fileMock from 'app/test/fixtures/file';
import * as mediaMock from 'app/test/fixtures/models/media';
import {UserUtils} from 'app/test/utils/userUtils';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';

import * as App from 'app/server/server';
import {User} from 'app/interface/user/user';
import {AccessToken} from 'app/interface/accessToken';
import {Promise} from 'es6-promise';


@suite('Server - Routes - Media - MediaTest')
export class MediaTest extends BaseRouteTest {

  private static Login: {user: User, token: AccessToken};

  static before(done) {
    BaseRouteTest.before(serverError => {
      if (serverError) {
        return done(serverError);
      }

      UserUtils.registerUser()
        .then(login => MediaTest.Login = login)
        .then(() => done())
        .catch(done);
    });
  }

  @test('should require auth on create')
  test_auth_on_create() {
    let relation = 'profilePhoto';
    let file = fileMock.get();
    let params = this.getSubmitParams();
    // remove auth
    params.headers = {};

    return this.getForm(relation, file)
      .submitAsync(params)
      .then(res => {
        expect(res).property('statusCode').to.equal(401);
        expect(res.headers).not.have.property('location');
      });
  }

  @test('should change user\'s avatar')
  test_avatar_change() {
    let relation = 'profilePhoto';
    let file = fileMock.get();

    return this.getForm(relation, file)
      .submitAsync(this.getSubmitParams())
      .then(res => {
        expect(res).property('statusCode').to.equal(201);
        expect(res.headers).property('location').not.null;

        return this.readResponse(res);
      })
      .then(body => {

        expect(body).property('location').not.null;
        expect(body).property('relation').to.equal(relation);
        expect(body).property('type').to.equal('image');
        expect(body).property('name').not.null;
        expect(body).property('mimeType').to.equal(file.mimetype);
        expect(body).property('createdAt').not.null;
        expect(body).property('id').not.null;
      });
  }

  @test('should throw no file error')
  test_no_file(done) {
    let relation = 'profilePhoto';
    let form = new FormData();
    form.append('relation', relation);
    form.submit(this.getSubmitParams(), (err, res) => {
      expect(res).property('statusCode').to.equal(422);
      expect(res.headers).not.have.property('location');

      this.readResponse(res)
        .then(body => {
          expect(body.error.message).to.equal('File not found');

          done(err);
        })
        .catch(done);
    });
  }

  @test('should throw invalid relation error')
  test_invalid_relation() {
    let relation = 'invalid_relation';
    let file = fileMock.get();

    return this.getForm(relation, file)
      .submitAsync(this.getSubmitParams())
      .then(res => {
        expect(res).property('statusCode').to.equal(422);
        expect(res.headers).not.have.property('location');

        return this.readResponse(res);
      })
      .then(body => {
        expect(body.error.message).to.equal('invalid relation');
      });
  }

  @test('should throw invalid mimetype error')
  test_invalid_mimetype() {
    let relation = 'profilePhoto';
    let file = fileMock.get('text/plain');

    return this.getForm(relation, file)
      .submitAsync(this.getSubmitParams())
      .then(res => {
        expect(res).property('statusCode').to.equal(422);
        expect(res.headers).not.have.property('location');

        return this.readResponse(res);
      })
      .then(body => {
        expect(body.error.message).to.equal('invalid mimeType');
      });
  }

  @test('should throw size limit error')
  test_size_limit() {
    let relation = 'profilePhoto';
    let file = fileMock.get(null, 1000000);

    return this.getForm(relation, file)
      .submitAsync(this.getSubmitParams())
      .then(res => {
        expect(res).property('statusCode').to.equal(422);
        expect(res.headers).not.have.property('location');

        return this.readResponse(res);
      })
      .then(body => {
        expect(body.error.message).to.equal('file is too large');
      });
  }

  @test('should require auth on read')
  test_auth_on_read(done) {
    this.getApiClient()
      .get('/Media/123456')
      .expect(401)
      .expect('Content-Type', /json/)
      .end(done);
  }

  @test('should return media by id')
  test_get_by_id(done) {
    App.models.Media.create(mediaMock.get(1, MediaTest.Login.user)[0])
      .then(media => {
        this.getApiClient()
          .get(`/Media/${media.id}`)
          .set({Authorization: MediaTest.Login.token.id})
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => {
            expect(res.body).to.exist;
            expect(res.body).property('location').not.null;
            expect(res.body).property('relation').not.null;
            expect(res.body).property('type').not.null;
            expect(res.body).property('name').not.null;
            expect(res.body).property('mimeType').not.null;
            expect(res.body).property('createdAt').not.null;
            expect(res.body).property('id').not.null;
          })
          .end(done);
      })
      .catch(done);
  }

  private getSubmitParams(): any {
    return {
      host: App.get('host'),
      port: App.get('port'),
      path: App.get('restApiRoot') + '/Media',
      method: 'POST',
      headers: {Authorization: MediaTest.Login.token.id}
    };
  }

  private getForm(relation: string, file: Express.Multer.File): any {
    let form = new FormData();

    form.append('file', file.buffer, {
      filename: file.filename,
      contentType: file.mimetype,
      knownLength: file.size
    });
    form.append('relation', relation);

    form.submitAsync = function (options) {
      return new Promise(function (resolve, reject) {
        form.submit(options, function (err, res) {
          if (err) {
            return reject(err);
          }

          resolve(res);
        });
      });
    };

    return form;
  }

  private readResponse(res: any): Promise<any> {
    return new Promise(function (resolve, reject) {
      let chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk.toString());
      });
      res.on('end', () => {
        resolve(JSON.parse(chunks.join('')));
      });
      res.on('error', reject);
    });
  }
}
