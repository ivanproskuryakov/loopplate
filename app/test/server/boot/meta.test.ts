import {suite, test} from 'mocha-typescript';
import * as sinon from 'sinon';
import {expect} from 'chai';
import {Promise} from 'es6-promise';
import {HttpMock} from 'app/test/mock/httpMock';
import * as App from 'app/server/server';

let renderMeta = require('app/server/boot/meta');

@suite('Server - Boot - MetaTest')
export class MetaTest {

  @test('should call meta renderer when bot request')
  test_bot_request(done) {
    let renderer = {
      renderIndex: () => {
        return Promise.resolve('test html');
      }
    };
    let req = HttpMock.createRequest();
    req.headers = {
      'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    };
    let res = HttpMock.createResponse(req);
    let spy = {
      render: sinon.spy(renderer, 'renderIndex'),
      status: sinon.spy(res, 'status'),
      send: sinon.spy(res, 'send')
    };

    let middleware = renderMeta(App)(() => renderer.renderIndex());

    middleware(req, res, function () {
      done(new Error('next middleware should not be called'));
    })
      .then(() => {
        expect(spy.render.calledOnce);
        expect(spy.status.calledWith(200));
        expect(spy.send.calledOnce);

        done();
      });
  }

  @test('should not call meta renderer when bot request')
  test_browser_request(done) {
    let renderer = {
      renderIndex: () => {
        return Promise.resolve('test html');
      }
    };
    let req = HttpMock.createRequest();
    req.headers = {
      /* tslint:disable max-line-length */
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'
      /* tslint:enable max-line-length */
    };
    let res = HttpMock.createResponse(req);
    let spy = {
      render: sinon.spy(renderer, 'renderIndex'),
      status: sinon.spy(res, 'status'),
      send: sinon.spy(res, 'send')
    };

    let middleware = renderMeta(App)(() => renderer.renderIndex());

    let next = middleware(req, res, function () {
      expect(spy.render.notCalled);
      expect(spy.status.notCalled);
      expect(spy.send.notCalled);

      done();
    });

    expect(next).to.not.exist;
  }
}
