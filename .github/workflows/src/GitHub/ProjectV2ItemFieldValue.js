const EnhancedCore = require("../EnhancedCore");
const NotImplementedError = require("../Errors/NotImplementedError");
const GraphQLAbstract = require("./GraphQLAbstract");
const Label = require("./Label");

/**
 * ProjectV2ItemFieldValue.
 *
 * @classdesc
 * Manages various actions on GitHub ProjectV2ItemFieldValue via GraphQL API. This is a Union that
 * implements different fields depending on the type.
 *
 * @see {@link https://docs.github.com/en/graphql/reference/unions#projectv2itemfieldvalue}
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class @extends GraphQLAbstract
 */
module.exports = class ProjectV2ItemFieldValue extends GraphQLAbstract {
  /**
   * @inheritdoc
   *
   * @see {@link https://docs.github.com/en/graphql/reference/interfaces#projectv2itemfieldvaluecommon}
   */
  static _fields = {
    createdAt: Date.parse,
    // creator: Actor,
    databaseId: Number,
    // field: ProjectV2FieldConfiguration,
    id: String,
    // item: ProjectV2Item,   // TODO - Circular reference
    updatedAt: Date.parse,
  };

  static _fieldsDate = {
    date: Date.parse,
  };

  static _fieldsIteration = {
    duration: Number,
    iterationId: String,
    startDate: Date.parse,
    title: String,
    titleHTML: String,
  };

  static _fieldsLabel = {
    labels: Label,
  };

  static _fieldsMilestone = {
    // milestone: Milestone,
  };

  static _fieldsNumber = {
    number: Number,
  };

  static _fieldsPullRequest = {
    // pullRequests: PullRequest,
  };

  static _fieldsRepository = {
    // repository: Repository,
  };

  static _fieldsReviewer = {
    // reviewers: RequestedReviewer,
  };

  static _fieldsSingleSelect = {
    color: String,
    description: String,
    descriptionHTML: String,
    name: String,
    nameHTML: String,
    optionId: String,
  };

  static _fieldsText = {
    text: String,
  };

  static _fieldsUser = {
    // users: User,   // TODO
  };

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
  static async create(caller, pageSize = GraphQLAbstract._PAGE_SIZE) {
    const logger = new EnhancedCore(`${this.name}[CLASS]`);

    this._debugStaticCall(this.name, "create", { caller: caller.constructor.name, pageSize: pageSize }, false, logger);

    logger.debug("Calling instance:");
    logger.debug(caller);

    // TODO - why the heck is this not calling the `get` function of `ProjectV2Item` ???
    logger.debug(`caller.id == ${caller.id}`);
    logger.debug(`caller.databaseId == ${caller.databaseId}`);
    logger.debug(`caller.foobar == ${caller.foobar}`);

    // switch (caller.constructor.name) {
    //   /**
    //    * ProjectV2Item.
    //    */
    //   case "ProjectV2Item":
    //     return ActionContext.github
    //       .graphql(
    //         `query GetFieldsByProjectItem($projectItemID: ID!, $pageSize: Int!) {
    //           node(id: $projectItemID) {
    //             fieldValues(first: $pageSize) {
    //               nodes {
    //                 .. on ProjectV2ItemFieldValueCommon {
    //                   ${this._getPrimitiveFields(this._fields).join(" ")}
    //                 }
    //                 .. on ProjectV2ItemFieldDateValue {
    //                   ${this._getPrimitiveFields(this._fieldsDate).join(" ")}
    //                 }
    //                 .. on ProjectV2ItemFieldIterationValue {
    //                   ${this._getPrimitiveFields(this._fieldsIteration).join(" ")}
    //                 }
    //                 # .. on ProjectV2ItemFieldLabelValue {
    //                 #
    //                 # }
    //                 # .. on ProjectV2ItemFieldMilestoneValue {
    //                 #
    //                 # }
    //                 .. on ProjectV2ItemFieldNumberValue {
    //                   ${this._getPrimitiveFields(this._fieldsNumber).join(" ")}
    //                 }
    //                 # .. on ProjectV2ItemFieldPullRequestValue {
    //                 #
    //                 # }
    //                 # .. on ProjectV2ItemFieldRepositoryValue {
    //                 #
    //                 # }
    //                 # .. on ProjectV2ItemFieldReviewerValue {
    //                 #
    //                 # }
    //                 .. on ProjectV2ItemFieldSingleSelectValue {
    //                   ${this._getPrimitiveFields(this._fieldsSingleSelect).join(" ")}
    //                 }
    //                 .. on ProjectV2ItemFieldTextValue {
    //                   ${this._getPrimitiveFields(this._fieldsText).join(" ")}
    //                 }
    //                 # .. on ProjectV2ItemFieldUserValue {
    //                 #
    //                 # }
    //               }
    //             }
    //           }
    //         }`,
    //         {
    //           projectItemID: caller.id,
    //           pageSize: pageSize,
    //         },
    //       )
    //       .then((response) => {
    //         logger.debug("API response received.");

    //         logger.debug("Full response:");
    //         logger.debug(response);

    //         throw Error("DONE");

    //         const projectItems = response.repository.issue.projectItems;

    //         if (!projectItems) {
    //           logger.debug(`No Project Items found for Issue #${caller.number}.`);
    //           return [];
    //         }

    //         const count = projectItems.totalCount;
    //         logger.debug(`${count} Project Item(s) found for Issue #${caller.number} (capped at ${pageSize}).`);

    //         // TODO Pagination

    //         logger.verbose("Building Project Item set...");

    //         let promises = [];

    //         projectItems.nodes.forEach(async (data) => {
    //           promises.push(ProjectV2Item._build(data));
    //         });

    //         logger.verbose("Project Item set build completed.");

    //         // Wait for all of the Label builds to complete
    //         return Promise.all(promises).then((builtSet) => {
    //           return builtSet;
    //         });
    //       });
    // }

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
