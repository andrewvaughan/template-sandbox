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
  static _fields = {
    color: String,
    createdAt: Date.parse,
    description: String,
    id: String,
    isDefault: Boolean,
    // issues: Issue,   // Circular references (issue -> labels -> issues -> labels) breaks JS
    name: String,
    // pullRequests: PullRequest,
    // repository: Repository,
    resourcePath: String,
    updatedAt: Date.parse,
    url: String,
  };

  /**
   * The Label name.
   *
   * @public @readonly @type {String}
   */
  name;

  /**
   * The Repository name containing the Label.
   *
   * @public @readonly @type {String}
   */
  repository;

  /**
   * The Owner name for the Repository.
   *
   * @public @readonly @type {String}
   */
  owner;

  /**
   * Create a Label.
   *
   * This doesn't load Label data from GitHub, as that's lazy-loaded when data is first accessed.
   *
   * @param {String} name - the Label name to load
   * @param {String} [repository=context.repo.repo] - the Repository the Issue is part of
   * @param {String} [owner=context.repo.owner] - the owner of the Repository
   *
   * @returns {Proxy} of this object to allow for enhanced getters and setters
   *
   * @override @public @constructor
   */
  constructor(name, repository = undefined, owner = undefined) {
    super();

    this._logger = new Logger(`Label(${name})`);

    this._debugCall("constructor", arguments);

    this.name = name;
    this.repository = repository ? repository : ActionContext.context.repo.repo;
    this.owner = owner ? owner : ActionContext.context.repo.owner;

    this._logger.debug(`New Label(name: ${this.name}, repository: ${this.repository}, owner: ${this.owner})`);

    // Allows this to override all getters that aren't explicitly set.
    return new Proxy(this, this);
  }

  /**
   * @inheritdoc
   */
  static async create(caller, pageSize = GraphQLAbstract._PAGE_SIZE) {
    const logger = new Logger(`${this.name}[CLASS]`);

    this._debugStaticCall(this.name, "create", { caller: caller.constructor.name, pageSize: pageSize }, false, logger);

    logger.verbose("Calling instance:");
    logger.verbose(caller);

    switch (caller.constructor.name) {
      /**
       * Issue
       */
      case "Issue":
        return ActionContext.github
          .graphql(
            `query GetLabelsByIssue($owner: String!, $repository: String!, $issueNumber: Int!, $pageSize: Int!) {
                repository(owner: $owner, name: $repository) {
                  issue(number: $issueNumber) {
                    labels (first: $pageSize) {
                      totalCount,
                      nodes {
                        ${this._getPrimitiveFields().join(" ")}
                      }
                    }
                  }
                }
              }`,
            {
              owner: caller.owner,
              repository: caller.repository,
              issueNumber: caller.number,
              pageSize: pageSize,
            },
          )
          .then((response) => {
            logger.debug("API response received.");

            logger.verbose("Full response:");
            logger.verbose(response);

            const labels = response.repository.issue.labels;

            if (!labels) {
              logger.debug(`No Labels found for Issue #${caller.number}.`);
              return [];
            }

            const count = labels.totalCount;
            logger.debug(`${count} Label(s) found for Issue #${caller.number} (capped at ${pageSize}).`);

            // TODO Pagination

            logger.verbose("Building Label set...");
            let promises = [];

            labels.nodes.forEach(async (data) => {
              // Add data to the dataset that won't be available up front
              data["owner"] = caller.owner;
              data["repository"] = caller.repository; // TODO - Transition to proper Repository object lookup

              promises.push(Label._build(data));
            });

            logger.verbose("Label set build completed.");

            // Wait for all of the Label builds to complete
            return Promise
              .all(promises)
              .then((labelSet) => {
                return labelSet;
              });
          });
    }

    throw new NotImplementedError(
      `The \`${this.name}.create\` method does not support calling from \`${caller.constructor.name}\`.`,
    );
  }

  /**
   * @inheritdoc
   */
  static async _build(data, ignoreAdditional = true) {
    const logger = new Logger(`[C]${this.name}`);

    this._debugStaticCall(this.name, "_build", { data: "...", ignoreAdditional: ignoreAdditional }, false, logger);

    logger.verbose("API data:");
    logger.verbose(data);

    ["owner", "repository", "name"].every((key) => {
      if (!key in data) {
        throw new ReferenceError(`Missing required ${this.name} field: \`${key}\``);
      }
    });

    const label = new Label(data["name"], data["repository"], data["owner"]);

    for (const [key, val] of Object.entries(data)) {
      if (!ignoreAdditional && !(key in this._fields)) {
        throw new ReferenceError(`Unexpected field in Label data: \`${key}\``);
      }

      // Set directly on the cache to not trigger a GitHub update on the setter
      label._cache[key] = val;
    }

    return label;
  }

  /**
   * @inheritdoc
   */
  _getGraphQLQuery() {
    this._debugCall("_getGraphQLQuery", arguments);

    // Limit the fields to only primitives
    let fields = this.constructor._getPrimitiveFields();

    const query = `
      query GetLabelByName($owner: String!, $repository: String!, $labelName: String!) {
        repository(owner: $owner, name: $repository) {
          label(name: $labelName) {
            ${this.constructor._getPrimitiveFields().join(" ")}
          }
        }
      }`;

    const map = {
      owner: this.owner,
      repository: this.repository,
      labelName: this.name,
    };

    const container = ["repository", "label"];

    return [query, map, container];
  }
};
