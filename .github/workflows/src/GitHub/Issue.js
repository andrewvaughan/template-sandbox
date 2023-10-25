const ActionContext = require("../ActionContext");
const GraphQLAbstract = require("./GraphQLAbstract");
const Logger = require("../Logger");

/**
 * Issue.
 *
 * @classdesc
 * Manages various actions on GitHub Issues via the REST and GraphQL APIs.
 *
 * @see {@link https://docs.github.com/en/rest/issues}
 * @see {@link https://docs.github.com/en/graphql/reference/objects#issue}
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class
 * @extends GraphQLAbstract
 */
module.exports = class Issue extends GraphQLAbstract {
  /**
   * Fields within the GitHub GraphQL API that are primitive in nature and return their value directly.
   *
   * @see {@link https://docs.github.com/en/graphql/reference/objects#issue}
   *
   * @type {string[]}
   *
   * @overload
   * @protected
   * @readonly
   * @static
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
   * Fields mapping within the GitHub GraphQL API and their associated class names.
   *
   * @see {@link https://docs.github.com/en/graphql/reference/objects#issue}
   *
   * @type {Object<string, string>}
   *
   * @overload
   * @protected
   * @readonly
   * @static
   */
  static _manyToOneFields = {
    author: "Actor",
    editor: "Actor",
    hovercard: "Hovercard",
    milestone: "Milestone",
    // projectV2: "ProjectV2",   // Requires additional data to search
    reactionGroups: "ReactionGroup",
    repository: "Repository",
  };

  /**
   * Paginated fields within the GitHub GraphQL API that and their associated primitives or class names.
   *
   * @see {@link https://docs.github.com/en/graphql/reference/objects#issue}
   *
   * @type {Object<string, string>}
   *
   * @overload
   * @protected
   * @readonly
   * @static
   */
  static _manyToManyFields = {
    assignees: "User",
    comments: "IssueComment",
    labels: "Label",
    linkedBranches: "LinkedBranch",
    participants: "User",
    projectCards: "ProjectCard",
    projectItems: "ProjectItem",
    projectsV2: "ProjectV2",
    reactions: "Reaction",
    timelineItems: "TimelineItem",
    trackedInIssues: "Issue",
    trackedIssues: "Issue",
    userContentEdits: "UserContentEdit",
  };

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
   * Create an Issue.
   *
   * This doesn't load Issue data from GitHub, as that's lazy-loaded when data is first accessed.
   *
   * @param {int} number - the Issue number to load
   * @param {string} [repository=context.repo.repo] - the Repository the Issue is part of
   * @param {string} [owner=context.repo.owner] - the owner of the Repository
   *
   * @public
   * @constructor
   */
  constructor(number, repository = undefined, owner = undefined) {
    super();

    this._logger = new Logger("Issue");

    this._logger.debug(
      "Issue.constructor(" +
        `number: ${JSON.stringify(number)}, ` +
        `repository: ${JSON.stringify(repository)}, ` +
        `owner: ${JSON.stringify(owner)}` +
        ")",
    );

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
   * Get all primitive types from GitHub.
   *
   * Only loads simple primitives in this call. Anything that returns a one-to-many or many-to-many relationship is
   * implemented via a separate getter in a lazy-laoded methodology.
   *
   * @param {boolean} [force=false] - whether to force a reload from GitHub
   *
   * @return {Object<string, *>} the full response from the GraphQL API call
   *
   * @throws {GraphqlResponseError} if the GraphQL API call fails
   *
   * @protected
   * @async
   */
  async _loadPrimitives(force = false) {
    this._logger.debug("Issue._load(" + `force: ${JSON.stringify(force)}` + ")");

    if (this._issue && !force) {
      this._logger.debug("Load cache hit.");
      return;
    }

    this._logger.debug("Load cache miss.");

    this._logger.info(`Loading Issue #${this.number} data from GitHub...`);
    this._logger.debug("Calling GitHub GraphQL API...");

    return ActionContext.github
      .graphql(
        `query GetIssueDataByNumber($owner: String!, $repo: String!, $issueNumber: Int!) {
        repository(owner: $owner, name: $repo, followRenames: true) {
          issue(number: $issueNumber) {
            ${Issue._primitiveFields.join("\n")}
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

        this._logger.debug("CACHE:");
        this._logger.debug(this._cache);
      });

    /*
    return ActionContext.github.rest.issues
      .get({
        owner: this.owner,
        repo: this.repository,
        issue_number: this.number,
      })
      .then((response) => {
        this._logger.debug(`Response status: ${response.status}`);

        if (response.status < 200 || response.status > 299) {
          this._logger.debug(response);
          throw ReferenceError(`Unable to load Issue #${this.number}.`);
        }

        this._issue = response.data;

        this._logger.debug("Issue data loaded.");
        this._logger.verbose(this._issue);
      });
    */
  }

  /**
   * Force a reload of the Issue data.
   *
   * @public
   * @async
   */
  async reload() {
    return this._load(true);
  }
};

