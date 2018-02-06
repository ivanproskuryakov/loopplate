export interface BlacklistInterface<T> {

  /**
   * generic filter method
   * @param {object[]} source
   * @returns {object[]}
   */
  filter(source: T[]): T[];

  /**
   * generic method to return blacklist items
   * @param {object[]} source
   * @param {object} [replacement]
   * @returns {object[]}
   */
  replace(source: T[], replacement?: T): T[];
}
