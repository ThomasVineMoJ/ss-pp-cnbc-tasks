var tsk = tsk || {};
tsk.task_mainform_emails = tsk.task_mainform_emails || (function () {
    let formContext;

    function parseExpectedFromSubjects(emails) {
        // Extract the maximum, last number in the related subject lines [x/y] using: (?<=\[\d+/)\d+(?=\])
        const rx = /(?<=\[\d+\/)\d+(?=\])/;
        let maxAdjusted = 0;

        for (const e of emails) {
            const subj = e.subject || "";
            const m = subj.match(rx);
            if (!m) continue;

            const n = Number(m[0]);
            if (!Number.isFinite(n)) continue;

            // Business rule: If 1 returned, then 2 (as 2 emails always recieved per submission), otherwise number of PDF emails + 1 CSV email.
            const adjusted = n === 1 ? 2 : n + 1;
            if (adjusted > maxAdjusted) maxAdjusted = adjusted;
        }
        return maxAdjusted; 
    }

    async function showBannerIfEmailsMissing() {
        try {
            const taskId = formContext.data.entity.getId().replace(/[{}]/g, "");

            // Get related submission emails
            const emailsResult = await Xrm.WebApi.retrieveMultipleRecords(
                "email",
                `?$select=activityid,subject&$filter=_tsk_task_value eq ${taskId} and sender eq 'no-reply-moj-forms@justice.gov.uk'`
            );

            const emails = emailsResult.entities;
            const received = emails.length;

            // Compute expected emails from subjects
            const expected = parseExpectedFromSubjects(emails);

            if (received < expected) {
                const msg =
                    `This task is missing submission emails. Expected: ${expected}, Recieved: ${received}. Please wait for the remaining emails to be ingested, or raise a support ticket if the issue persists.`;
                formContext.ui.setFormNotification(msg, "WARNING", 1);
            }

        } catch (err) {
            console.error(err);
            Xrm.Utility.alertDialog("We could not check for emails. Please check the Emails tab.");
        }
    }

    async function onLoad(executionContext) {
        formContext = executionContext.getFormContext();
        await showBannerIfEmailsMissing();
    }

    return { onLoad };
})();