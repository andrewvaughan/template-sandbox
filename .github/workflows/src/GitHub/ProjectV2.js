const ActionContext = require("../ActionContext");
const NotImplementedError = require("../Errors/NotImplementedError");
const Logger = require("../Logger");
const GraphQLAbstract = require("./GraphQLAbstract");

/**
 * ProjectV2.
 *
 * @classdesc
 * Manages various actions on GitHub V2 Projects via GraphQL API.
 *
 * @see {@link https://docs.github.com/en/graphql/reference/objects#projectv2}
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class @extends GraphQLAbstract
 */
module.exports = class ProjectV2 extends GraphQLAbstract {
  /**
   * @inheritdoc
   */
  static _primitiveFields = [
    "closed",
    "closedAt",
    "createdAt",
    // "databaseId",
    "number",
    "public",
    "readme",
    "resourcePath",
    "shortDescription",
    "template",
    "title",
    "updatedAt",
    "url",
    "viewerCanClose",
    "viewerCanReopen",
    "viewerCanUpdate",

  ];

  /**
   * @inheritdoc
   */
  static _manyToOneFields = {
    // creator: Actor,
    // // field: ProjecvV2Field,  // Requires filtering
    // owner: User,
    // // view: ProjectV2View,  // Requires filtering
    // // workflow: Workflow,  // Requires filtering
  };

  /**
   * @inheritdoc
   */
  static _manyToManyFields = {
    // fields: ProjectV2Field,
    // items: ProjectV2Item,
    // repositories: Repository,
    // teams: Team,
    // views: ProjectV2View,
    // workflows: ProjectV2Workflow,
  };

  /**
   * The Project number.
   *
   * @public @readonly @type {int}
   */
  number;

  /**
   * The Owner name for the Project.
   *
   * @public @readonly @type {string}
   */
  owner;

  /**
   * Create a Project.
   *
   * This doesn't load ProjectV2 data from GitHub, as that's lazy-loaded when data is first accessed.
   *
   * @param {int} number - the Project number to load
   * @param {string} [owner=context.repo.owner] - the owner of the Repository
   *
   * @returns {Proxy}
   *
   * @override @public @constructor
   */
  constructor(name, owner = undefined) {
    super();

    this._debugCall("constructor", arguments);

    this.number = number;
    this.owner = owner ? owner : ActionContext.context.repo.owner;

    this._logger.debug(`ProjectV2.number == ${this.number}`);
    this._logger.debug(`ProjectV2.owner == ${this.owner}`);

    // Allows this to override all getters that aren't explicitly set.
    return new Proxy(this, this);
  }

  /**
   * @inheritdoc
   */
  async _loadPrimitives(force = false) {
    this._debugCall("_loadPrimitives", arguments);

    if (this._cache["number"] && !force) {
      this._logger.debug("Load cache hit.");
      return;
    }

    this._logger.debug("Load cache miss.");

    this._logger.info(`Loading ProjectV2 '${this.owner}.${this.number}' data from GitHub...`);
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
    const logger = new Logger("[C]ProjectV2");

    ProjectV2._debugStaticCall("generate", args, false, logger);

    throw new NotImplementedError();
  }

  /**
   * @inheritdoc
   */
  static async generateSet(caller, perPage = 20, after = undefined, args = {}) {
    const logger = new Logger("[C]ProjectV2");

    ProjectV2._debugStaticCall("generateSet", args, false, logger);

    throw new NotImplementedError();
  }
};
