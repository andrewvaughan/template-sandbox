const ActionContext = require("../ActionContext");
const Logger = require("../Logger");

/**
 * OnIssues.
 *
 * @classdesc
 * Action ran when GitHub triggers the `issues` event. The calling workflow must have the `issues: write` permission for
 * this class to work correctly.
 *
 * @see {@link https://docs.github.com/en/webhooks/webhook-events-and-payloads#issues}
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class
 * @extends GitHubContext
 */
module.exports = class OnIssues {

  constructor() {
    this._logger = new Logger("OnIssues");

    this._logger.debug("Checking for `issues:write` permissions...");

    this._logger.info("Testing");

    // TODO
  }

};





// async function (github, context, core, glob, io, exec, fetch) {
//   /**
//    * Remove the `Help Wanted` Label on the issue, if it exists
//    */

//   Logger.startGroup(`Removing 'Help Wanted' Label from Issue #${context.issue.number}.`);

//   Logger.debug("Calling GitHub add label API...");
//   await github.rest.issues.removeLabel({
//     issue_number: context.issue.number,
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     labels: ['Help Wanted'],
//   });

//   Logger.info(`Label 'Help Wanted' removed from Issue #${context.issue.number} successfully.`);
//   Logger.endGroup();

//   /**
//    * If the `Needs Triage` Label is still on the issue, add a warning message telling the user they're assigned to a
//    * non-triaged Issue and Project Maintainers may not accept it for development.
//    */

//   Logger.startGroup(`Checking if 'Needs Triage' Label is still on Issue #${context.issue.number}.`);

//   Logger.debug("Calling GitHub get labels API...");
//   const issue = await github.rest.issues.get({
//     issue_number: context.issue.number,
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//   });

//   Logger.debug(issue.data.labels);

//   await issue.data.labels.forEach(async (label) => {

//     if (label["name"].toLowerCase() == "needs triage") {
//       Logger.warning(
//         `The 'Needs Triage' Label is still on Issue #${context.issue.number}, even though a User was just assigned.`,
//         `User assigned to Issue #${context.issue.number} while in Triage`
//       );

//       Logger.info(`Adding warning comment to Issue #${context.issue.number}...`);

//       await github.rest.issues.createComment({
//         issue_number: context.issue.number,
//         owner: context.repo.owner,
//         repo: context.repo.repo,
//         body: "##  :warning: Warning!\n\n" +
//             "A user was just assigned to this issue while the `Needs Triage` Label is still in place. Please be " +
//             "aware that work on this Issue may not be worthwhile until the Issue has been approved from Triage and " +
//             "enters the `Available for Development` Project status."
//       });
//     }

//   });

//   Logger.endGroup();

//   /**
//    * If the Issue Project status isn't set or one of `Done` or `Parking Lot`, add a warning message to the Issue
//    * informing the user they're working on a dead Project.
//    */

//   Logger.startGroup(`Checking if Issue #${context.issue.number} Project Status is ill-advised for assignment.`);

//   // TODO

//   Logger.endGroup();

//   /**
//    * Clean up.
//    */

//   Logger.startGroup("Cleaning up");

//   Logger.endAllGroups();
// };
