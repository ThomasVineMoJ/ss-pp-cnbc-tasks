"use strict";

var tsk = tsk || {};

console.log("%c tsk.routing_rule_form - 1.0.0.1","color:deeppink; font-weight:bold; background-color:navy; padding: 2px");

tsk.routing_rule_form = tsk.routing_rule_form || (function () {

    const RULE_TYPES = {
        WEBFORMREASON: 957120000,
        EMAILKEYWORD: 957120001,
        GLOBALEMAILKEYWORD: 957120002,
    };

    // private helper function that will show hide keyword/conditions section
    function sectionShowHide(executionContext) {
        try {
            var formContext = executionContext.getFormContext();
            var tabObj = formContext.ui.tabs.get("General_tab_main");
            var keywordSectionObj = tabObj.sections.get("Keywords_section");
            var conditionsSectionObj = tabObj.sections.get("Conditions_section");
            var ruleTypeValue = formContext.getAttribute("tsk_ruletype").getValue();

            keywordSectionObj.setVisible(ruleTypeValue === RULE_TYPES.EMAILKEYWORD || ruleTypeValue === RULE_TYPES.GLOBALEMAILKEYWORD);
            conditionsSectionObj.setVisible(ruleTypeValue === RULE_TYPES.WEBFORMREASON);
        } catch (error) {
            // Use Xrm.Navigation.openAlertDialog only once here
            Xrm.Navigation.openAlertDialog({
                confirmButtonLabel: "OK",
                text: error.message,
                title: "Error"
            });
        }

    }

    // Manually overrides height of canvas app embedded on Routing Rule Form
    function setCanvasAppHeight() {
            var style = document.createElement("style");

            style.innerHTML = `
            .Canvas\\.CanvasControl > div {
                height: 400px !important;
            }
            `;
            window.parent.document.head.appendChild(style);
    }

    function clearSourceQueue(executionContext) {
        var formContext = executionContext.getFormContext();
        var createdon = formContext.getAttribute("createdon").getValue();
        if(!createdon) {
            formContext.getAttribute("tsk_destinationqueue").setValue(null);
        }
    }

    // public form onload doesnt matter about the form type in this case
    function onLoadLogic(executionContext) {
        sectionShowHide(executionContext);
        clearSourceQueue(executionContext);
        setCanvasAppHeight();
    }

    // public field onchange for ruletype
    function onChangeRuleTypeLogic(executionContext) {
        sectionShowHide(executionContext);
    }

    // expose public methods
    return {
        onLoad: onLoadLogic,
        onChangeRuleType: onChangeRuleTypeLogic
    }

})();