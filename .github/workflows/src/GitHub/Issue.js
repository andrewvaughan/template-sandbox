const ActionContext = require("../ActionContext");
const NotImplementedError = require("../Errors/NotImplementedError");
const Logger = require("../Logger");
const GraphQLAbstract = require("./GraphQLAbstract");
const Label = require("./Label");

/**
 * Issue.
 *
 * @classdesc
 * Manages various actions on GitHub Issues via GraphQL API.
 *
 * @see {@link https://docs.github.com/en/graphql/reference/objects#issue}
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class @extends GraphQLAbstract
 */
module.exports = class Issue extends GraphQLAbstract {
  /**
   * @inheritdoc
   */
  static _primitiveFields = [
    "activeLockReason",
    "authorAssociation",
    "body",
    // "bodyHTML",
    // "bodyResourcePath",
    "bodyText",
    // "bodyURL",
    "closed",
    "closedAt",
    "createdAt",
    "createdViaEmail",
    // "databaseId",
    // "fullDatabaseId",
    "includesCreatedEdit",
    "isPinned",
    "isReadByViewer",
    "lastEditedAt",
    "locked",
    "number",
    "publishedAt",
    "resourcePath",
    "state",
    "stateReason",
    "title",
    // "titleHTML",
    "trackedIssuesCount",
    "updatedAt",
    "url",
    "viewerCanClose",
    "viewerCanDelete",
    "viewerCanReact",
    "viewerCanReopen",
    "viewerCanSubscribe",
    "viewerCanUpdate",
    "viewerCannotUpdateReasons",
    "viewerDidAuthor",
    "viewerSubscription",
    "viewerThreadSubscriptionFormAction",
    "viewerThreadSubscriptionStatus",
  ];

  /**
   * @inheritdoc
   */
  static _manyToOneFields = {
    // author: Actor,
    // editor: Actor,
    // hovercard: Hovercard,
    // milestone: Milestone,
    // // projectV2: ProjectV2,   // Requires additional data to search
    // reactionGroups: ReactionGroup,
    // repository: Repository,
  };

  /**
   * @inheritdoc
   */
  static _manyToManyFields = {
    // assignees: User,
    // comments: IssueComment,
    labels: Label,
    // linkedBranches: LinkedBranch,
    // participants: User,
    // projectCards: ProjectCard,
    // projectItems: ProjectItem,
    // projectsV2: ProjectV2,
    // reactions: Reaction,
    // timelineItems: TimelineItem,
    // trackedInIssues: Issue,
    // trackedIssues: Issue,
    // userContentEdits: UserContentEdit,
  };

  /**
   * The Issue number.
   *
   * @public @readonly @type {int}
   */
  number;

  /**
   * The Repository name containing the Issue.
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
   * Create an Issue.
   *
   * This doesn't load Issue data from GitHub, as that's lazy-loaded when data is first accessed.
   *
   * @param {int} number - the Issue number to load
   * @param {string} [repository=context.repo.repo] - the Repository the Issue is part of
   * @param {string} [owner=context.repo.owner] - the owner of the Repository
   *
   * @returns {Proxy}
   *
   * @override @public @constructor
   */
  constructor(number, repository = undefined, owner = undefined) {
    super();

    this._debugCall("constructor", arguments);

    this.number = number;
    this.repository = repository ? repository : ActionContext.context.repo.repo;
    this.owner = owner ? owner : ActionContext.context.repo.owner;

    this._logger.debug(`Issue.number == ${this.number}`);
    this._logger.debug(`Issue.repository == ${this.repository}`);
    this._logger.debug(`Issue.owner == ${this.owner}`);

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

    this._logger.info(
      `Loading Issue ${this.owner}/${this.repository}#${this.number} data from GitHub...`
    );

    this._logger.debug("Calling GitHub GraphQL API...");

    return ActionContext.github
      .graphql(
        `query GetIssueDataByNumber($owner: String!, $repo: String!, $issueNumber: Int!) {
          repository(owner: $owner, name: $repo, followRenames: true) {
            issue(number: $issueNumber) {
              ${this.constructor._primitiveFields.join("\n")}
            }
          }
        }`,
        {
          owner: this.owner,
          repo: this.repository,
          issueNumber: this.number,
        },
      )
      .then((response) => {
        this._logger.debug("GraphQL API call successful.");
        this._logger.verbose(response);

        Object.entries(response["repository"]["issue"]).forEach((entry) => {
          const [key, value] = entry;
          this._cache[key] = value;
        });
      });
  }

  // Comments ----------------------------------------------------------------------------------------------------------

  /**
     * Adds a comment to the Issue.
     *
     * @param {string|Comment} comment - the message to include in the comment
     *
     * @returns {Object<string, *>} - the full response from the GitHub REST API
     *
     * @public @async
     */
  async addComment(comment) {
    this._debugCall("addError", arguments);

    throw new NotImplementedError();
  }

  /**
   * Adds a notice-formatted comment to the Issue.
   *
   * @param {string} message - the message to include in the comment
   *
   * @returns {Object<string, *>} - the full response from the GitHub REST API
   *
   * @public @async
   */
  async addNotice(message) {
    this._debugCall("addNotice", arguments);

    return this.addComment(`## :thought_balloon: Notice\n\n${message}`);
  }

  /**
   * Adds a warning-formatted comment to the Issue.
   *
   * @param {string} message - the message to include in the comment
   *
   * @returns {Object<string, *>} - the full response from the GitHub REST API
   *
   * @public @async
   */
  async addWarning(message) {
    this._debugCall("addWarning", arguments);

    return this.addComment(`## :warning: Warning\n\n${message}`);
  }

  /**
   * Adds an error-formatted comment to the Issue.
   *
   * @param {string} message - the message to include in the comment
   *
   * @returns {Object<string, *>>} - the full response from the GitHub REST API
   *
   * @public @async
   */
  async addError(message) {
    this._debugCall("addError", arguments);

    return this.addComment(`## :rotating_light: Error\n\n${message}`);
  }

  // Labels ------------------------------------------------------------------------------------------------------------

  /**
   * Add Labels to the Issue.
   *
   * @param {string|string[]|Label|Label[]} labels - one or more Labels to add to the Issue
   *
   * @public @async
   */
  async addLabels(labels) {
    this._debugCall("addLabels", arguments);

    throw new NotImplementedError();
  }

  /**
   * Remove Labels from the Issue.
   *
   * @param {string|string[]|Label|Label[]} labels - one or more Labels to remove from the Issue
   *
   * @public @async
   */
  async removeLabels(labels) {
    this._debugCall("removeLabels", arguments);

    throw new NotImplementedError();
  }

  // Static Generators -------------------------------------------------------------------------------------------------

  /**
   * @inheritdoc
   */
  static async generate(caller, args = {}) {
    const logger = new Logger("[C]Issue");

    Issue._debugStaticCall("generate", args, false, logger);

    throw new NotImplementedError();
  }

  /**
   * @inheritdoc
   */
  static async generateSet(caller, perPage = 20, after = undefined, args = {}) {
    const logger = new Logger("[C]Issue");

    Issue._debugStaticCall("generateSet", args, false, logger);

    throw new NotImplementedError();
  }

};
