const ActionContext = require("../ActionContext");
const Logger = require("../Logger");

/**
 * Issue.
 *
 * @classdesc
 * Manages various actions on GitHub Issues via the REST and GraphQL APIs.
 *
 * @see {@link https://docs.github.com/en/rest/issues}
 * @see {@link https://docs.github.com/en/graphql/reference/objects#issue}d
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class
 */
module.exports = class Issue {

  /**
   * The Issue number.
   *
   * @type {int}
   *
   * @public
   * @readonly
   */
  number;

  /**
   * The Repository name containing the Issue.
   *
   * @type {string}
   *
   * @public
   * @readonly
   */
  repository;

  /**
   * The Owner name for the Repository.
   *
   * @type {string}
   *
   * @public
   * @readonly
   */
  owner;

  /**
   * Cached Issue data.
   *
   * @type {Object}
   *
   * @protected
   */
  _issue;

  /**
   * Cached ProjectController.
   *
   * @type {ProjectController}
   *
   * @protected
   */
  _projectController;

  /**
   * Cached Project status name.
   *
   * @type {string}
   *
   * @protected
   */
  _projectStatus;

  /**
   * Cached Fields from the Project connection.
   *
   * @type {Object}
   *
   * @protected
   */
  _projectFields;

  /**
   * Create an Issue.
   *
   * This doesn't load Issue data from GitHub, as that's lazy-loaded when data is first accessed.
   *
   * @param {int} number - the Issue number to load
   * @param {string} repository - the Repository the Issue is part of (default: `context.repo.repo`)
   * @param {string} owner - the owner of the Repository (default: `context.repo.owner`)
   *
   * @public
   * @constructor
   */
  constructor(number, repository = undefined, owner = undefined) {
    this._logger = new Logger("Issue");

    this._logger.debug("Issue.constructor(" +
      `number: ${JSON.stringify(number)}, ` +
      `repository: ${JSON.stringify(repository)}, ` +
      `owner: ${JSON.stringify(owner)}` +
    ")");

    this.number = number;
    this.repository = repository ? repository : ActionContext.context.repo.repo;
    this.owner = owner ? owner : ActionContext.context.repo.owner;

    this._logger.debug(`Issue.number == ${this.number}`);
    this._logger.debug(`Issue.repository == ${this.repository}`);
    this._logger.debug(`Issue.owner == ${this.owner}`);

    // Allows this to override all getters that aren't explicitly set
    return new Proxy(this, this);
  }

  /**
   * Load the configured Issue data from GitHub.
   *
   * @param {boolean} force - whether to force a reload from GitHub (default: false)
   *
   * @returns {Promise}
   *
   * @throws {ReferenceError} if the Issue can't load from GitHub
   *
   * @protected
   * @async
   */
  async _load(force = false) {
    this._logger.debug("Issue._load(" +
      `force: ${JSON.stringify(force)}` +
    ")");

    if (this._issue && !force) {
      this._logger.debug("Load cache hit.");
      return;
    }

    this._logger.debug("Load cache miss.");

    this._logger.info(`Loading Issue #${this.number} data from GitHub...`);
    this._logger.debug("Calling GitHub get Issue API via REST...");

    return ActionContext.github.rest.issues.get({
      owner: this.owner,
      repo: this.repository,
      issue_number: this.number,

    }).then((response) => {
      this._logger.debug(`Response status: ${response.status}`);

      if (response.status < 200 || response.status > 299) {
        this._logger.debug(response);
        throw ReferenceError(`Unable to load Issue #${this.number}.`);
      }

      this._issue = response.data;

      this._logger.debug("Issue data loaded.");
      this._logger.verbose(this._issue);
    });
  }


  /**
   * Force a reload of the Issue data.
   *
   * @returns {Promise}
   *
   * @public
   * @async
   */
  async reload() {
    return this._load(true);
  }


  /**
   * If not explicitly set in this Object, attempts to look up the value in the Issue data.
   *
   * @param {*} target - ignored
   * @param {string} prop - the name of the property to look up
   *
   * @returns {Promise} which resolves to the value of the property
   *
   * @throws {ReferenceError} if the property doesn't exist
   *
   * @public
   * @async
   */
  get (target, prop) {
    if (this[prop]) {
      return this[prop];
    }

    this._logger.debug("Issue.GET(" +
      `target: ..., ` +
      `prop: ${JSON.stringify(prop)}` +
    ")");

    // Javascript doesn't support await/async on getters. This mess gets around that.
    return (async () => {
      await this._load()

      if (!this._issue || !prop in Object.keys(this._issue)) {
        throw new ReferenceError(`Property '${prop}' does not exist in object or Issue data.`);
      }

      return this._issue[prop];
    })();
  }


  /**
   * Add one or more Labels to the configured Issue.
   *
   * The Repository must already have the Labels configured.
   *
   * @param {Array|string} labels - a Label name, or `Array` of Label names, to add to the Issue
   *
   * @returns {Promise}
   *
   * @async
   */
  async addLabels(labels) {
    this._logger.debug("Issue.addLabels(" +
      `labels: ${JSON.stringify(labels)}` +
    ")");

    this._logger.info(`Adding Labels '${JSON.stringify(labels)}' to Issue #${this.number}.`);

    if (typeof(labels) === 'string') {
      labels = [labels];
    }

    this._logger.debug("Calling GitHub add Labels API via REST...");

    return ActionContext.github.rest.issues.addLabels({
      owner: this.owner,
      repo: this.repository,
      issue_number: this.number,
      labels: labels

    }).then((response) => {
      this._logger.debug("Labels added.");
      this._logger.verbose(response);

      this._logger.debug("Clearing Issue data cache...");
      delete this._issue;

      resolve();
    });
  }

  /**
   * Remove one or more Labels from an Issue.
   *
   * Doesn't throw any errors if Labels are missing.
   *
   * @param {Array|string} labels - a Label name, or `Array` of Label names, to remove from the Issue, if they exist
   *
   * @returns {Promise}
   *
   * @async
   */
  async removeLabels(labels) {
    this._logger.debug("Issue.removeLabels(" +
      `labels: ${JSON.stringify(labels)}` +
    ")");

    this._logger.info(`Removing Labels '${JSON.stringify(labels)}' from Issue #${this.number}.`);

    if (typeof(labels) === 'string') {
      labels = [labels];
    }

    this._logger.debug("Calling GitHub remove Labels API via REST...");

    let promises = [];

    labels.forEach((label) => {

      promises.push(
        ActionContext.github.rest.issues.removeLabel({
          owner: this.owner,
          repo: this.repository,
          issue_number: this.number,
          name: label

        }).then((response) => {
          this._logger.debug(`Label removed: ${label}`);
          this._logger.verbose(response);
        })
      );

    });

    return Promise
      .all(promises)
      .finally(() => {
        this._logger.debug("Clearing Issue data cache...");
        delete this._issue;
      });
  }








  // addComment(message, user = undefined) {
  //   this._logger.debug("Issue.addComment(" +
  //     `message: ${JSON.stringify(message)},` +
  //     `user: ${JSON.stringify(user)}` +
  //   ")");

  //   // TODO
  //   throw Error("Not Implemented.");
  // }

  // addNotice(message, user = undefined) {
  //   this._logger.debug("Issue.addNotice(" +
  //     `message: ${JSON.stringify(message)},` +
  //     `user: ${JSON.stringify(user)}` +
  //   ")");

  //   // TODO
  //   throw Error("Not Implemented.");
  // }

  // addWarning(message, user = undefined) {
  //   this._logger.debug("Issue.addWarning(" +
  //     `message: ${JSON.stringify(message)},` +
  //     `user: ${JSON.stringify(user)}` +
  //   ")");

  //   // TODO
  //   throw Error("Not Implemented.");
  // }

  // addError(message, user = undefined) {
  //   this._logger.debug("Issue.addError(" +
  //     `message: ${JSON.stringify(message)},` +
  //     `user: ${JSON.stringify(user)}` +
  //   ")");

  //   // TODO
  //   throw Error("Not Implemented.");
  // }

  // getProjectController(force = false) {
  //   this._logger.debug("Issue.getProjectController(" +
  //     `force: ${JSON.stringify(force)}` +
  //   ")");

  //   // TODO
  //   throw Error("Not Implemented.");
  // }

  // getProjectStatus(force = false) {
  //   this._logger.debug("Issue.getProjectStatus(" +
  //     `force: ${JSON.stringify(force)}` +
  //   ")");

  //   // TODO
  //   throw Error("Not Implemented.");
  // }

  // getProjectFields(force = false) {
  //   this._logger.debug("Issue.getProjectFields(" +
  //     `force: ${JSON.stringify(force)}` +
  //   ")");

  //   // TODO
  //   throw Error("Not Implemented.");
  // }

  // getProjectField(field, force = false) {
  //   this._logger.debug("Issue.getProjectFields(" +
  //     `force: ${JSON.stringify(force)}` +
  //   ")");

  //   // TODO
  //   throw Error("Not Implemented.");
  // }

};
