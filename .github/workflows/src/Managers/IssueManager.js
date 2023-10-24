/**
 * Provides utilities for accessing and modifying GitHub Issues.
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 */

/**
 * The GitHub Action Scripts workflow provides a modified `require` function that helps find files relatively when
 * running in a GitHub Runner. This isn't passed to included files, so it's important for any scripts calling this class
 * to add the following before requiring this file:
 *
 * ```js
 * global.ghScriptRequire = require;
 * ```
 *
 * Without this, the environment uses the normal `require` which is beneficial for use cases like testing.
 */
if (global.ghScriptRequire !== undefined) {
  require = global.ghScriptRequire;
}

const AbstractManager = require("./AbstractManager");

/**
 * IssueManager.
 *
 * @extends AbstractManager
 *
 * @classdesc
 * Provides various utilities to access and modify GitHub Issues. Accessing and managing Issues within private
 * Repositories require a properly authenticated Personal Access Token or GitHub Token to work without error.
 *
 * @see {@link https://github.com/actions/github-script}
 * @see {@link https://github.com/actions/github-script?tab=readme-ov-file#using-a-separate-github-token}
 *
 * @class
 */
module.exports = class IssueManager extends AbstractManager {
  /**
   * Adds a Label to a given Issue.
   *
   * @param {string|array} labels - the Label or Labels to add; must already exist in the Repository configuration
   * @param {int|null} issueNumber - the Issue number to modify (default: `context.issue.number`)
   * @param {string|null} repo - the name of the Repository where the Issue exists (default: `context.repo.repo`)
   * @param {string|null} owner - the name of the Owner or Organization where the Repository exists (default: `context.repo.owner`)
   *
   * @public
   */
  async addLabels(labels, issueNumber = null, repo = null, owner = null) {
    if (issueNumber === null) {
      issueNumber = this._context.issue.number;
    }

    this._logger.info(`Adding label(s) '${labels.join(", ")} to Issue #${issueNumber}...`);

    if (repo === null) {
      this._logger.debug(`No owner set, using context Repository owner.`);
      repo = this._context.repo.repo;
    }

    if (owner === null) {
      this._logger.debug(`No repository set, using context Repository.`);
      owner = this._context.repo.owner;
    }

    // If the labels provided was a single string, wrap it in an array
    if (typeof labels === "string" || labels instanceof String) {
      labels = [labels];
    }

    // Add the labels
    this._logger.debug("Calling GitHub add label API...");

    await this._github.rest.issues.addLabels({
      issue_number: issueNumber,
      owner: owner,
      repo: repo,
      labels: labels,
    });

    this._logger.info("Labels added successfully.");
  }

  /**
   * Remove a Label from a given Issue.
   *
   * @param {string|array} labels - the Label or Labels to remove; must already exist in the Repository configuration
   * @param {int|null} issueNumber - the Issue number to modify (default: `context.issue.number`)
   * @param {string|null} repo - the name of the Repository where the Issue exists (default: `context.repo.repo`)
   * @param {string|null} owner - the name of the Owner or Organization where the Repository exists (default: `context.repo.owner`)
   *
   * @public
   */
  async removeLabels(labels, issueNumber = null, repo = null, owner = null) {
    if (issueNumber === null) {
      issueNumber = this._context.issue.number;
    }

    this._logger.info(`Removing label(s) '${labels.join(", ")} from Issue #${issueNumber}...`);

    if (repo === null) {
      this._logger.debug(`No owner set, using context Repository owner.`);
      repo = this._context.repo.repo;
    }

    if (owner === null) {
      this._logger.debug(`No repository set, using context Repository.`);
      owner = this._context.repo.owner;
    }

    // If the labels provided was a single string, wrap it in an array
    if (typeof labels === "string" || labels instanceof String) {
      labels = [labels];
    }

    // Remove the labels
    this._logger.debug("Calling GitHub remove label API...");

    await this._github.rest.issues.removeLabel({
      issue_number: issueNumber,
      owner: owner,
      repo: repo,
      labels: labels,
    });

    this._logger.info("Labels removed successfully.");
  }
};
