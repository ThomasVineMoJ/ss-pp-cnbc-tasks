"use strict";

if (typeof GetGlobalContext === "undefined") {
    window.GetGlobalContext = function () {
        return Xrm.Utility.getGlobalContext();
    };
}

var tsk = tsk || {};

tsk.task_mainform_emaildownload = tsk.task_mainform_emaildownload || (function () {

    return {
        onDownload: downloadEmail
    };

    async function downloadEmail() {

        let objectUrl = null;

        try {
            const taskId = Xrm.Page.data.entity.getId();
            // Get the most recent sent or received email
            const email = await Xrm.WebApi.retrieveMultipleRecords("email", `?$select=activityid,subject&$expand=tsk_Task_Email($select=activityid)&$filter=(Microsoft.Dynamics.CRM.In(PropertyName='statuscode',PropertyValues=['2','3','4'])) and (tsk_Task_Email/activityid eq ${taskId})&$orderby=createdon desc&$top=1`);

            if ((email?.entities?.length ?? 0) == 0) {
                Xrm.Utility.alertDialog("We could not retrieve the email to download. Check that emails are available on the Emails tab.");
                return;
            }

            const emailRecord = email.entities[0];
            const response = await fetch(GetGlobalContext().getClientUrl() + "/api/data/v9.2/_Downloademailasattachment", {
                method: "POST",
                headers: {
                    "OData-MaxVersion": "4.0",
                    "OData-Version": "4.0",
                    "Content-Type": "application/json; charset=utf-8",
                    "Accept": "application/json"
                },
                body: `{"emailIdToBeDownloaded":"{${emailRecord.activityid}}"}`
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            const content = atob(json.emailRecordData);
            const file = new Blob([content], { type: 'message/rfc822' });
            const objectUrl = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${emailRecord.subject}.eml`;
            link.click();
        }
        catch (error) {
            Xrm.Utility.alertDialog("An error occured whilst downloading the email. Please refresh the page and try again.");
        }
        finally {
            if(objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        }
    }
})();

