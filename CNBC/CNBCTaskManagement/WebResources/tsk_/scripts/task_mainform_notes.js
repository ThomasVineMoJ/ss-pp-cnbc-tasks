if (typeof GetGlobalContext === "undefined") {
    window.GetGlobalContext = function () {
        return Xrm.Utility.getGlobalContext();
    };
}

var tsk = tsk || {};

tsk.task_mainform_notes = tsk.task_mainform_notes || (function () {

    let formContext;

    async function onLoadLogic(executionContext) {
        formContext = executionContext.getFormContext();

        await showBannerIfNotesAdded();
    }

    return {
        onLoad: onLoadLogic
    };

    async function showBannerIfNotesAdded() {
        try{
            var taskId = Xrm.Page.data.entity.getId();

            var taskRecord = await Xrm.WebApi.retrieveRecord("task", taskId, "?$select=_createdby_value");
            var taskCreatorId = taskRecord._createdby_value;

            // Filter for related notes not created by service account
            var notes = await Xrm.WebApi.retrieveMultipleRecords("annotation", `?$select=annotationid&$filter=_objectid_value eq ${taskId} and _createdby_value ne '${taskCreatorId}'`);
            var numberOfNotes = notes?.entities?.length ?? 0;

            if(numberOfNotes > 0) {
                formContext.ui.setFormNotification("This task has notes, check the Notes tab to see them", "INFO", 1);
            }

            var notesTab = formContext.ui.tabs.get("notes_tab");
            if(notesTab && numberOfNotes > 0) {
                notesTab.setLabel(`Notes (${numberOfNotes})`)
            }
        }
        catch(error) {
            Xrm.Utility.alertDialog("We could not check for notes. Please check the Notes tab.");
        }
    }
})();