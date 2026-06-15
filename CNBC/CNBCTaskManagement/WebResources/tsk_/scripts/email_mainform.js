if (typeof GetGlobalContext === "undefined") {
    window.GetGlobalContext = function () {
        return Xrm.Utility.getGlobalContext();
    };
}

var tsk = tsk || {};

console.log("%c tsk.email_mainform - 1.0.1.17","color:black; font-weight:bold; background-color:pink; padding: 2px");

tsk.email_mainform = tsk.email_mainform || (function () {

    const FORM_TYPE = {
        UNDEFINED: 0,
        CREATE: 1,
        UPDATE: 2,
        READ_ONLY: 3,
        DISABLED: 4,
        BULK_EDIT: 6
    };

    const EMAIL_STATUSCODE = {
        DRAFT: 1,
        COMPLETED: 2,
        SENT: 3,
        RECEIVED: 4,
        CANCELED: 5,
        PENDING_SEND: 6,
        SENDING: 7,
        FAILED: 8
    };

    // --- NEW: Default attachment size limit ---
    const DEFAULT_MAX_ATTACHMENT_SIZE_BYTES = 131072000; // 125 MB in bytes
    const ATTACHMENT_ENV_VAR_SCHEMA_NAME = "tsk_emailtotalattachmentsizelimit"; // All lowercase as per request

    // --- NEW: Centralized Messages ---
    const MESSAGES = {
        ATTACHMENT_LIMIT_TITLE: "Attachment Size Limit",
        ATTACHMENT_LIMIT_TEXT: "The total size of all attachments ({0} MB) exceeds {1} MB. Please remove some files.",
        GENERIC_ERROR_TITLE: "Error",
        GENERIC_ERROR_TEXT: "An unexpected error occurred: {0}",
        QUEUE_SETTINGS_ERROR: "Failed to retrieve or parse queue settings.",
        ATTACHMENT_VAR_ERROR: "Environment variable 'tsk_emailtotalattachmentsizelimitbytes' not found, empty, or invalid. Using default limit."
    };


    let formContext;

    const SIGFIX = {
        MARKER: 'data-tsk-signature="true"',
        PLACEHOLDER: '<div id="signature"></div>'
    };

    async function getDefaultDataverseSignatureHtml() {
        const userId = Xrm.Utility.getGlobalContext().userSettings.userId.replace(/[{}]/g, "");
        console.log(`[SIG-FIX] getDefaultDataverseSignatureHtml | userId=${userId}`);

        const query = `?$select=body,isdefault&$filter=_ownerid_value eq ${userId} and isdefault eq true&$top=1`;

        try {
            const result = await Xrm.WebApi.retrieveMultipleRecords("emailsignature", query);
            let signatureHtml = result.entities?.[0]?.body || "";
            
            console.log("[SIG-FIX] Raw Signature:",signatureHtml);
            
            signatureHtml = signatureHtml
                .replace(/^\s*<!\[CDATA\[/i, "")
                .replace(/\]\]>\s*/i, "")
                .trim();

            console.log(`[SIG-FIX] getDefaultDataverseSignatureHtml | found=${result.entities.length} | length=${signatureHtml.length}`);
            return signatureHtml;
        } catch (error) {
            console.error("[SIG-FIX] getDefaultDataverseSignatureHtml | ERROR", error);
            return "";
        }
    }

    function logEmailBodyState(formContext, stage) {
        try {
            const bodyAttr = formContext.getAttribute("description");
            const body = bodyAttr ? (bodyAttr.getValue() || "") : "";

            console.log(
                `[SIG-FIX] ${stage} | bodyLength=${body.length} | hasPlaceholder=${body.includes(SIGFIX.PLACEHOLDER)} | hasMarker=${body.includes(SIGFIX.MARKER)}`
            );
        } catch (error) {
            console.warn(`[SIG-FIX] ${stage} | Failed to inspect body`, error);
        }
    }

    async function ensureSignatureInjected(formContext) {
        console.log("[SIG-FIX] ensureSignatureInjected | START");
        logEmailBodyState(formContext, "Before injection");

        const bodyAttr = formContext.getAttribute("description");
        if (!bodyAttr) {
            console.warn("[SIG-FIX] ensureSignatureInjected | No description attribute found");
            return;
        }

        let body = bodyAttr.getValue() || "";

        if (body.includes(SIGFIX.MARKER)) {
            console.log("[SIG-FIX] ensureSignatureInjected | Signature already present, skipping");
            return;
        }

        const signatureHtml = await getDefaultDataverseSignatureHtml();
        if (!signatureHtml) {
            console.warn("[SIG-FIX] ensureSignatureInjected | No default Dataverse signature found");
            return;
        }

        const wrappedSignature = `<div ${SIGFIX.MARKER}>${signatureHtml}</div><br><br>`;

        if (body.includes(SIGFIX.PLACEHOLDER)) {
            console.log("[SIG-FIX] ensureSignatureInjected | Placeholder found, replacing");
            body = body.replace(SIGFIX.PLACEHOLDER, wrappedSignature);
        } else if (body.length <= 100) {
            console.log("[SIG-FIX] ensureSignatureInjected | No placeholder found and body is short, prepending");
            body = wrappedSignature + body;
        } else {
            console.log("[SIG-FIX] ensureSignatureInjected | No placeholder found and body already populated, skipping");
            return;
        }

        bodyAttr.setValue(body);

        logEmailBodyState(formContext, "After injection");
        console.log("[SIG-FIX] ensureSignatureInjected | END");
    }

    async function getEnvironmentVariableValue(schemaName) {
        console.log(`%c[getEnvironmentVariableValue] Called for: ${schemaName}`, "color: orange; font-weight: bold;");
        
        var execute_RetrieveEnvironmentVariableValue_Request = {
            DefinitionSchemaName: schemaName,
            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {
                        DefinitionSchemaName: { typeName: "Edm.String", structuralProperty: 1 }
                    },
                    operationType: 1,
                    operationName: "RetrieveEnvironmentVariableValue"
                };
            }
        };

        try {
            const response = await Xrm.WebApi.execute(execute_RetrieveEnvironmentVariableValue_Request);
            if (!response.ok) {
                // If the variable definition is not found or other HTTP error
                console.warn(`%c[WARN] HTTP error retrieving env var ${schemaName}: ${response.status}`, "color: darkorange;");
                return null; // Indicate not found/error
            }
            const responseBody = await response.json();
            const value = responseBody["Value"];

            if (!value) {
                console.warn(`%c[WARN] Environment variable '${schemaName}' found but value is empty.`, "color: darkorange;");
                return null; // Indicate empty value
            }

            console.log(`%c[getEnvironmentVariableValue] Value for ${schemaName}: ${value}`, "color: green;");
            return value;

        } catch (error) {
            console.error(`%c[ERROR - getEnvironmentVariableValue] for ${schemaName}`, "color: red; font-weight: bold;", error);
            return null; // Indicate error
        }
    }

    async function getQueueSettings() {
        // Now using the generic getEnvironmentVariableValue function
        const value = await getEnvironmentVariableValue("tsk_outboundemailqueuesettings");
        if (!value) {
            // Error/empty handled in getEnvironmentVariableValue, just throw for specific message
            throw new Error(MESSAGES.QUEUE_SETTINGS_ERROR);
        }
        return JSON.parse(value);
    }

    async function setQueue(formContext, queueSettings) {
      console.log("%c[setQueue] Calledâ€¦", "color: orange; font-weight:bold;");

      // 1. Get the Task lookup on the form
      const taskLookup = formContext.getAttribute("tsk_task")?.getValue();
      if (!taskLookup?.length) {
        console.warn("%c No Task â†’ defaulting to outbound", "color: orange;");
        formContext.getControl("from").setEntityTypes(["queue"]);
        formContext.getControl("from").setDefaultView("5545f233-bb8b-ef11-ac21-6045bdf3350a"); // Set to the Incoming Queue View (has emails linked)
        return setQueueOnForm(formContext, queueSettings.outbound, false);
      }
      const taskId = taskLookup[0].id.replace(/[{}]/g, "");
      console.log("%c Task ID:", "color: lime;", taskId);

      // 2. Build & log the query
      const query =
        "?$select=_tsk_currentqueue_value" +
        "&$expand=tsk_CurrentQueue_Task(" +
          "$select=queueid,name,_tsk_parentqueueid_value,tsk_replyfromnoreply)";
      try {
        // 3. Fetch the Task + its queue
        const result = await Xrm.WebApi.retrieveRecord("task", taskId, query);
        console.log("%c retrieveRecord returned:", "color: green;font-weight:bold;", result);

        // 4. tsk_CurrentQueue_Task is the expanded Queue object
        const queue = result.tsk_CurrentQueue_Task;
        if (!queue) {
          console.warn("%c No current queue â†’ defaulting to outbound", "color: orange; font-weight:bold;");
          return setQueueOnForm(formContext, queueSettings.outbound);
        }

        // 5. Pick which queue: no-reply? parent? itself?
        let chosen;
        if (queue.tsk_replyfromnoreply) {
          console.log("%c No-Reply flag = true â†’ outbound", "color: magenta; font-weight:bold;");
          chosen = queueSettings.outbound;
        } else if (queue._tsk_parentqueueid_value) {
          console.log("%c Parent queue found â†’ using parent", "color: teal; font-weight:bold;");
          chosen = {
            QueueId: queue._tsk_parentqueueid_value,
            QueueName: queue["_tsk_parentqueueid_value@OData.Community.Display.V1.FormattedValue"]
          };
        } else {
          console.log("%c Using own queue", "color: blue; font-weight:bold;");
          chosen = {
            QueueId: queue.queueid,
            QueueName: queue.name
          };
        }

        console.log("%c Binding From â†’", "color: green; font-weight:bold;", chosen);
        return setQueueOnForm(formContext, chosen);

      } catch (error) {
        console.error("%c Error in setQueue â†’ outbound", "color: red;", error);
        return setQueueOnForm(formContext, queueSettings.outbound);
      }
    }

    async function setQueue2(formContext, queueSettings) {
        console.log("%c[setQueue] Called...", "color: orange; font-weight: bold;");

        let parentActivity = formContext.getAttribute("parentactivityid");
        let parentActivityLookup = parentActivity?.getValue();

        try {
            if (parentActivityLookup) {
                let parentActivityLookupId = parentActivityLookup[0]?.id?.slice(1, -1);
                const result = await Xrm.WebApi.online.retrieveRecord(
                    "email",
                    parentActivityLookupId,
                    "?$select=_acceptingentityid_value,subject"
                );

                let assignedQueue = result["_acceptingentityid_value"];
                let accessibilityQueue = queueSettings["accessibility"];
                let outboundQueue = queueSettings["outbound"];

                // Compare assigned queue to Accessibility queue ID (case-insensitive)
                let queueToUse = (assignedQueue &&
                    assignedQueue.toLowerCase() === accessibilityQueue["QueueId"].toLowerCase())
                        ? accessibilityQueue
                        : outboundQueue;

                await setQueueOnForm(formContext, queueToUse);
            } else {
                // No parent => default to Outbound
                await setQueueOnForm(formContext, queueSettings["outbound"]);
            }
        } catch (error) {
            console.error("%c[ERROR - setQueue]", "color: red; font-weight: bold;", error);
            throw error;
        }
    }

    async function setQueueOnForm(formContext, queue, disableControl = true) {
        console.log("%c[setQueueOnForm] Called...    ", "color:deeppink; font-weight: bold;");
        console.log(queue);
        try {
            var lookupValue = [{
                id: queue["QueueId"],
                name: queue["QueueName"],
                entityType: "queue"
            }];

            // formContext.getAttribute("from").setValue(lookupValue);
            // formContext.getControl("from").setDisabled(disableControl);

            const fromAttr = formContext.getAttribute("from");
            fromAttr.setValue(lookupValue);

            try {
                fromAttr.fireOnChange();
                console.log("[SIG-FIX] setQueueOnForm | from.fireOnChange() fired");
            } catch (error) {
                console.warn("[SIG-FIX] setQueueOnForm | Unable to fire from.onChange", error);
            }

            if (disableControl) {
                setTimeout(() => {
                    try {
                        formContext.getControl("from").setDisabled(true);
                        console.log("[SIG-FIX] setQueueOnForm | from control disabled (delayed)");
                    } catch (error) {
                        console.warn("[SIG-FIX] setQueueOnForm | Failed to disable from control", error);
                    }
                }, 500);
            }

        } catch (error) {
            console.error("%c[ERROR - setQueueOnForm]", "color: red; font-weight: bold;", error);
            throw error;
        }
    }

    async function checkAttachmentSizeOnSave(executionContext) {
        console.log("%c[INFO - onSave] checkAttachmentSizeOnSave", "color: blue; font-weight: bold;");
        const formContext = executionContext.getFormContext();
        const emailId = formContext.data.entity.getId().replace(/[{}]/g, '');

        // Only proceed if emailId is available (i.e., not a new unsaved record)
        if (!emailId) {
            console.warn("%c[WARN] Email ID not available yet. Skipping attachment size check on initial save.", "color: orange;");
            return true; // Allow save to proceed
        }

        // --- NEW: Retrieve max attachment size from env var with fallback ---
        let maxAttachmentSize = DEFAULT_MAX_ATTACHMENT_SIZE_BYTES;
        const envVarValue = await getEnvironmentVariableValue(ATTACHMENT_ENV_VAR_SCHEMA_NAME);

        if (envVarValue) {
            const parsedValue = parseInt(envVarValue, 10);
            if (!isNaN(parsedValue) && parsedValue > 0) {
                maxAttachmentSize = parsedValue;
                console.log(`%c[INFO] Using configured max attachment size: ${maxAttachmentSize} bytes`, "color: green;");
            } else {
                console.warn(`%c[WARN] Parsed value from '${ATTACHMENT_ENV_VAR_SCHEMA_NAME}' is invalid or non-positive (${envVarValue}). Using default.`, "color: darkorange;");
                // The warning is already logged within getEnvironmentVariableValue
            }
        } else {
            console.warn(`%c[WARN] ${MESSAGES.ATTACHMENT_VAR_ERROR}`, "color: darkorange;");
        }


        const query = `?$filter=_objectid_value eq ${emailId}&$select=filesize`;

        try {
            const result = await Xrm.WebApi.retrieveMultipleRecords("activitymimeattachment", query);
            let totalSize = 0;
            result.entities.forEach(att => {
                totalSize += att.filesize || 0;
            });

            const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
            const maxAttachmentSizeMB = (maxAttachmentSize / (1024 * 1024)).toFixed(0);


            if (totalSize > maxAttachmentSize) { 
                const alertStrings = { 
                    confirmButtonLabel: "OK", 
                    text: MESSAGES.ATTACHMENT_LIMIT_TEXT.replace("{0}", totalSizeMB).replace("{1}", maxAttachmentSizeMB),
                    title: MESSAGES.ATTACHMENT_LIMIT_TITLE
                };
                const alertOptions = { height: 160, width: 400 }; 
                Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
                
                return false; // Prevent save
            } else {
                console.log(`%c[INFO] Total attachment size: ${totalSizeMB} MB (within limit of ${maxAttachmentSizeMB} MB).`, "color: green;");
                return true; // Allow save
            }
        } catch (error) {
            console.error("%c[ERROR - checkAttachmentSizeOnSave] Error checking attachments:", "color: red; font-weight: bold;", error);
            // Allow save to proceed if the check itself throws an error, to avoid blocking legitimate saves due to a script issue.
            return true; 
        }
    }

    // Unified onSave Logic
    async function onSaveLogic(executionContext) {
        console.log("%c[INFO - onSave] onSaveLogic started", "color: blue; font-weight: bold;");
        const eventArgs = executionContext.getEventArgs();

        try {
            // **Step 1: Attachment Size Check**
            const attachmentsAllowed = await checkAttachmentSizeOnSave(executionContext);
            if (!attachmentsAllowed) {
                eventArgs.preventDefault(); // Prevent save if attachments are too large
                return; // Stop further save logic
            }

            // **Step 2: Add other on-save functions here**
            // Example:
            // const anotherCheckPassed = await anotherValidationFunction(executionContext);
            // if (!anotherCheckPassed) {
            //     eventArgs.preventDefault();
            //     return;
            // }

        } catch (e) {
            console.error("%c[ERROR - onSaveLogic] An error occurred during save processing:", "color: red; font-weight: bold;", e);
            Xrm.Navigation.openAlertDialog({
                title: MESSAGES.GENERIC_ERROR_TITLE,
                text: MESSAGES.GENERIC_ERROR_TEXT.replace("{0}", e.message || e)
            });
            eventArgs.preventDefault(); // Prevent save if the onSave logic itself breaks unexpectedly
            return;
        }

        console.log("%c[INFO - onSave] All onSave checks passed.", "color: green; font-weight: bold;");
    }

    async function onLoadLogic(executionContext) {
        formContext = executionContext.getFormContext();

        const dirAttr = formContext.getAttribute("directioncode");
        const directioncode = dirAttr ? dirAttr.getValue() : null;
        const directionText = directioncode === null ? "Unknown" : (directioncode ? "Outgoing" : "Incoming");

        console.log(`%c[INFO - onLoad] Email form loading... [directioncode] ${directionText}`, "color: blue; font-weight: bold;");

        try {
            const queueSettings = await getQueueSettings();
            if (queueSettings === null) {
                throw new Error(MESSAGES.QUEUE_SETTINGS_ERROR);
            }

            const formType = formContext.ui.getFormType();
            console.log(`%c[INFO - onLoad] [formType] ${formType}`, "color: blue; font-weight: bold;");

            const isOutbound = formContext.getAttribute("tsk_isinitialoutbound")?.getValue() || false;
            console.log(`[SIG-FIX] onLoad | isOutbound=${isOutbound}`);

            logEmailBodyState(formContext, "onLoad start");

            if (formType === FORM_TYPE.CREATE || (formType === FORM_TYPE.UPDATE && !isOutbound)) {
                await setQueue(formContext, queueSettings);
            }

            // Only update signature if creating a new email or editing a draft
            if (formType === FORM_TYPE.CREATE || formType === FORM_TYPE.UPDATE) {
                await ensureSignatureInjected(formContext);
            }

            setTimeout(() => {
                logEmailBodyState(formContext, "onLoad +1500ms");
            }, 1500);

        } catch (error) {
            console.error("[SIG-FIX] onLoadLogic | ERROR", error);
            Xrm.Navigation.openAlertDialog({
                confirmButtonLabel: "OK",
                text: error.message,
                title: MESSAGES.GENERIC_ERROR_TITLE
            });
        }
    }

    return {
        onLoad: onLoadLogic,
        onSave: onSaveLogic
    };
})();