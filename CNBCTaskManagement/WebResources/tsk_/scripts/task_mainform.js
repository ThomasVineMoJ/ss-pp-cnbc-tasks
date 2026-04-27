if (typeof GetGlobalContext === "undefined") {
    window.GetGlobalContext = function () {
        return Xrm.Utility.getGlobalContext();
    };
}

var tsk = tsk || {};

console.log("%c tsk.task_mainform - 1.0.0.7", "color:lime; font-weight:bold; background-color:navy; padding: 2px");

tsk.task_mainform = tsk.task_mainform || (function () {

    const EMAIL_ACTION_TYPE = {
        REPLY: 1,
        REPLY_ALL: 2,
        FORWARD: 3
    };

    const SOURCETYPE = {
        MOJ_FORM_SUBMISSION: 957120000,
        EMAIL: 957120001,
        OTHER: 957120002,
        OUTBOUND: 957120003
    };

    /**
     * Helper function to retrieve the Activity Parties (sender, recipients, etc.) of an email
     */
    function getEmailParticipants(emailId) {
        console.log("%c getEmailParticipants STARTED", "color:darkblue; background-color:lightsteelblue; padding: 2px");

        return Xrm.WebApi.retrieveMultipleRecords(
            "activityparty",
            `?$filter=_activityid_value eq ${emailId} and (participationtypemask eq 1 or participationtypemask eq 2 or participationtypemask eq 3 or participationtypemask eq 4)`
        ).then(result => {
            if (result.entities.length === 0) {
                throw new Error("No sender or recipients found for the email.");
            }

            console.log("%c Raw Email Participants:", "color:darkgreen; font-weight:bold;", result.entities);

            let sender = result.entities.find(p => p.participationtypemask === 1);
            let recipientsTo = result.entities.filter(p => p.participationtypemask === 2);
            let recipientsCc = result.entities.filter(p => p.participationtypemask === 3);
            let recipientsBcc = result.entities.filter(p => p.participationtypemask === 4);

            if (!sender) {
                throw new Error("Sender not found.");
            }

            console.log("%c Sender Data:", "color:teal;", sender);
            console.log("%c Recipients To Data:", "color:teal;", recipientsTo);
            console.log("%c Recipients Cc Data:", "color:teal;", recipientsCc);
            console.log("%c Recipients Bcc Data:", "color:teal;", recipientsBcc);

            let senderType = sender["_partyid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
            let senderId = sender["_partyid_value"];
            let senderName = sender["_partyid_value@OData.Community.Display.V1.FormattedValue"] || "Unknown Sender";
            let senderEmail = sender["addressused"] || "Unknown Email";

            function formatRecipients(recipientList) {
                return recipientList.map(r => ({
                    recipientType: r["_partyid_value@Microsoft.Dynamics.CRM.lookuplogicalname"],
                    recipientId: r["_partyid_value"],
                    recipientName: r["_partyid_value@OData.Community.Display.V1.FormattedValue"] || "Unknown Recipient",
                    recipientEmail: r["addressused"] || "Unknown Email"
                }));
            }

            const formattedRecipientsTo = formatRecipients(recipientsTo);
            const formattedRecipientsCc = formatRecipients(recipientsCc);
            const formattedRecipientsBcc = formatRecipients(recipientsBcc);

            console.log("%c Formatted Recipients To:", "color:maroon;", formattedRecipientsTo);
            console.log("%c Formatted Recipients Cc:", "color:maroon;", formattedRecipientsCc);
            console.log("%c Formatted Recipients Bcc:", "color:maroon;", formattedRecipientsBcc);

            return {
                senderType,
                senderId,
                senderName,
                senderEmail,
                recipientsTo: formattedRecipientsTo,
                recipientsCc: formattedRecipientsCc,
                recipientsBcc: formattedRecipientsBcc
            };
        }).catch(error => {
            console.error("%c getEmailParticipants ERROR:", "color:white; background-color:darkred; padding: 2px", error);
            throw error; // Re-throw the error to propagate it to the caller
        });
    }

    /**
     * Helper function to copy attachments from one email to another.
     * - originalEmailId: GUID of the email we are forwarding from.
     * - newEmailId: GUID of the newly created “forward” email.
     */
    function copyAttachments(originalEmailId, newEmailId) {
        console.log("%c copyAttachments STARTED", "color:purple; background-color:lavender; padding: 2px");

        // 1. Retrieve all attachments from the original email
        return Xrm.WebApi.retrieveMultipleRecords(
            "activitymimeattachment",
            `?$select=filename,filesize,mimetype,body,subject&$filter=_objectid_value eq ${originalEmailId}`
        ).then(results => {
            if (!results.entities.length) {
                console.log("%c No attachments found on the original email.", "color:gray;");
                return;
            }

            console.log(`%c Found ${results.entities.length} attachments on original email. Copying...`, "color:darkgreen; font-weight:bold;");

            // 2. For each attachment, create a new activitymimeattachment record referencing the new email
            const createPromises = results.entities.map(attach => {
                let newAttachment = {
                    // Use the relationship “objectid_email” to link the new email
                    "objectid_email@odata.bind": `/emails(${newEmailId})`,

                    "objecttypecode": "email",
                    "filename": attach.filename,
                    "mimetype": attach.mimetype,
                    "body": attach.body,

                    // subject is optional, but we can copy it over if needed
                    "subject": attach.subject || attach.filename
                };

                // Note: The 'filesize' is calculated automatically by CRM/Dataverse once the attachment is created.
                return Xrm.WebApi.createRecord("activitymimeattachment", newAttachment);
            });

            return Promise.all(createPromises)
                .then(() => {
                    console.log("%c All attachments successfully copied to new email.", "color:darkgreen; font-weight:bold;");
                })
                .catch(err => {
                    console.error("Error creating attachments for new email:", err);
                    // We re-throw so it can be caught above if needed
                    throw err;
                });
        });
    }

    function generateMoJFormReply(formContext) {
        console.log("%c[INFO] generateMoJFormReply STARTED", "color: blue; font-weight: bold;");
        Xrm.Utility.showProgressIndicator("Creating reply email...");

        // Retrieve Task ID from the current record.
        let taskId = formContext.data.entity.getId();
        if (!taskId) {
            console.error("No Task ID found!");
            Xrm.Utility.alertDialog("No Task ID found. Please ensure you're on a Task record.");
            Xrm.Utility.closeProgressIndicator();
            return;
        }
        taskId = taskId.replace(/[{}]/g, "");
        console.log("Task ID:", taskId);

        // Retrieve the citizen email from the text field.
        const citizenEmail = formContext.getAttribute("tsk_citizenemail").getValue();
        if (!citizenEmail) {
            console.error("No citizen email provided!");
            Xrm.Utility.alertDialog("No citizen email found on this task.");
            Xrm.Utility.closeProgressIndicator();
            return;
        }

        // Build subject using the citizen email string.
        const subject = "Re: MoJ form for - " + citizenEmail;

        // Set up the email activity party for the "To" field using the citizen email.
        let emailActivityParties = [
            {
                "participationtypemask": 2, // 2 = To
                "addressused": citizenEmail
            }
        ];

        // Create the draft email with the subject, activity parties, and bind it to the task.
        let emailRecord = {
            "subject": subject,
            "email_activity_parties": emailActivityParties,
            "tsk_Task_Email@odata.bind": `/tasks(${taskId})`
        };

        Xrm.WebApi.createRecord("email", emailRecord)
            .then(function(createdRecord) {
                console.log("Draft email created with ID:", createdRecord.id);
                Xrm.Utility.closeProgressIndicator();

                // Open the newly created email in a popup form for editing.
                const pageInput = {
                    pageType: "entityrecord",
                    entityName: "email",
                    entityId: createdRecord.id
                };
                const navigationOptions = {
                    target: 2, // Open in dialog
                    width: { value: 80, unit: "%" },
                    height: { value: 80, unit: "%" }
                };

                return Xrm.Navigation.navigateTo(pageInput, navigationOptions);
            })
            .then(function() {
                console.log("Draft email opened for editing.");
            })
            .catch(function(error) {
                Xrm.Utility.closeProgressIndicator();
                console.error("Error creating draft email:", error);
                Xrm.Utility.alertDialog("An error occurred: " + error.message);
            });
    }

    function onEmailResponseActionLogic(primaryControl, actionType) {
        console.log(`%c onEmailResponseActionClicked(${actionType}) STARTED`, "color:black; background-color:lightyellow; padding: 2px");

        let formContext = primaryControl;

        // Retrieve the source type from the form
        let sourceTypeAttr = formContext.getAttribute("tsk_sourcetype");
        if (sourceTypeAttr) {
            let sourceType = sourceTypeAttr.getValue();
            console.log("%c Source Type:", "color:purple;", sourceType);

            // Check if source type is MoJ Form Submission and action type is REPLY
            if (sourceType === SOURCETYPE.MOJ_FORM_SUBMISSION && actionType === EMAIL_ACTION_TYPE.REPLY) {
                console.log("%c MoJ Form Submission detected with action type REPLY. Entering MoJ branch.", "color:blue; font-weight:bold;");
                generateMoJFormReply(formContext);
                return;
            }
            else {
                console.log("%c Non-MoJ or non-REPLY detected. Proceeding with non-MoJ branch. Source Type:", "color:green;", sourceType, "Action Type:", actionType);
            }
        } else {
            console.error("Attribute 'tsk_sourcetype' not found on the form.");
        }


        Xrm.Utility.showProgressIndicator("Processing your request...");

        const currentUserId = Xrm.Utility.getGlobalContext().userSettings.userId.replace(/[{}]/g, "");
        let originatingEmail = primaryControl.getAttribute("tsk_originatingemail");

        // Retrieve Task ID dynamically
        let taskId = primaryControl.data.entity.getId();
        if (!taskId) {
            console.error("%c No Task ID found!", "color:red; font-weight:bold;");
            Xrm.Utility.alertDialog("No Task ID found. Please make sure you are on a Task record.");
            Xrm.Utility.closeProgressIndicator();
            return;
        }

        // Log Task ID for debugging
        console.log(`%c Task ID: ${taskId}`, "color:blue; font-weight:bold;");
        taskId = taskId.replace(/[{}]/g, "");

        if (!originatingEmail || !originatingEmail.getValue() || !originatingEmail.getValue()[0] || !originatingEmail.getValue()[0].id) {
            console.error("%c No originating email linked!", "color:darkred; font-weight:bold;");
            Xrm.Utility.alertDialog("No originating email linked to this task. Please link an email and try again.");
            Xrm.Utility.closeProgressIndicator();
            return;
        }

        let emailId = originatingEmail.getValue()[0].id.replace(/[{}]/g, "");

        let emailDetailsPromise = Xrm.WebApi.retrieveRecord("email", emailId, "?$select=subject,description,createdon");
        let participantsPromise = getEmailParticipants(emailId);

        Promise.all([emailDetailsPromise, participantsPromise])
            .then(([emailResult, participants]) => {
                console.log("%c Retrieved Email Details:", "color:darkgreen; font-weight:bold;", emailResult);

                const originalSubject = emailResult?.subject || "No Subject";
                const originalBody = emailResult?.description || "";
                const originalReceivedDate = emailResult?.createdon
                    ? new Date(emailResult.createdon).toUTCString()
                    : "Unknown Date";

                // Dynamic recipient display for To field
                const originalRecipientsTo = participants.recipientsTo
                    .map(r => `${r.recipientName} &lt;${r.recipientEmail}&gt;`)
                    .join(", ");

                // Dynamic recipient display for Cc field (if any)
                const originalRecipientsCc = participants.recipientsCc
                    .map(r => `${r.recipientName} &lt;${r.recipientEmail}&gt;`)
                    .join(", ");

                // Construct the recipient display block
                let recipientDisplay = [];
                if (originalRecipientsTo) recipientDisplay.push(`<strong>To:</strong> ${originalRecipientsTo}`);
                if (originalRecipientsCc) recipientDisplay.push(`<strong>Cc:</strong> ${originalRecipientsCc}`);

                // --- MODIFICATION HERE: Added multiple <br> tags before the div#signature ---
                let formattedOriginalMessage = `
                    <br><br><br><div id="signature"></div> <p><br><br><br>------------------- Original Message -------------------</p>
                    <p>
                    <strong>From:</strong> ${participants.senderName} &lt;${participants.senderEmail}&gt;<br>
                    <strong>Received:</strong> ${originalReceivedDate}<br>
                    ${recipientDisplay.length > 0 ? recipientDisplay.join("<br>") + "<br>" : ""}
                    <strong>Subject:</strong> ${originalSubject}
                    </p>
                    <hr><br>
                    <p>${originalBody}</p>`;

                // **Set up email activity parties based on actionType**
                let emailActivityParties = [
                    {
                        "participationtypemask": 1, // From (Sender - Current User)
                        "partyid_systemuser@odata.bind": `/systemusers(${currentUserId})`
                    }
                ];

                // Surgically inserted change: For non-MoJ plain REPLY, set the "To" field with the original sender.
                if (actionType === EMAIL_ACTION_TYPE.REPLY) {
                    console.log("%c Non-MoJ REPLY detected. Adding original sender to the To field.", "color:magenta; font-weight:bold;");
                    emailActivityParties.push({
                        "participationtypemask": 2, // To (Original Sender)
                        [`partyid_${participants.senderType}@odata.bind`]: `/${participants.senderType}s(${participants.senderId})`
                    });
                }

                if (actionType === EMAIL_ACTION_TYPE.REPLY_ALL) {
                    console.log("%c REPLY_ALL detected. Adding recipients accordingly.", "color:magenta; font-weight:bold;");
                    // Get originating queue info from the form
                    const originatingQueue = primaryControl.getAttribute("tsk_originatingqueue")?.getValue();
                    const queueEmail = originatingQueue?.[0]?.emailaddress?.toLowerCase();
                    const queueId = originatingQueue?.[0]?.id?.replace(/[{}]/g, "");

                    // Normalize for case-insensitive comparison
                    const normalizedQueueId = queueId ? queueId.toLowerCase() : null;
                    const normalizedCurrentUserId = currentUserId.toLowerCase();

                    // Add original sender as "To"
                    emailActivityParties.push({
                        participationtypemask: 2,
                        [`partyid_${participants.senderType}@odata.bind`]: `/${participants.senderType}s(${participants.senderId})`
                    });

                    // Merge "To" and "Cc" recipients into one list for processing
                    const allRecipients = [...participants.recipientsTo, ...participants.recipientsCc];

                    // Process each recipient
                    allRecipients.forEach(recipient => {
                        const recipientId = recipient.recipientId.replace(/[{}]/g, "");
                        const recipientEmail = recipient.recipientEmail?.toLowerCase();
                        const normalizedRecipientId = recipientId.toLowerCase();

                        // Skip if current user (case-insensitive check)
                        if (normalizedRecipientId === normalizedCurrentUserId) return;

                        // Skip if recipient matches the originating queue by ID (case-insensitive check)
                        if (normalizedQueueId && recipient.recipientType === "queue" && normalizedRecipientId === normalizedQueueId) return;

                        // Skip if recipient matches the originating queue by email
                        if (queueEmail && recipientEmail === queueEmail) return;

                        // Add valid recipient as CC
                        emailActivityParties.push({
                            participationtypemask: 3,
                            [`partyid_${recipient.recipientType}@odata.bind`]: `/${recipient.recipientType}s(${recipient.recipientId})`
                        });
                    });
                }
                // Forward: no default recipients, but we’ll want to copy attachments
                let replyEmail = {
                    "subject": actionType === EMAIL_ACTION_TYPE.FORWARD ? `Fwd: ${originalSubject}` : `Re: ${originalSubject}`,
                    "description": formattedOriginalMessage,
                    "email_activity_parties": emailActivityParties,
                    "tsk_Task_Email@odata.bind": `/tasks(${taskId})` // Dynamically bind Task ID
                };

                console.log(`%c Creating Draft Email (Type: ${actionType}) with Embedded Activity Parties:`, "color:darkgreen; font-weight:bold;", replyEmail);

                // 1. Create the new (forwarded or replied) email
                return Xrm.WebApi.createRecord("email", replyEmail)
                    .then(createdRecord => {
                        // 2. If Forward, copy the attachments
                        if (actionType === EMAIL_ACTION_TYPE.FORWARD) {
                            return copyAttachments(emailId, createdRecord.id).then(() => createdRecord);
                        }
                        else {
                            // Not forward, just pass through
                            return createdRecord;
                        }
                    });
            })
            .then(replyEmailResult => {
                console.log(`%c Draft Email (Type: ${actionType}) created with ID:`, "color:darkgreen; font-weight:bold;", replyEmailResult.id);

                // Now that attachments are copied (if forward) and the email is created, open it.
                Xrm.Utility.closeProgressIndicator();

                const pageInput = {
                    pageType: "entityrecord",
                    entityName: "email",
                    entityId: replyEmailResult.id
                };

                const navigationOptions = {
                    target: 2,
                    width: { value: 80, unit: "%" },
                    height: { value: 80, unit: "%" }
                };

                return Xrm.Navigation.navigateTo(pageInput, navigationOptions);
            })
            .then(() => {
                console.log(`%c Draft Email (Type: ${actionType}) opened for editing.`, "color:darkgreen; font-weight:bold;");
            })
            .catch(error => {
                Xrm.Utility.closeProgressIndicator();
                console.error(`%c Error in onEmailResponseActionClicked(Type: ${actionType}):`, "color:white; background-color:darkred; padding: 2px", error);
                Xrm.Utility.alertDialog(`An error occurred: ${error.message}`);
            });
    }

    function onLoadLogic(executionContext) {
        var formContext = executionContext.getFormContext();
        var sourceType = formContext.getAttribute("tsk_sourcetype")?.getValue();
        var formIdMOJ= "0534da87-28fd-f011-8407-000d3ad615ba"; // Form Id to navigate to for MoJ Web Form submissions
        var formIdEmail = "16654191-19ad-48ca-9e46-c4b4fbdad76f" // Form Id to navigate to for classic email-created tasks
        var currentFormId = formContext.ui.formSelector.getCurrentItem().getId().toLowerCase();
        var targetFormId = (sourceType === SOURCETYPE.MOJ_FORM_SUBMISSION) ? formIdMOJ : formIdEmail;

        if (targetFormId && currentFormId !== targetFormId.toLowerCase()) {
            var targetForm = formContext.ui.formSelector.items.get(targetFormId);
            if (targetForm) {
                targetForm.navigate();
                return;
            }
        }
    }

    return {
        onEmailResponseActionClicked: function (primaryControl, actionType) {
        onEmailResponseActionLogic(primaryControl, actionType);
        },

        onTaskFileSelected: function (executionContext) {
            console.log("%c *X* onRecordSelected", "color:deeppink; font-weight:bold; background-color:navy; padding: 2px");
            let source = executionContext.getEventSource();
            console.log("source");
            console.log(source);

            let fc = executionContext.getFormContext();

            var selectedPartyId = fc.data.entity.getId();
            console.log("selectedPartyId");
            console.log(selectedPartyId);
            selectedRecordId = selectedPartyId.slice(1, -1);

            var pageInput = {
                pageType: "entityrecord",
                entityName: "tsk_taskfile",
                entityId: fc.data.entity.getId()
            };
            var navigationOptions = {
                target: 2,
                height: {value: 80, unit:"%"},
                width: {value: 70, unit:"%"},
                position: 1
            };
            Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
                function success(result) {
                    // Handle dialog closed
                },
                function error() {
                    // Handle errors
                }
            );
        },

        onLoad: onLoadLogic
    };
})();