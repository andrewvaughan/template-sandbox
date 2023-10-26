const ActionContext = require("../ActionContext");
const NotImplementedError = require("../Errors/NotImplementedError");
const Logger = require("../Logger");
const GraphQLAbstract = require("./GraphQLAbstract");
const Issue = require("./Issue");

/**
 * Label.
 *
 * @classdesc
 * Manages various actions on GitHub Labels via GraphQL API.
 *
 * @see {@link https://docs.github.com/en/graphql/reference/objects#label}
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class @extends GraphQLAbstract
 */
module.exports = class Label extends GraphQLAbstract {
  /**
   * @inheritdoc
   */
  static _primitiveFields = [
    "color",
    "createdAt",
    "description",
    "isDefault",
    "name",
    "resourcePath",
    "updatedAt",
    "url",
  ];

  /**
   * @inheritdoc
   */
  static _manyToOneFields = {
    // repository: Repository,
  };

  /**
   * @inheritdoc
   */
  static _manyToManyFields = {
    issues: Issue,
    // pullRequests: PullRequest,
  };

  /**
   * The Label name.
   *
   * @public @readonly @type {string}
   */
  name;

  /**
   * The Repository name containing the Label.
   *
   * @public @readonly @type {string}
   */
  repository;

  /**
   * The Owner name for the Repository.
   *
   * @public @readonly @type {string}
   */
  owner;

  /**
   * Create a Label.
   *
   * This doesn't load Label data from GitHub, as that's lazy-loaded when data is first accessed.
   *
   * @param {int} name - the Issue name to load
   * @param {string} [repository=context.repo.repo] - the Repository the Issue is part of
   * @param {string} [owner=context.repo.owner] - the owner of the Repository
   *
   * @returns {Proxy}
   *
   * @override @public @constructor
   */
  constructor(name, repository = undefined, owner = undefined) {
    super();

    this._debugCall("constructor", arguments);

    this.name = name;
    this.repository = repository ? repository : ActionContext.context.repo.repo;
    this.owner = owner ? owner : ActionContext.context.repo.owner;

    this._logger.debug(`Label.name == ${this.name}`);
    this._logger.debug(`Label.repository == ${this.repository}`);
    this._logger.debug(`Label.owner == ${this.owner}`);

    // Allows this to override all getters that aren't explicitly set.
    return new Proxy(this, this);
  }

  /**
   * @inheritdoc
   */
  async _loadPrimitives(force = false) {
    this._debugCall("_loadPrimitives", arguments);

    if (this._cache["name"] && !force) {
      this._logger.debug("Load cache hit.");
      return;
    }

    this._logger.debug("Load cache miss.");

    this._logger.info(
      `Loading ${this.owner}/${this.repository} Label '${this.name}' data from GitHub...`
    );

    this._logger.debug("Calling GitHub GraphQL API...");

    return ActionContext.github
      .graphql(
        `query GetLabelDataByName($owner: String!, $repo: String!, $labelName: String!) {
          repository(owner: $owner, name: $repo, followRenames: true) {
            label(name: $labelName) {
              ${this.constructor._primitiveFields.join("\n")}
            }
          }
        }`,
        {
          owner: this.owner,
          repo: this.repository,
          labelName: this.name,
        },
      )
      .then((response) => {
        this._logger.debug("GraphQL API call successful.");
        this._logger.verbose(response);

        Object.entries(response["repository"]["label"]).forEach((entry) => {
          const [key, value] = entry;
          this._cache[key] = value;
        });
      });
  }

  // Static Generators -------------------------------------------------------------------------------------------------

  /**
   * @inheritdoc
   */
  static async generate(caller, args = {}) {
    const logger = new Logger("[C]Label");

    Label._debugStaticCall("generate", args, false, logger);

    throw new NotImplementedError();
  }

  /**
   * @inheritdoc
   */
  static async generateSet(caller, perPage = 20, after = undefined, args = {}) {
    const logger = new Logger("[C]Label");

    Label._debugStaticCall("generateSet", args, false, logger);

    throw new NotImplementedError();
  }
};
