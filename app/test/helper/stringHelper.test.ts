import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import {StringHelper} from 'app/helper/stringHelper';

@suite('Helper - StringHelperTest')
export class StringHelperTest {

  @test('should convert html into string')
  test_html_text() {
    let simple_html = '<div><p>paragraph 1</p><p>paragraph 2</p></div>';
    expect(StringHelper.toText(simple_html)).to.equal('paragraph 1\n\nparagraph 2');
    let simple_text = 'simple text';
    expect(StringHelper.toText(simple_text)).to.equal(simple_text);
    let complex_html = '<img style="float: left; margin-right: 10px;" src="http://a.espncdn.com/combiner/i/?img=' +
      '/photo/2016/1010/r138459_1296x729_16-9.jpg&amp;w=100&amp;h=80&amp;scale=crop&amp;site=espnfc" />Here are ' +
      'the latest stories for Tuesday.\n\n\n&lt;img align=&quot;left&quot; height=&quot;50&quot;';
    expect(StringHelper.toText(complex_html)).to.equal('Here are the latest stories for Tuesday.');
  }
}
