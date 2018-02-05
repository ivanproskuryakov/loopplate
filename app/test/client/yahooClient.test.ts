import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';

import {YahooClient} from 'app/client/yahooClient';

@suite('Service - YahooClientText')
export class YahooClientText {

  @test('should create query parameter')
  test_query_parameter() {
    let yahoo = new YahooClient();
    let text = 'Test\'s test\'"...';

    let param = (<any>yahoo).toQueryParameter(text);
    expect(param).to.equal('Test test');
  }

}
