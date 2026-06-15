# task_mainform.js

## Purpose

Contains helper functions for the Task main form, including email participant retrieval, attachment copying, and reply/forward logic.

## Main Functionality

- Retrieves sender and recipient details for related emails.
- Copies attachments from one email to another (e.g., when forwarding).
- Generates reply emails with pre-filled data.

## Key Functions

- `getEmailParticipants(emailId)`: Retrieves sender and recipient info for an email.
- `copyAttachments(originalEmailId, newEmailId)`: Copies attachments between emails.
- `generateMoJFormReply(formContext)`: Creates a draft reply email for a task.

## Parameters

- `emailId`: GUID of the email.
- `newEmailId`: GUID of the new email.
- `formContext`: The form context for the Task entity.

## Integration Notes

- Uses `Xrm.WebApi` for data operations.
- Designed for use on the Task main form.

## Error Handling

- Alerts users if required data is missing or errors occur during operations.
- Logs technical errors to the console.

---
