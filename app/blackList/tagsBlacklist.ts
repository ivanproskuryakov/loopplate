import {join} from 'path';
import * as _ from 'lodash';
import {BlacklistInterface} from 'app/interface/blacklistInterface';

export class TagsBlackList implements BlacklistInterface<string> {

  /**
   * @const
   */
  private readonly DEFAULT_TAGS_PATH = join(__dirname, '../../data/blacklist/tags.json');

  /**
   * @property
   */
  private blacklist: string[] = [];

  /**
   * @constructor
   * @param {string[]} [tags]
   */
  constructor(tags?: string[]) {
    this.blacklist = tags || this.getDefaultTags();
  }

  /**
   * @param {string[]} source
   * @returns {string[]}
   */
  public filter(source: string[]): string[] {

    return source.filter(tag =>
      _.find(this.blacklist, x => x.toLowerCase() === tag.toLowerCase()) === undefined
    );
  }

  /**
   * @param {string[]} source
   * @param {string} [replacement]
   * @returns {string[]}
   */
  public replace(source: string[], replacement?: string): string[] {
    replacement = replacement || '';

    return _.clone(source).map(tag => {

      // full match
      if (this.blacklist.indexOf(tag.toLowerCase()) !== -1) {
        return replacement;
      }

      // words match
      return _.words(tag)
        .map(word => this.blacklist.indexOf(word.toLowerCase()) === -1 ? word : replacement)
        .join('');
    });
  }

  /**
   * returns default blacklist tags
   */
  private getDefaultTags(): string[] {

    return require(this.DEFAULT_TAGS_PATH);
  }
}
