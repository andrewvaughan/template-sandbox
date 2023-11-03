const ActionContext = require("../ActionContext");
const NotImplementedError = require("../Errors/NotImplementedError");
const GraphQLAbstract = require("./GraphQLAbstract");
const Label = require("./Label");
const crypto = require("crypto");
const ProjectV2Item = require("./ProjectV2Item");

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
    // hovercard: Hovercard,        // TODO - Search function
    id: String,
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
    projectItems: ProjectV2Item,
    // projectV2: ProjectV2,        // TODO - Search function
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
    // viewerCannotUpdateReasons,   // TODO - Returns Array of Strings
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
   * This doesn't load data from GitHub, as that's lazy-loaded when data is first accessed.
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
    super(number);

    this._debugCall("constructor", arguments);

    // Setting via reflection avoids the special setter override
    this.number = number;
    this.repository = repository ? repository : ActionContext.context.repo.repo;
    this.owner = owner ? owner : ActionContext.context.repo.owner;

    this._eCore.debug(`New Issue(number: ${this.number}, repository: ${this.repository}, owner: ${this.owner})`);

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

  // Labels ------------------------------------------------------------------------------------------------------------

  /**
   * Add one or more Labels to the Issue.
   *
   * @param {String|String[]|Label|Label[]} labels - one or more Labels or label names to add to the Issue
   *
   * @throws {TypeError} upon encountering an unexpected object type
   *
   * @public @async
   */
  async addLabels(labels) {
    this._debugCall("addLabels", arguments);

    if (!Array.isArray(labels)) {
      labels = [labels];
    }

    this._eCore.verbose("Parsing label names...");

    let promises = [];

    labels.forEach(async (label) => {
      if (typeof label === "string") {
        label = new Label(label, this.repository, this.owner);
      }

      if (!(label instanceof Label)) {
        throw new TypeError(`Unexpected Label type encountered: \`${label.constructor.name}\``);
      }

      promises.push(label.id);
    });

    const issueID = await this.id;

    // Wait for all the Issue IDs to fetch
    return Promise.all(promises).then((labelIDs) => {
      this._eCore.debug(`Calling GitHub GraphQL API to add Labels to Issue #${this.number}...`);
      this._eCore.verbose(`Label IDs: ${labelIDs.join(", ")}`);

      return ActionContext.github.graphql(
        `mutation AddLabelsToIssue($clientID: String!, $labelIDs: [ID!]!, $issueID: ID!) {
            addLabelsToLabelable(input: {
              clientMutationId: $clientID,
              labelIds: $labelIDs,
              labelableId: $issueID
            }) {
              clientMutationId
            }
          }`,
        {
          clientID: crypto.randomUUID(),
          labelIDs: labelIDs,
          issueID: issueID,
        },
      );
    });
  }

  /**
   * Remove one or more Labels from the Issue.
   *
   * Labels must exist in the Issue's Repository to succeed without failure.
   *
   * @param {String|String[]|Label|Label[]} labels - one or more Labels or label names to remove from the Issue
   *
   * @public @async
   */
  async removeLabels(labels) {
    this._debugCall("removeLabels", arguments);

    if (!Array.isArray(labels)) {
      labels = [labels];
    }

    this._eCore.verbose("Parsing label names...");

    let promises = [];

    labels.forEach(async (label) => {
      if (typeof label === "string") {
        label = new Label(label, this.repository, this.owner);
      }

      if (!(label instanceof Label)) {
        throw new TypeError(`Unexpected Label type encountered: \`${label.constructor.name}\``);
      }

      promises.push(label.id);
    });

    const issueID = await this.id;

    // Wait for all the Issue IDs to fetch
    return Promise.all(promises).then((labelIDs) => {
      this._eCore.debug(`Calling GitHub GraphQL API to remove Labels from Issue #${this.number}...`);
      this._eCore.verbose(`Label IDs: ${labelIDs.join(", ")}`);

      return ActionContext.github.graphql(
        `mutation RemoveLabelsFromIssue($clientID: String!, $labelIDs: [ID!]!, $issueID: ID!) {
            removeLabelsFromLabelable(input: {
              clientMutationId: $clientID,
              labelIds: $labelIDs,
              labelableId: $issueID
            }) {
              clientMutationId
            }
          }`,
        {
          clientID: crypto.randomUUID(),
          labelIDs: labelIDs,
          issueID: issueID,
        },
      );
    });
  }

  // Comments ----------------------------------------------------------------------------------------------------------

  /**
   * Adds a comment to the Issue.
   *
   * @param {String} comment - the message to include in the comment
   *
   * @returns {Object<String, *>} - the full response from the GitHub REST API
   *
   * @public @async
   */
  async addComment(comment) {
    this._debugCall("addComment", { comment: "..." });

    this._eCore.verbose(comment);

    const issueID = await this.id;

    return ActionContext.github.graphql(
      `mutation AddCommentToIssue($clientID: String!, $issueID: ID!, $comment: String!) {
        addComment(input: {
          clientMutationId: $clientID,
          subjectId: $issueID,
          body: $comment
        }) {
          clientMutationId
        }
      }`,
      {
        clientID: crypto.randomUUID(),
        issueID: issueID,
        comment: comment,
      },
    );
  }

  /**
   * Adds a notice-formatted comment to the Issue.
   *
   * @param {String} message - the message to include in the comment
   *
   * @returns {Object<String, *>} - the full response from the GitHub REST API
   *
   * @public @async
   */
  async addNotice(message) {
    this._debugCall("addNotice", { message: "..." });

    this._eCore.verbose(message);

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
    this._debugCall("addWarning", { message: "..." });

    this._eCore.verbose(message);

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
    this._debugCall("addError", { message: "..." });

    this._eCore.verbose(message);

    return this.addComment(`## :rotating_light: Error\n\n${message}`);
  }
};
