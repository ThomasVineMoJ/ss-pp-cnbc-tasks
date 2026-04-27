if (typeof GetGlobalContext === "undefined") {
    window.GetGlobalContext = function () {
        return Xrm.Utility.getGlobalContext();
    };
}

var tsk = tsk || {};
console.log("%c tsk.application_ribbon - 1.0.0.1", "color:darkgreen; font-weight:bold; background-color:lightgray; padding: 2px");

tsk.application_ribbon = tsk.application_ribbon || (function () {
    
    function createEmailLogic(primaryControl) {
        console.log(`%c onEmailResponseActionLogic STARTED`, "color:black; background-color:lightyellow; padding: 2px");
        var entityFormOptions = {
            entityName: "email"
        };
        var formParameters = {
            "tsk_isinitialoutbound": "true"
        };
        Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
            function success(result) {
                console.log("Opened new Email form:", result);
            },
            function error(err) {
                console.warn("Error opening new Email form:", err);
            }
        );      
    }
    return {
        createEmail: function (primaryControl) {
            createEmailLogic(primaryControl);
        }
    };
})();