//   // Fields ------------------------------------------------------------------------------------------------------------

//   /**
//    * If not explicitly set in this Object, attempts to look up the value in the Issue data.
//    *
//    * @example
//    * Because of the asynchronous nature of this getter, all access of variables must have a prepended `await` token:
//    *
//    * ```js
//    * let labels = await myIssue.labels;
//    * ```
//    *
//    * @param {*} target - not used
//    * @param {string} prop - the name of the property to look up
//    *
//    * @returns {*} a promise that resolves to the value of `prop`
//    *
//    * @throws {ReferenceError} if the property doesn't exist
//    *
//    * @public
//    * @async
//    */
//   get(target, prop) {
//     // Prioritize any variables explicitly set in this object
//     if (this[prop]) {
//       return this[prop];
//     }

//     this._logger.debug("Issue.GET(" + `target: ..., ` + `prop: ${JSON.stringify(prop)}` + ")");

//     // Javascript doesn't support await/async on getters. This mess gets around that.
//     return (async () => {
//       await this._load();

//       if (!this._issue || !prop in Object.keys(this._issue)) {
//         throw new ReferenceError(`Property '${prop}' does not exist in object or Issue data.`);
//       }

//       return this._issue[prop];
//     })();
//   }

//   /**
//    * Return the Labels that are assigned to this Issue.
//    *
//    * @type {Label[]}
//    *
//    * @public
//    * @async
//    */
//   get labels() {
//     this._logger.debug("Issue.labels");

//     // TODO
//     throw Error("Not implemented");
//   }

//   /**
//    * Add one or more Labels to the configured Issue.
//    *
//    * The Repository must already have the Labels configured. Calling this function clears the Issue cache.
//    *
//    * @param {string[]|string} labels - a Label name, or `Array` of Label names, to add to the Issue
//    *
//    * @returns {Object<string, *>} the full response from the GitHub REST API
//    *
//    * @public
//    * @async
//    */
//   async addLabels(labels) {
//     this._logger.debug("Issue.addLabels(" + `labels: ${JSON.stringify(labels)}` + ")");

//     this._logger.info(`Adding Labels '${JSON.stringify(labels)}' to Issue #${this.number}.`);

//     if (typeof labels === "string") {
//       labels = [labels];
//     }

//     this._logger.debug("Calling GitHub add Labels API via REST...");

//     return ActionContext.github.rest.issues
//       .addLabels({
//         owner: this.owner,
//         repo: this.repository,
//         issue_number: this.number,
//         labels: labels,
//       })
//       .then((response) => {
//         this._logger.debug("Labels added.");
//         this._logger.verbose(response);

//         this._logger.debug("Clearing Issue data cache...");
//         delete this._issue;
//       });
//   }

