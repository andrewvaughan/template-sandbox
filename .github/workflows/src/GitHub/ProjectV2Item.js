const ActionContext = require("../ActionContext");
const EnhancedCore = require("../EnhancedCore");
const NotImplementedError = require("../Errors/NotImplementedError");
const GraphQLAbstract = require("./GraphQLAbstract");
const ProjectV2ItemFieldValue = require("./ProjectV2ItemFieldValue");

/**
 * ProjectV2Item.
 *
 * @classdesc
 * Manages various actions on GitHub ProjectV2Items via GraphQL API.
 *
 * @see {@link https://docs.github.com/en/graphql/reference/objects#projectv2item}
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class @extends GraphQLAbstract
 */
module.exports = class ProjectV2Item extends GraphQLAbstract {
  /**
   * @inheritdoc
   */
  static _fields = {
    // content: ProjectV2ItemContent,
    createdAt: Date.parse,
    // creator: Actor,
    databaseId: Number,
    // fieldValueByName: ProjectV2ItemFieldValue,  // TODO - Search function
    fieldValues: ProjectV2ItemFieldValue,
    id: String,
    isArchived: Boolean,
    // project: ProjectV2,
    // type: ProjectV2ItemType,
    updatedAt: Date.parse,
  };

  /**
   * @inheritdoc
   */
  static _PAGE_SIZE = 2;

  /**
   * Create a ProjectV2Item.
   *
   * This doesn't load data from GitHub, as that's lazy-loaded when data is first accessed.
   *
   * @returns {Proxy} of this object to allow for enhanced getters and setters
   *
   * @override @public @constructor
   */
  constructor() {
    super();

    this._debugCall("constructor", arguments);

    // Allows this to override all getters that aren't explicitly set.
    return new Proxy(this, this);
  }

  /**
   * @inheritdoc
   */
  static async create(caller, pageSize = ProjectV2Item._PAGE_SIZE) {
    const logger = new EnhancedCore(`${this.name}[CLASS]`);

    this._debugStaticCall(this.name, "create", { caller: caller.constructor.name, pageSize: pageSize }, false, logger);

    logger.verbose("Calling instance:");
    logger.verbose(caller);

    switch (caller.constructor.name) {
      /**
       * Issue.
       *
       * Archived projects are not returned, by default.
       */
      case "Issue":
        return ActionContext.github
          .graphql(
            `query GetProjectItemsByIssue($owner: String!, $repository: String!, $issueNumber: Int!, $pageSize: Int!) {
              repository(owner: $owner, name: $repository) {
                issue(number: $issueNumber) {
                  projectItems (first: $pageSize, includeArchived: false) {
                    totalCount,
                    nodes {
                      ${this._getPrimitiveFields().join(" ")}
                    }
                  }
                }
              }
            }`,
            {
              owner: await caller.owner,
              repository: await caller.repository,
              issueNumber: await caller.number,
              pageSize: pageSize,
            },
          )
          .then((response) => {
            logger.debug("API response received.");

            logger.verbose("Full response:");
            logger.verbose(response);

            const projectItems = response.repository.issue.projectItems;

            if (!projectItems) {
              logger.debug(`No Project Items found for Issue #${caller.number}.`);
              return [];
            }

            const count = projectItems.totalCount;
            logger.debug(`${count} Project Item(s) found for Issue #${caller.number} (capped at ${pageSize}).`);

            // TODO Pagination

            logger.verbose("Building Project Item set...");

            let newSet = [];

            projectItems.nodes.forEach((data) => {
              newSet.push(this._build(data));
            });

            logger.verbose("Project Item set build completed.");

            // Wait for all of the Label builds to complete
            return newSet;
          });
    }

    throw new NotImplementedError(
      `The \`${this.name}.create\` method does not support calling from \`${caller.constructor.name}\`.`,
    );
  }

  /**
   * @inheritdoc
   */
  static _build(data, ignoreAdditional = true) {
    const logger = new EnhancedCore(`[C]${this.name}`);

    this._debugStaticCall(this.name, "_build", { data: "...", ignoreAdditional: ignoreAdditional }, false, logger);

    logger.verbose("API data:");
    logger.verbose(data);

    const item = new ProjectV2Item();

    for (const [key, val] of Object.entries(data)) {
      if (!ignoreAdditional && !(key in this._fields)) {
        throw new ReferenceError(`Unexpected field in Label data: \`${key}\``);
      }

      // Set directly on the cache to not trigger a GitHub update on the setter
      item._cache[key] = val;
    }

    return item;
  }

  /**
   * @inheritdoc
   */
  _getGraphQLQuery() {
    this._debugCall("_getGraphQLQuery", arguments);

    throw new NotImplementedError("Direct loading of ProjectV2Item is not supported.");
  }
};
