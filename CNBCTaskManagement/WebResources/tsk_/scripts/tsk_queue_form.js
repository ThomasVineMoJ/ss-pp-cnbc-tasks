if (typeof GetGlobalContext === "undefined") {
    window.GetGlobalContext = function () {
        return Xrm.Utility.getGlobalContext();
    };
}

var tsk = tsk || {};

console.log("%c tsk.queue_form - 1.0.1.77781","color:deeppink; font-weight:bold; background-color:navy; padding: 2px");

tsk.queue_form = tsk.queue_form || (function () {

    const FORM_TYPE = {
        UNDEFINED: 0,
        CREATE: 1,
        UPDATE: 2,
        READ_ONLY: 3,
        DISABLED: 4,
        BULK_EDIT: 6
    };

    let formContext;

    async function onLoadLogic(executionContext) {
        
        formContext = executionContext.getFormContext();

        try {
            let formType = formContext.ui.getFormType();
            console.log("%c[INFO - onLoad] [formType] " + formType, "color: blue; font-weight: bold;");
            if (formType === FORM_TYPE.UPDATE) {
                let tabObj = formContext.ui.tabs.get("general");
                let sectionObj = tabObj.sections.get("QueueMembers");
                let incomingEmailValue = formContext.getAttribute("emailaddress").getValue();
                
                if(incomingEmailValue) {
                    sectionObj.setVisible(false)
                }
            }

        } catch (error) {
            // Use Xrm.Navigation.openAlertDialog only once here
            Xrm.Navigation.openAlertDialog({
                confirmButtonLabel: "OK",
                text: error.message,
                title: "Error"
            });
        }
    }

    return {
        onLoad: onLoadLogic
    };

})();