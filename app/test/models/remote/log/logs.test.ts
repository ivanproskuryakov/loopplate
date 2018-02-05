import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import {Log} from 'app/interface/log';

import {LastMessage, LastMeta} from 'app/test/mock/winstonMockTransport';
import {BaseRouteTest} from 'app/test/models/remote/baseRouteTest';

@suite('Server - Routes - Log - LogsTest')
export class LogsTest extends BaseRouteTest {

  @test('should log error')
  test_log_error(done) {
    let error: Log = {
      message: 'test error message',
      stackTrace: 'test stack',
      code: 400
    };

    this.getApiClient()
      .post(`/Logs`)
      .send(error)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(LastMessage).to.equal(error.message);
        expect(LastMeta.stackTrace).to.equal(error.stackTrace);
        expect(LastMeta.code).to.equal(error.code);
      })
      .end(done);
  }

  @test('should log error with custom meta')
  test_log_error_with_meta(done) {
    let error: any = {
      message: 'test error message',
      stackTrace: 'test stack',
      code: 400,
      line: 123,
      file: 'somefile.ts'
    };

    this.getApiClient()
      .post(`/Logs`)
      .send(error)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(LastMessage).to.equal(error.message);
        expect(LastMeta.stackTrace).to.equal(error.stackTrace);
        expect(LastMeta.code).to.equal(error.code);
        expect(LastMeta).to.have.property('line');
        expect(LastMeta.line).to.equal(error.line);
        expect(LastMeta).to.have.property('file');
        expect(LastMeta.file).to.equal(error.file);
      })
      .end(done);
  }
}
