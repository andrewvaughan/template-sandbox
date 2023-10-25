const ActionContext = require("../ActionContext");
const Issue = require("../GitHub/Issue");
const Logger = require("../Logger");

/**
 * OnIssues.
 *
 * @classdesc
 * Action ran when GitHub triggers the `issues` event.
 *
 * @see {@link https://github.com/actions/github-script}
 *
 * @author Andrew Vaughan <hello@andrewvaughan.io>
 * @license MIT
 *
 * @class
 */
module.exports = class OnIssues {

  /**
   * Handles the user assigned event for Issues.
   *
   * @public
   * @static
   * @async
   */
  static async handleUserAssigned() {
    const logger = new Logger("OnIssues.handleUserAssigned");

    logger.debug("OnIssues.handleUserAssigned()");

    const issue = new Issue(ActionContext.context.issue.number);

    // Remove the `Help Wanted` Label
    logger.startGroup(`Removing 'Help Wanted' Label from Issue #${issue.number}`);

    let labels = await issue.labels;

    await labels.forEach(async (label) => {
      if (label["name"].toLowerCase() == "help wanted") {
        await issue.removeLabels(label["name"]);
      }
    });

    logger.endGroup();

    // If the `Needs Triage` Label is still on the Issue, comment a warning
    logger.startGroup(`Checking for 'Needs Triage' Label on Issue #${issue.number}`);

    let found = false;

    await labels.forEach(async (label) => {
      if (label["name"].toLowerCase() == "needs triage") {
        found = true;

        logger.warning(
          "Assigning non-triaged issues can be indicative of not following the defined Software Development " +
            "Lifecycle. A warning will be added to the Issue explaining the risk.",
          `Label 'Needs Triage' found on Issue #${issue.number} during user assignment`,
        );

        await issue.addWarning(
          "This Issue is still marked as being in " +
            "[Triage](https://github.com/andrewvaughan/template-core/blob/main/.github/CONTRIBUTING.md#issue-triage) " +
            "- however, a Contributor assignment was just made. Non-triaged issues may not be approved, and any work " +
            "done on unaccepted Issues cannot be guaranteed to be road-mapped.\n\n" +
            "Project Maintainers should Triage this issue or inform the Contributor on whether to move forward.",
        );
      }
    });

    if (!found) {
      logger.notice(
        "Label 'Needs Triage' did not exist on issue during user assignment. This is expected.",
        `Label 'Needs Triage' expectedly missing from Issue #${issue.number}`,
      );
    }

    logger.endGroup();

    // // If the Issue's Project status isn't set, `Done`, or `Parking Lot`, comment a warning
    // this._logger.startGroup(`Checking for valid status on Issue #${issueNumber}`);

    // const status = await Issue.getProjectStatus();
    // const url = await Issue.getProjectController().url;

    // if (!status || ["Done", "Parking Lot"].includes(status)) {
    //   this._logger.warning(
    //     `The status for Issue #${issueNumber} is in Project status '${status}', which is not a part of the Software ` +
    //     "Development Lifecycle where Contributor assignment would be expected. A warning comment will be added to " +
    //     "the Issue explaining this.",
    //     `Issue #${issueNumber} in invalid status for user assignment`
    //   );

    //   await Issue.addWarning(
    //     `This Issue is in the [Project's](${url}) \`${status}\` status, meaning it is not currently planned for ` +
    //     "development. As a Contributor was just assigned to the Issue, please check to make sure that the Project " +
    //     "status is correct. Contributors should check with the Project Maintainers to ensure assignment to this " +
    //     "Issue was done purposefully."
    //   );
    // } else {
    //   this._logger.notice(
    //     "The Issue is currently in a Project status where Contributor assignment would be expected.",
    //     `Issue #${issueNumber} is in expected Project status for Contributor assignment`
    //   );
    // }

    // this._logger.endGroup();
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
