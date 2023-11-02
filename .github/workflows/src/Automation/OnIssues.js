const ActionContext = require("../ActionContext");
const Issue = require("../GitHub/Issue");
const WorkflowAbstract = require("../WorkflowAbstract");

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
 * @class @extends WorkflowAbstract
 */
module.exports = class OnIssues extends WorkflowAbstract {
  /**
   * Handles the user assigned event for Issues.
   *
   * @public @async
   */
  async handleUserAssigned() {
    this._debugCall("handleUserAssigned", arguments);

    const issue = new Issue(ActionContext.context.issue.number);

    // Remove the `Help Wanted` Label
    this._logger.startGroup(
      "Removing 'Help Wanted' Label from Issue " +
        `${ActionContext.context.repo.owner}/${ActionContext.context.repo.repo} #${issue.number}`,
    );

    //this._logger.info(await issue.title);

    const labels = await issue.labels;
    this._logger.info(await labels[0].name);

    // Should work
    //issue.title = "New title to test";

    // Shouldn't work
    //issue.url = "Read-only baby";

    //const issues = await issue.labels;

    // await labels.forEach(async (label) => {
    //   if (label.name.toLowerCase() == "help wanted") {
    //     return await issue.removeLabels(label);
    //   }
    // });

    this._logger.endGroup();

    // // If the `Needs Triage` Label is still on the Issue, comment a warning
    // logger.startGroup(`Checking for 'Needs Triage' Label on Issue #${issue.number}`);

    // let found = false;

    // await labels.forEach(async (label) => {
    //   if (label["name"].toLowerCase() == "needs triage") {
    //     found = true;

    //     logger.warning(
    //       logger.shrinkWhitespace(
    //         `Assigning non-triaged issues can be indicative of not following the defined Software Development Lifecycle. A
    //       warning will be added to the Issue explaining the risk.`,
    //         `Label 'Needs Triage' found on Issue #${issue.number} during user assignment`,
    //       ),
    //     );

    //     await issue.addWarning(
    //       logger.shrinkWhitespace(`
    //       This Issue is still marked as being in
    //       [Triage](https://github.com/andrewvaughan/template-core/blob/main/.github/CONTRIBUTING.md#issue-triage) -
    //       however, a Contributor assignment was just made. Non-triaged issues may not be approved, and any work done on
    //       unaccepted Issues cannot be guaranteed to be road-mapped.\n
    //       Project Maintainers should Triage this issue or inform the Contributor on whether to move forward.
    //     `),
    //     );
    //   }
    // });

    // if (!found) {
    //   logger.notice(
    //     "Label 'Needs Triage' did not exist on issue during user assignment. This is expected.",
    //     `Label 'Needs Triage' expectedly missing from Issue #${issue.number}`,
    //   );
    // }

    // logger.endGroup();

    // // If the Issue's Project status isn't set, `Done`, or `Parking Lot`, comment a warning
    // logger.startGroup(`Checking for valid status on Issue #${issueNumber}`);

    // const project = await issue.getProject();

    // const status = await project.status;
    // const url = await issue.url;

    // if (!status || ["Done", "Parking Lot"].includes(status)) {
    //   logger.warning(
    //     logger.shrinkWhitespace(
    //       `The status for Issue #${issueNumber} is in Project status '${status}', which is not a part of the Software
    //     Development Lifecycle where Contributor assignment would be expected. A warning comment will be added to the
    //     the Issue explaining this.`,
    //       `Issue #${issueNumber} in invalid status for user assignment`,
    //     ),
    //   );

    //   await issue.addWarning(
    //     issue.shrinkWhitespace(`
    //     This Issue is in the [Project's](${url}) \`${status}\` status, meaning it's not currently planned for
    //     development. As a Contributor was just assigned to the Issue, please check to make sure that the Project status
    //     is correct. Contributors should check with the Project Maintainers to ensure assignment to this Issue was done
    //     purposefully.
    //   `),
    //   );
    // } else {
    //   logger.notice(
    //     "The Issue is currently in a Project status where Contributor assignment would be expected.",
    //     `Issue #${issueNumber} is in expected Project status for Contributor assignment`,
    //   );
    // }

    // logger.endGroup();
  }
};
