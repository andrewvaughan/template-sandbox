const Logger = require("./Logger");

/**
 * WorkflowAbstract.
 *
 * @classdesc
 * Implements shared methods used across all classes within this workflow library.
 *
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @abstract @class
 */
module.exports = class WorkflowAbstract {
  /**
   * Instantiate common elements used in all classes.
   *
   * @public @constructor
   */
  constructor() {
    this._logger = new Logger(this.constructor.name);
  }

  /**
   * Print a standard debug message describing the method called.
   *
   * @param {String} func - the name of the function, not including the class
   * @param {Object} args - the `arguments` variable provided to each function
   * @param {Boolean} [verbose=false] - whether to debug this as a verbose message
   *
   * @protected
   */
  _debugCall(func, args, verbose = false) {
    WorkflowAbstract._debugStaticCall(this.constructor.name, func, args, verbose, this._logger);
  }

  /**
   * Print a standard debug message describing the static method called.
   *
   * @param {String} cls - the name of the class calling the function
   * @param {String} func - the name of the function, not including the class
   * @param {Object} args - the `arguments` variable provided to each function
   * @param {Boolean} [verbose=false] - whether to debug this as a verbose message
   * @param {Logger} [logger=undefined] - the logger to use when logging, defaults to a WorkflowAbstract logger
   *
   * @protected @static
   */
  static _debugStaticCall(cls, func, args, verbose = false, logger = undefined) {
    if (!logger) {
      logger = new Logger(`${cls}[STATIC]`);
    }

    const cleanArgs = Object.keys(args)
      .map((name) => {
        return JSON.stringify(args[name]);
      })
      .join(", ");

    const msg = `CALL ${cls}.${func}(${cleanArgs})`;

    if (verbose) {
      logger.verbose(msg);
      return;
    }

    logger.debug(msg);
  }
};
