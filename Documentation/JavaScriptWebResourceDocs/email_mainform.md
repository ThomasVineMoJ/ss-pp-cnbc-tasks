# email_mainform.js

## Purpose

Handles advanced logic for the Email main form, including attachment size validation, signature injection, queue settings, and error messaging.

## Main Functionality

- Validates total attachment size against an environment variable or default limit.
- Injects the user's default Dataverse email signature into the email body.
- Retrieves and applies queue settings for outbound emails.
- Centralizes error and warning messages for user feedback.

## Key Functions

- `ensureSignatureInjected(formContext)`: Ensures the user's signature is present in the email body.
- `getDefaultDataverseSignatureHtml()`: Retrieves the user's default email signature.
- `getEnvironmentVariableValue(schemaName)`: Fetches environment variable values from Dataverse.
- `setQueue(formContext, queueSettings)`: Applies queue settings to the form.

## Parameters

- `formContext`: The form context for the Email entity.
- `schemaName`: Name of the environment variable to retrieve.

## Integration Notes

- Uses the Dynamics 365 `Xrm.WebApi` and `Xrm.Utility` APIs.
- Integrates with environment variables for configuration.
- Designed for the Email main form in the model-driven app.

## Error Handling

- Provides user-friendly error dialogs and logs technical errors to the console.
- Falls back to default values if environment variables are missing or invalid.

---
