export class ServerError extends Error {

  /**
   * @type {int}
   */
  public statusCode;

  /**
   * @constructor
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }

}
