/**
 * Logger.
 *
 * TODO - Move this to use the built-in `core` object logging methods
 *
 * @classdesc
 * Provides static methods for easily logging to GitHub Actions with support for advanced logging capabilities, such as
 * debug logging, grouping logs, and annotations.
 *
 * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class
 */
module.exports = class Logger {
  /**
   * ANSI terminal codes for various formatting.
   *
   * @type {Object.<string, string>}
   *
   * @public
   * @constant
   * @static
   */
  static ANSI = {
    /**
     * ANSI foreground text color codes.
     *
     * @type {Object.<string, string>}
     */
    FG: {
      BLACK: "\u001b[30m",
      RED: "\u001b[31m",
      GREEN: "\u001b[32m",
      YELLOW: "\u001b[33m",
      BLUE: "\u001b[34m",
      MAGENTA: "\u001b[35m",
      CYAN: "\u001b[36m",
      WHITE: "\u001b[37m",
    },

    /**
     * ANSI background text color codes.
     *
     * @type {Object.<string, string>}
     */
    BG: {
      BLACK: "\u001b[40m",
      RED: "\u001b[41m",
      GREEN: "\u001b[42m",
      YELLOW: "\u001b[43m",
      BLUE: "\u001b[44m",
      MAGENTA: "\u001b[45m",
      CYAN: "\u001b[46m",
      WHITE: "\u001b[47m",
    },

    BOLD: "\u001b[1m",
    DIM: "\u001b[2m",
    ITALIC: "\u001b[3m",
    UNDERLINE: "\u001b[4m",

    RESET: "\u001b[0m",
  };

  /**
   * Types of annotations GitHub workflow logging supports.
   *
   * @type {Object.<string, string>}
   *
   * @public
   * @constant
   * @static
   */
  static ANNOTATION = {
    NOTICE: "notice",
    WARNING: "warning",
    ERROR: "error",
  };

  /**
   * The logging group levels currently opened.
   *
   * @type {int}
   *
   * @protected
   */
  _groupLevel = 0;

  /**
   * The name of this logger.
   *
   * @type {string}
   *
   * @protected
   * @readonly
   */
  _name;

  /**
   * Then name of the locale to format date and time to.
   *
   * If not set, formatting uses the system default.
   *
   * @type {string}
   *
   * @public
   */
  locale;

  /**
   * The name of the timezone to format date and time to.
   *
   * If not set, formatting uses the system default.
   *
   * @type {string}
   *
   * @public
   */
  timezone;

  /**
   * Create a logger with the given name.
   *
   * @param {string} name - the name of the logger (default: none)
   * @param {string} locale - the name of the locale to use for dates and times (default: system)
   * @param {string} timezone - the name of the timezone to use for dates and times (default: system)
   *
   * @constructor
   */
  constructor(name = undefined, locale = undefined, timezone = undefined) {
    this._name = name;
    this.locale = locale;
    this.timezone = timezone;
  }

  // Logging -----------------------------------------------------------------------------------------------------------

  /**
   * Word wrap and log a given message to the screen.
   *
   * If provided non-`string` type as the message, no word wrapping occurs.
   *
   * @param {*} message - the message to output
   * @param {string} level - the name of the logging level
   * @param {string} workflowCommand - the GitHub Workflow command to prepend to the message
   * @param {boolean} doWrap - whether to enable string wrapping (default: true)
   * @param {string} levelANSI - the ANSI formatting codes for the level name (default: `Logger.ANSI.BOLD`)
   *
   * @protected
   */
  _log(message, level, workflowCommand = "", doWrap = true, levelANSI = Logger.ANSI.BOLD) {
    if (typeof message !== "string") {
      console.log(message);
      return;
    }

    if (doWrap) {
      const lines = this._wrap(message);

      lines.forEach((line) => {
        console.log(this._format(line, level, workflowCommand, levelANSI));
      });

      return;
    }

    console.log(this._format(message, level, workflowCommand, levelANSI));
  }

  /**
   * Log a debug message.
   *
   * This function performs no debug hiding logic. The GitHub Workflow runner manages all debug display through
   * filtering the workflow command sent with the message.
   *
   * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-debug-message}
   * @see {@link https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging}
   *
   * @param {*} message - the message or object to log
   *
   * @public
   */
  debug(message) {
    this._log(message, "DEBUG", "::debug::", Logger.ANSI.BOLD + Logger.ANSI.FG.YELLOW);
  }

  /**
   * Log a verbose debug message.
   *
   * Right now, this simply ignores the output. This function is here to allow objects to place verbose logs in until a
   * better solution is found to display them.
   *
   * @param {*} message - the message or object to log
   *
   * @public
   */
  verbose(message) {
    // Do nothing
  }

  /**
   * Log an info message.
   *
   * @param {*} message - the message or object to log
   *
   * @public
   */
  info(message) {
    this._log(message, "INFO");
  }

  // Annotations -------------------------------------------------------------------------------------------------------

  /**
   * Format and present a GitHub annotation.
   *
   * @param {*} message - the message or object to log
   * @param {string} notation - the notation, one of `Logger.ANNOTATION`
   * @param {string} title - the title of the annotation (default: none)
   * @param {string} file - the filename (default: none)
   * @param {int} line - the file (start) line number (default: none)
   * @param {int} endLine - the file end line number (default: none)
   * @param {int} col - the column number (default: none)
   * @param {int} endCol - the ending column number (default: none)
   *
   * @protected
   */
  _annotate(
    message,
    notation,
    title = undefined,
    file = undefined,
    line = undefined,
    endLine = undefined,
    col = undefined,
    endCol = undefined,
  ) {
    let command = `${notation} `;

    if (title) {
      command += `title=${title},`;
    }

    if (file) {
      command += `file=${file},`;
    }

    if (line) {
      command += `line=${line},`;
    }

    if (endLine) {
      command += `endLine=${endLine},`;
    }

    if (col) {
      command += `col=${col},`;
    }

    if (endCol) {
      command += `endCol=${endCol},`;
    }

    // Remove the last character - either a space or comma - and close the command
    command = command.slice(0, -1);

    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }

    console.log(`::${command}::${message}`);
  }

  /**
   * Log an error annotation.
   *
   * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-error-message}
   *
   * @param {*} message - the message or object to log
   * @param {*} title - the title of the annotation (default: none)
   * @param {*} file - the filename (default: none)
   * @param {*} line - the file (start) line number (default: none)
   * @param {*} endLine - the file end line number (default: none)
   * @param {int} col - the column number (default: none)
   * @param {int} endCol - the ending column number (default: none)
   *
   * @public
   */
  error(
    message,
    title = undefined,
    file = undefined,
    line = undefined,
    endLine = undefined,
    col = undefined,
    endCol = undefined,
  ) {
    this._annotate(message, Logger.ANNOTATION.ERROR, title, file, line, endLine, col, endCol);
  }

  /**
   * Log a notice annotation.
   *
   * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-notice-message}
   *
   * @param {*} message - the message or object to log
   * @param {string} title - the title of the annotation (default: none)
   * @param {string} file - the filename (default: none)
   * @param {int} line - the file (start) line number (default: none)
   * @param {int} endLine - the file end line number (default: none)
   * @param {int} col - the column number (default: none)
   * @param {int} endCol - the ending column number (default: none)
   *
   * @public
   */
  notice(
    message,
    title = undefined,
    file = undefined,
    line = undefined,
    endLine = undefined,
    col = undefined,
    endCol = undefined,
  ) {
    this._annotate(message, Logger.ANNOTATION.NOTICE, title, file, line, endLine, col, endCol);
  }

  /**
   * Log a warning annotation.
   *
   * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-warning-message}
   *
   * @param {*} message - the message or object to log
   * @param {string} title - the title of the annotation (default: none)
   * @param {string} file - the filename (default: none)
   * @param {int} line - the file (start) line number (default: none)
   * @param {int} endLine - the file end line number (default: none)
   * @param {int} col - the column number (default: none)
   * @param {int} endCol - the ending column number (default: none)
   *
   * @public
   */
  warning(
    message,
    title = undefined,
    file = undefined,
    line = undefined,
    endLine = undefined,
    col = undefined,
    endCol = undefined,
  ) {
    this._annotate(message, Logger.ANNOTATION.WARNING, title, file, line, endLine, col, endCol);
  }

  // Utilities ---------------------------------------------------------------------------------------------------------

  /**
   * Format a given message into the standard logging format.
   *
   * Formatting includes:
   *
   *  - Adding the name of the logger
   *  - Adding the logging level
   *  - Adding a locale-friendly timestamp
   *  - Colorization and text formatting
   *
   * @param {string} message - the message to format
   * @param {string} level - the name of the logging level
   * @param {string} workflowCommand - the GitHub Workflow command to prepend to the message (default: none)
   * @param {string} levelANSI - the ANSI code for the level (default: `Logger.ANSI.BOLD`)
   * @param {string} messageANSI - the ANSI formatting code for the message (default: none)
   * @param {string} dateANSI - the ANSI formatting code for the date/time (default: `Logger.ANSI.DIM`)
   *
   * @returns {string} the formatted message
   *
   * @protected
   */
  _format(
    message,
    level,
    workflowCommand = "",
    levelANSI = Logger.ANSI.BOLD,
    messageANSI = "",
    dateANSI = Logger.ANSI.DIM,
  ) {
    const timestamp = new Date(Date.now());

    const dateFormatter = new Intl.DateTimeFormat(this.locale, {
      timeZone: this.timezone,
      timeZoneName: "short",

      year: "numeric",
      month: "short",
      day: "2-digit",

      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",

      hour12: false,
      fractionalSecondDigits: 1,
    });

    if (level) {
      level = level
        .toUpperCase()
        .padStart((level.length + 7) / 2)
        .padEnd(7);
    }

    const tplLevel = level ? `${levelANSI}[${level}]${Logger.ANSI.RESET} ` : "";
    const tplMessage = `${messageANSI}${message}${Logger.ANSI.RESET}`;
    const tplDate = `${dateANSI}(${this._name} @ ${dateFormatter.format(timestamp)})${Logger.ANSI.RESET}`;

    return `${workflowCommand}${tplLevel}${tplMessage} ${tplDate}`;
  }

  /**
   * Helper method to wrap long lines of text.
   *
   * Cuts long words at the given length if longer than the `length` variable, as well.
   *
   * @param {string} message - the message to word-wrap
   * @param {int} length - the maximum length of a line to wrap with (default: 100)
   *
   * @returns {Array} of wrapped strings
   *
   * @protected
   */
  _wrap(message, length = 100) {
    return message.match(new RegExp(`.{1,${length}}(\\s|$)|.{${length}}|.+\$`, "g"));
  }

  /**
   * Masks a given value to hide a secret.
   *
   * @param {string} value - the value to mask
   * @param {int} reveal - how many characters to reveal at the front of the string (default: 0)
   * @param {int} fixedLength - if defined, the fixed length of the string to show when masked (default: `value` length)
   * @param {string} maskChar - the character to replace masked values with (default: `*`)
   *
   * @returns {string} the masked value
   *
   * @public
   */
  mask(value, reveal = 0, fixedLength = undefined, maskChar = "*") {
    let targetLength = value.length;

    if (fixedLength && value.length > fixedLength) {
      value = value.substring(0, fixedLength);
      targetLength = fixedLength;
    }

    let masked = "";

    if (reveal > 0) {
      masked = value.substring(0, reveal);
    }

    return masked + maskChar.repeat(targetLength - masked.length);
  }

  /**
   * Start a collapsable group with an optional title.
   *
   * The Logger doesn't automatically track group opening and closing. It's up to the developer to call `endGroup` for
   * each group started or `endAllGroup()` at the end of their logging. Titles are also not tracked for groups and are
   * only provided for display purposes.
   *
   * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#grouping-log-lines}
   *
   * @param {string} title - the title to add to the group collapse line (default: none)
   *
   * @public
   */
  startGroup(title = "") {
    console.log(`::group::${title}`);
    this._groupLevel++;
  }

  /**
   * End a collapsable group.
   *
   * If the Logger attempts to end a group past what it has created, it throws an error.
   *
   * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#grouping-log-lines}
   *
   * @throws {RangeError} if attempting to close a group level the Logger didn't create.
   *
   * @public
   */
  endGroup() {
    if (this._groupLevel <= 0) {
      throw new RangeError("Attempting to close logging group that Logger did not create.");
    }

    console.log("::endgroup::");
    this._groupLevel--;
  }

  /**
   * Ends any groups that haven't closed.
   *
   * @see endGroup
   *
   * @public
   */
  endAllGroups() {
    while (this._groupLevel > 0) {
      this.endGroup();
    }
  }
}
