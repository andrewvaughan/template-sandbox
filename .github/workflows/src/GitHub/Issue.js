const ActionContext = require("../ActionContext");
const NotImplementedError = require("../Errors/NotImplementedError");
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
  static _fields = {
    activeLockReason: String,
    // assignees: User,
    // author: Actor,
    authorAssociation: String,
    body: String,
    bodyHTML: String,
    bodyResourcePath: String,
    bodyText: String,
    bodyUrl: String,
    closed: Boolean,
    closedAt: Date.parse,
    // comments: Comment,
    createdAt: Date.parse,
    createdViaEmail: Boolean,
    databaseId: Number,
    // editor: Actor,
    fullDatabaseId: Number,
    // hovercard: Hovercard,   // Requires additional, non-standard parameters to function
    includesCreatedEdit: Boolean,
    isPinned: Boolean,
    isReadByViewer: Boolean,
    labels: Label,
    lastEditedAt: Date.parse,
    // linkedBranches: LinkedBranch,
    locked: Boolean,
    // milestone: Milestone,
    number: Number,
    // participants: User,
    // projectCards: ProjectCard,
    // projectItems: ProjectV2Item,
    // projectV2: ProjectV2,   // Requires additional, non-standard paramters to function
    // projectsV2: ProjectV2,
    publishedAt: Date.parse,
    // reactionGroups: ReactionGroup,
    // reactions: Reaction,
    // repository: Repository,
    resourcePath: String,
    state: String,
    stateReason: String,
    // timeline: IssueTimeline,
    // timelineItems: IssueTimelineItems,
    title: String,
    titleHTML: String,
    trackedInIssues: Issue,
    trackedIssues: Issue,
    trackedIssuesCount: Number,
    updatedAt: Date.parse,
    url: Date.parse,
    // userContentEdits: UserContentEdit,
    viewerCanClose: Boolean,
    viewerCanDelete: Boolean,
    viewerCanReact: Boolean,
    viewerCanReopen: Boolean,
    viewerCanSubscribe: Boolean,
    viewerCanUpdate: Boolean,
    // viewerCannotUpdateReasons,   // TODO returns an array, need to handle
    viewerDidAuthor: Boolean,
    viewerSubscription: String,
    viewerThreadSubscriptionFormAction: String,
    viewerThreadSubscriptionStatus: String,
  };

  /**
   * The Issue number.
   *
   * @public @readonly @type {Number}
   */
  number;

  /**
   * The Repository name containing the Issue.
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
   * Create an Issue.
   *
   * This doesn't load Issue data from GitHub, as that's lazy-loaded when data is first accessed.
   *
   * @param {Number} number - the Issue number to load
   * @param {String} [repository=context.repo.repo] - the Repository the Issue is part of
   * @param {String} [owner=context.repo.owner] - the owner of the Repository
   *
   * @returns {Proxy} of this object to allow for enhanced getters and setters
   *
   * @override @public @constructor
   */
  constructor(number, repository = undefined, owner = undefined) {
    super();

    this._debugCall("constructor", arguments);

    this.number = number;
    this.repository = repository ? repository : ActionContext.context.repo.repo;
    this.owner = owner ? owner : ActionContext.context.repo.owner;

    this._logger.debug(`New Issue(number: ${this.number}, repository: ${this.repository}, owner: ${this.owner})`);

    // Allows this to override all getters that aren't explicitly set.
    return new Proxy(this, this);
  }

  /**
   * @inheritdoc
   */
  static async create(caller, data = undefined) {
    this._debugStaticCall(this.name, "create", arguments);

    throw new NotImplementedError(); // TODO
  }

  /**
   * @inheritdoc
   */
  _getGraphQLQuery() {
    this._debugCall("_getGraphQLQuery", arguments);

    const query = `
      query GetIssueByNumber($owner: String!, $repository: String!, $issueNumber: Int!) {
        repository(owner: $owner, name: $repository) {
          issue(number: $issueNumber) {
            ${this.constructor._getPrimitiveFields().join(" ")}
          }
        }
      }`;

    const map = {
      owner: this.owner,
      repository: this.repository,
      issueNumber: this.number,
    };

    const container = ["repository", "issue"];

    return [query, map, container];
  }

  // // Comments ----------------------------------------------------------------------------------------------------------

  // /**
  //  * Adds a comment to the Issue.
  //  *
  //  * @param {string|Comment} comment - the message to include in the comment
  //  *
  //  * @returns {Object<string, *>} - the full response from the GitHub REST API
  //  *
  //  * @public @async
  //  */
  // async addComment(comment) {
  //   this._debugCall("addError", arguments);

  //   throw new NotImplementedError();
  // }

  // /**
  //  * Adds a notice-formatted comment to the Issue.
  //  *
  //  * @param {string} message - the message to include in the comment
  //  *
  //  * @returns {Object<string, *>} - the full response from the GitHub REST API
  //  *
  //  * @public @async
  //  */
  // async addNotice(message) {
  //   this._debugCall("addNotice", arguments);

  //   return this.addComment(`## :thought_balloon: Notice\n\n${message}`);
  // }

  // /**
  //  * Adds a warning-formatted comment to the Issue.
  //  *
  //  * @param {string} message - the message to include in the comment
  //  *
  //  * @returns {Object<string, *>} - the full response from the GitHub REST API
  //  *
  //  * @public @async
  //  */
  // async addWarning(message) {
  //   this._debugCall("addWarning", arguments);

  //   return this.addComment(`## :warning: Warning\n\n${message}`);
  // }

  // /**
  //  * Adds an error-formatted comment to the Issue.
  //  *
  //  * @param {string} message - the message to include in the comment
  //  *
  //  * @returns {Object<string, *>>} - the full response from the GitHub REST API
  //  *
  //  * @public @async
  //  */
  // async addError(message) {
  //   this._debugCall("addError", arguments);

  //   return this.addComment(`## :rotating_light: Error\n\n${message}`);
  // }

  // // Labels ------------------------------------------------------------------------------------------------------------

  // /**
  //  * Add Labels to the Issue.
  //  *
  //  * @param {string|string[]|Label|Label[]} labels - one or more Labels to add to the Issue
  //  *
  //  * @public @async
  //  */
  // async addLabels(labels) {
  //   this._debugCall("addLabels", arguments);

  //   throw new NotImplementedError();
  // }

  // /**
  //  * Remove Labels from the Issue.
  //  *
  //  * @param {string|string[]|Label|Label[]} labels - one or more Labels to remove from the Issue
  //  *
  //  * @public @async
  //  */
  // async removeLabels(labels) {
  //   this._debugCall("removeLabels", arguments);

  //   throw new NotImplementedError();
  // }
};