//   /**
//    * Remove one or more Labels from an Issue.
//    *
//    * Doesn't throw any errors if Labels are missing. Calling this function clears the Issue cache.
//    *
//    * @param {string[]|string} labels - a Label name, or `Array` of Label names, to remove from the Issue, if they exist
//    *
//    * @public
//    * @async
//    */
//   async removeLabels(labels) {
//     this._logger.debug("Issue.removeLabels(" + `labels: ${JSON.stringify(labels)}` + ")");

//     this._logger.info(`Removing Labels '${JSON.stringify(labels)}' from Issue #${this.number}.`);

//     if (typeof labels === "string") {
//       labels = [labels];
//     }

//     this._logger.debug("Calling GitHub remove Labels API via REST...");

//     let promises = [];

//     labels.forEach((label) => {
//       promises.push(
//         ActionContext.github.rest.issues
//           .removeLabel({
//             owner: this.owner,
//             repo: this.repository,
//             issue_number: this.number,
//             name: label,
//           })
//           .then((response) => {
//             this._logger.debug(`Label removed: ${label}`);
//             this._logger.verbose(response);
//           }),
//       );
//     });

//     return Promise.all(promises).finally(() => {
//       this._logger.debug("Clearing Issue data cache...");
//       delete this._issue;
//     });
//   }

//   // Comments ----------------------------------------------------------------------------------------------------------

//   /**
//    * Adds a comment to the Issue.
//    *
//    * @param {string} message - the message to include in the comment
//    *
//    * @returns {Objec<string, *>} - the full response from the GitHub REST API
//    *
//    * @async
//    * @public
//    */
//   async addComment(message) {
//     this._logger.debug("Issue.addComment(...)");
//     this._logger.verbose(`message: ${JSON.stringify(message)}`);

//     this._logger.info(`Adding comment to Issue #${this.number}`);

//     return ActionContext.github.rest.issues
//       .createComment({
//         issue_number: this.number,
//         owner: this.owner,
//         repo: this.repository,
//         body: message,
//       })
//       .then((response) => {
//         this._logger.debug("Comment added.");
//         this._logger.verbose(response);
//       });
//   }

//   /**
//    * Adds a notice-formatted comment to the Issue.
//    *
//    * @param {string} message - the message to include in the comment
//    *
//    * @returns {Object<string, *>} - the full response from the GitHub REST API
//    *
//    * @async
//    * @public
//    */
//   async addNotice(message) {
//     this._logger.debug("Issue.addNotice(" + `message: ${JSON.stringify(message)}` + ")");

//     return this.addComment(`## :thought_balloon: Notice\n\n${message}`);
//   }

//   /**
//    * Adds a warning-formatted comment to the Issue.
//    *
//    * @param {string} message - the message to include in the comment
//    *
//    * @returns {Object<string, *>} - the full response from the GitHub REST API
//    *
//    * @async
//    * @public
//    */
//   async addWarning(message) {
//     this._logger.debug("Issue.addWarning(" + `message: ${JSON.stringify(message)}` + ")");

//     return this.addComment(`## :warning: Warning\n\n${message}`);
//   }

//   /**
//    * Adds an error-formatted comment to the Issue.
//    *
//    * @param {string} message - the message to include in the comment
//    *
//    * @returns {Objec<string, *>>} - the full response from the GitHub REST API
//    *
//    * @async
//    * @public
//    */
//   async addError(message) {
//     this._logger.debug("Issue.addError(" + `message: ${JSON.stringify(message)}` + ")");

//     return this.addComment(`## :rotating_light: Error\n\n${message}`);
//   }

//   // Resources ---------------------------------------------------------------------------------------------------------

//   /**
//    * Gets the Project associated with this Issue.
//    *
//    * @param {boolean} [force=false] - whether to force a reload from GitHub
//    *
//    * @returns {Project|boolean} the associated `Project`, or `false` if no associated GitHub Project exists
//    *
//    * @throws {ReferenceError} if there are multiple Projects assigned to the Issue within the Repository
//    *
//    * @public
//    * @async
//    */
//   get project() {
//     this._logger.debug("Issue.project");

//     // TODO
//     throw new Error("Not implemented.");
//   }

// };
