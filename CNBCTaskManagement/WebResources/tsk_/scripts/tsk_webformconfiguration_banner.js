/**
 * Adds a notification on form load reminding users to upload valid JSON (not JSONC).
 * @param {ExecutionContext} executionContext 
 */
function showMetadataJsonWarning(executionContext) {
    var formContext = executionContext.getFormContext();

    var message = "Before uploading the configuration data, please ensure that the Metadata JSON file contains valid JSON. Files in JSONC format (JSON with comments) are not supported.";

    // Unique ID so we can clear or update later
    var notificationId = "metadataJsonWarning";

    formContext.ui.setFormNotification(message, "WARNING", notificationId);
}