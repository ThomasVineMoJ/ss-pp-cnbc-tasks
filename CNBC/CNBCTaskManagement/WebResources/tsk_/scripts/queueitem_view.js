"use strict";

if (typeof GetGlobalContext === "undefined") {
    window.GetGlobalContext = function () {
        return Xrm.Utility.getGlobalContext();
    };
}
console.log("%c tsk.queueitem_view - 1.0.1.w6", "color:lime; font-weight:bold; background-color:navy; padding: 2px");

var tsk = tsk || {};

tsk.queueitem_view = tsk.queueitem_view || (function () {

    return {
        onPick: function (control, itemids, itemType) {
            pickQueueItem(control, itemids, itemType);
        },
        onRelease: function (control, itemids, itemType) {
            releaseQueueItems(control, itemids, itemType);
        },
        onRouteNoRemove: function (control, itemids, itemType) {
            openRouteDialogNoRemove(control, itemids, itemType);
        }
    };

    async function pickQueueItem(control, itemids, itemType) {
        //TODO Check this!
        if (itemType != 2029) {
            // Not a task
            return;
        }

        if (itemids.length === 0) {
            return;
        }

        try {
            Xrm.Utility.showProgressIndicator("Processing");

            // Get current user id and remove brackets from it
            var userId = GetGlobalContext().userSettings.userId;
            var userIdFormatted = userId.substring(1, userId.length - 1).toLowerCase();
            const requests = [];

            for (let index = 0; index < itemids.length; index++) {
                const element = itemids[index];

                // Build queueitem pick request
                var executePickFromQueueRequest = {
                    entity: { entityType: "queueitem", id: element.Id }, // entity
                    SystemUser: { entityType: "systemuser", id: userIdFormatted }, // mscrm.systemuser
                    RemoveQueueItem: false, // Edm.Boolean

                    getMetadata: function () {
                        return {
                            boundParameter: "entity",
                            parameterTypes: {
                                entity: { typeName: "mscrm.queueitem", structuralProperty: 5 },
                                SystemUser: { typeName: "mscrm.systemuser", structuralProperty: 5 },
                                RemoveQueueItem: { typeName: "Edm.Boolean", structuralProperty: 1 }
                            },
                            operationType: 0, operationName: "PickFromQueue"
                        };
                    }
                };
                requests.push(executePickFromQueueRequest);

                // Are we at the maximum number of request for a batch?
                if (requests.length === 1000) {
                    await Xrm.WebApi.online.executeMultiple(requests);
                    requests.length = 0;
                }
            }

            // If we didn't happen to have exactly 1000 queue items to pick,
            // there should be something here
            if (requests.length > 0) {
                await Xrm.WebApi.online.executeMultiple(requests);
            }
        }
        catch (error) {
            console.log(error.message);
            Xrm.Utility.alertDialog("An error occurred: " + error.message);
        }
        finally {
            Xrm.Utility.closeProgressIndicator();
            control.refresh();
        }
    }

    async function releaseQueueItems(control, itemids, itemType) {


        // Log parameters
        console.log("--- releaseQueueItems trace ---");
        console.log("Parameter control:", control);
        console.log("Parameter itemids:", itemids);
        console.log("Parameter itemType:", itemType);
        console.log("-------------------------------");

        if (!itemids || itemids.length === 0) { // Added a check for null/undefined itemids as well
            console.log("releaseQueueItems: No itemids provided, exiting.");
            return;
        }

        const confirmDialogOptions = {
            title: "Release Queue Item",
            text: "Do you want to release the selected item?\nThe Item(s) will be assigned back to Queue owner for other members to pick up.",
            confirmButtonLabel: "Release",
            cancelButtonLabel: "Cancel"
        };

        try {
            const dialogResult = await Xrm.Navigation.openConfirmDialog(confirmDialogOptions);

            if (dialogResult.confirmed) {
                // User clicked "Release"
                try {
                    Xrm.Utility.showProgressIndicator("Releasing");

                    const requests = [];
                    for (let index = 0; index < itemids.length; index++) {
                        const element = itemids[index];

                        // Build queueitem release request
                        var executeReleaseToQueueRequest = {
                            entity: { entityType: "queueitem", id: element },
                            getMetadata: function () {
                                return {
                                    boundParameter: "entity",
                                    parameterTypes: {
                                        entity: { typeName: "mscrm.queueitem", structuralProperty: 5 }
                                    },
                                    operationType: 0,
                                    operationName: "ReleaseToQueue"
                                };
                            }
                        };
                        requests.push(executeReleaseToQueueRequest);

                        // Batch
                        if (requests.length === 1000) {
                            await Xrm.WebApi.online.executeMultiple(requests);
                            requests.length = 0;
                        }
                    }

                    if (requests.length > 0) {
                        await Xrm.WebApi.online.executeMultiple(requests);
                    }
                } catch (processingError) {
                    console.log("Error during release processing: " + processingError.message);
                    Xrm.Utility.alertDialog("An error occurred during release: " + processingError.message);
                } finally {
                    Xrm.Utility.closeProgressIndicator();
                    control.refresh();
                }
            } else {
                // User clicked "Cancel" or closed the dialog
                // No action taken for release.
                console.log("Release operation cancelled by user.");
            }
        } catch (dialogError) {
            // Error opening the confirmation dialog itself
            console.log("Error opening confirmation dialog: " + dialogError.message);
            Xrm.Utility.alertDialog("An error occurred with the confirmation dialog: " + dialogError.message);
        }
    }

   async function openRouteDialogNoRemove(control, itemids, itemType) {
        if (itemType && itemType != 2029) return;
        if (!itemids || itemids.length === 0) return;

        const idsArr = itemids
            .map(i => i.Id || i)
            .filter(Boolean)
            .map(x => x.replace("{", "").replace("}", "").toLowerCase());

        const idsCsv = idsArr.join(",");

        const pageInput = {
            pageType: "custom",
            name: "tsk_routequeueditem_38004",
            entityName: "queueitem",
            recordId: idsCsv          
        };

        const navOptions = {
            target: 2, position: 1,
            width: { value: 500, unit: "px" },
            height: { value: 400, unit: "px" },
            title: "Route Queued Item"
        };

        try {
            //Refresh grid after dialog closes
            await Xrm.Navigation.navigateTo(pageInput, navOptions).then(
                function () {
                    try {
                        control.refresh();     // Always refresh grid after dialog closes
                    } catch (e) {
                        console.log("Grid refresh failed:", e.message);
                    }
                },
                function (error) {
                    console.log("Dialog error:", error);
                }
            );


        } catch (e) {
            console.log("Error: " + e.message);
            Xrm.Utility.alertDialog("Error: " + e.message);
        }
    }

})();