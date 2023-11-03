const ActionContext = require("../ActionContext");
const Constants = require("../Constants");
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

    // // Remove the `Help Wanted` Label
    // this._eCore.startGroup(
    //   "Removing 'Help Wanted' Label from Issue " +
    //     `${ActionContext.context.repo.owner}/${ActionContext.context.repo.repo} #${issue.number}`,
    // );

    // await issue.removeLabels([
    //   "Help Wanted",
    // ]);

    // this._eCore.info("`Help Wanted` Label removed.");
    // this._eCore.endGroup();

    // // If the `Needs Triage` Label is still on the Issue, comment a warning
    // this._eCore.startGroup(`Checking for 'Needs Triage' Label on Issue #${issue.number}`);

    // const labels = await issue.labels;
    // let found = false;

    // await labels.forEach(async (label) => {
    //   if (label.name.toLowerCase() == "needs triage") {
    //     found = true;

    //     this._eCore.warning(
    //       this._eCore.shrinkWhitespace(`
    //         Assigning non-triaged issues can be indicative of not following the defined Software Development Lifecycle.
    //         This runner is adding a warning to the Issue to explain the risk.
    //       `),
    //       `Label 'Needs Triage' found on Issue #${issue.number} during user assignment`,
    //     );

    //     return await issue.addWarning(
    //       this._eCore.shrinkWhitespace(`
    //         A Contributor assignment was just made, however, this Issue is still marked as being in
    //         [Triage](${Constants.URL.CONTRIBUTING}#issue-triage). Issued marked as needing triage can't undergo
    //         approval. There is no responsibility for Project Maintainers to accept any work performed on non-triaged
    //         issues.

    //         A Project Maintainer needs to triage this issue or inform the Contributor on whether to halt progress.

    //         - [ ] @andrewvaughan to resolve the triage for this Issue
    //       `)
    //     );
    //   }
    // });

    // if (!found) {
    //   this._eCore.notice(
    //     "Label 'Needs Triage' didn't exist on issue during user assignment, as expected.",
    //     `Label 'Needs Triage' expectedly missing from Issue #${issue.number}`,
    //   );
    // }

    // this._eCore.endGroup();

    // If the Issue's Project status isn't set, `Done`, or `Parking Lot`, comment a warning
    this._eCore.startGroup(`Checking for valid Project status on Issue #${await issue.number}`);

    // const projItems = await issue.projectItems;

    // if (projItems.length <= 0) {
    //   await issue.addError(
    //     issue.shrinkWhitespace(`
    //       This Issue isn't part of an ongoing Project, but a Project Maintainer has assigned it to a Contributor. This
    //       goes against the Software Development Lifecycle and Contributing Guidelines. A Project Maintainer needs to add
    //       this Issue to the appropriate Project and give it the appropriate status.

    //       - [ ] @andrewvaughan to resolve missing Project
    //     `),
    //   );

    //   const msg = "No Project associated with this Issue for automated status management.";
    //   this._eCore.error(msg);
    //   throw new Error(msg);
    // }

    // if (projItems.length >= 2) {
    //   await issue.addError(
    //     issue.shrinkWhitespace(`
    //       This Issue is currently assigned to multiple projects. This prevents automation utilities from functioning on
    //       this Issue. A Project Maintainer needs to resolve the duplicative Project assignment for this Issue.

    //       - [ ] @andrewvaughan to resolve duplicative projects
    //     `),
    //   );

    //   const msg = "This Issue has multiple Projects associated with it, preventing automation.";
    //   this._eCore.error(msg);
    //   throw new Error(msg);
    // }

    // const item = projItems[0];

    // this._eCore.info("ITEM:");
    // this._eCore.info(item);

    // const fields = await item.fieldValues;

    // this._eCore.info("FIELDS:");
    // this._eCore.debug(fields);

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

    this._eCore.endGroup();
  }
};
