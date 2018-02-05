import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import {HttpMock} from 'app/test/mock/httpMock';

import {RestEvent} from 'app/models/event/restEvent';

@suite('Models - Events - RestEventTest')
export class RestEventTest {

  @test('should set appropriate POST create response')
  test_override_response() {
    let req = HttpMock.createRequest();
    let res = HttpMock.createResponse(req);
    let result = {id: 'some_id'};
    let location = `${req.protocol + '://' + req.get('Host') + req.originalUrl}/${result.id}`;

    RestEvent.overrideCreateResponse({
      result: result,
      req: req,
      res: res,
    });

    expect(res.statusCode).to.equal(201);
    expect(res.getHeader('Location')).to.equal(location);
  }
}
