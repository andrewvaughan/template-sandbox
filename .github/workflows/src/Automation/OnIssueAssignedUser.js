/**
 * Provides utilities for logging to GitHub Actions.
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

const Logger = require("./.github/workflows/src/Logger");

/**
 * TODO
 */
module.exports = async function(github, context, core, glob, io, exec, fetch) {
  /**
   * Remove the `Help Wanted` Label on the issue, if it exists
   */

  Logger.startGroup(`Removing 'Help Wanted' Label from Issue #${context.issue.number}.`);

  Logger.debug('Calling GitHub add label API...');
  // await github.rest.issues.removeLabel({
  //   issue_number: context.issue.number,
  //   owner: context.repo.owner,
  //   repo: context.repo.repo,
  //   labels: ['Help Wanted'],
  // });

  Logger.info(`Label 'Help Wanted' removed from Issue #${context.issue.number} successfully.`);
  Logger.endGroup();

  /**
   * If the `Needs Triage` Label is still on the issue, add a warning message telling the user they're assigned to a
   * non-triaged Issue and Project Maintainers may not accept it for development.
   */

  Logger.startGroup(`Checking if 'Needs Triage' Label is still on Issue #${context.issue.number}.`);

  Logger.debug('Calling GitHub get labels API...')
  let labels = await github.rest.issues.get({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  Logger.info(labels);

  Logger.endGroup();

  /**
   * If the Issue Project status isn't set or one of `Done` or `Parking Lot`, add a warning message to the Issue
   * informing the user they're working on a dead Project.
   */

  Logger.startGroup(`Checking if Issue #${context.issue.number} Project Status is ill-advised for assignment.`);

  // TODO

  Logger.endGroup();

  /**
   * Clean up.
   */

  Logger.startGroup("Cleaning up");

  Logger.endAllGroups();
};
