let process = require('process');

export class BenchmarkHelper {
  /**
   * @type {number}
   */
  private hrstart: number;

  public startTimer() {
    this.hrstart = process.hrtime();
  }

  /**
   * @returns {string}
   */
  public getTime(): string {
    let hrend = process.hrtime(this.hrstart);

    return `Execution time (hr): ${hrend[0]}s ${hrend[1] / 1000000}ms`;
  }
}
