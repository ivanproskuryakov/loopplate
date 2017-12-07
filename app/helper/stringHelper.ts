const htmlToText = require('html-to-text');
let he = require('he');

export class StringHelper {

  /**
   * extracts text from html string
   * @param {string} html source
   * @returns {string}
   */
  public static toText(html: string): string {
    // first decode unicode chars (&amp;, etc) in html
    // then extract text. decode required before extraction !!!
    // 'html-to-text' module not handles unicode chars
    return htmlToText.fromString(he.decode(html), {
      wordwrap: false,
      ignoreHref: true,
      ignoreImage: true
    });
  }

}
