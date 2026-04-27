if (typeof GetGlobalContext === "undefined") {
    window.GetGlobalContext = function () {
        return Xrm.Utility.getGlobalContext();
    };
}

var tsk = tsk || {};

tsk.task_mainform_related = tsk.task_mainform_related || (function () {

    let formContext;

    async function onLoadLogic(executionContext) {
        formContext = executionContext.getFormContext();
        
        var gridContext = formContext.getControl("RelatedTaskSubGrid");
        if(gridContext){
            gridContext.addOnLoad(filterRelatedSubTasks);
        }

        var caseNumberContext = formContext.getAttribute("tsk_casenumber");
        if(caseNumberContext) {
            caseNumberContext.addOnChange(filterRelatedSubTasks);
        }
    }

    return {
        onLoad: onLoadLogic
    };

    function filterRelatedSubTasks() {

        try {
            var gridContext = formContext.getControl("RelatedTaskSubGrid");
            var caseNumber = formContext.getAttribute("tsk_casenumber").getValue();
            var taskId = Xrm.Page.data.entity.getId();

            if (taskId) {
                taskId = taskId.substring(1, taskId.length - 1);
            }

            var fetchXml = 
            "<fetch version='1.0' output-format='xml-platform' mapping='logical' returntotalrecordcount='true' page='1' no-lock='false'>" +
                "<entity name='task'>" +
                    "<filter type='and'>" +
                        "<condition attribute='statecode' operator='not-null'/>" +
                        "<condition attribute='activityid' operator='ne' value='" + taskId + "'/>" +
                        "<condition attribute='tsk_casenumber' operator='ne' value='None'/>" +
                        "<condition attribute='tsk_casenumber' operator='ne' value='Multiple'/>" +
                        "<condition attribute='tsk_casenumber' operator='eq' value='" + caseNumber + "'/>" +
                    "</filter>" +
                "</entity>" +
            "</fetch>"

            gridContext.setFilterXml(fetchXml);
            // remve this event handler so we don't end up in a refresh loop
            gridContext.removeOnLoad(filterRelatedSubTasks);
            gridContext.refresh();
        } catch (error) {
            Xrm.Utility.alertDialog("We could not retrieve related tasks. Use the search bar to manually check for related tasks.");
        }
    }
})();

