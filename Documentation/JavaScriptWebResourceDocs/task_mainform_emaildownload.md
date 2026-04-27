# task_mainform_emaildownload.js

## Purpose

Enables downloading of the most recent sent or received email related to a task as an .eml file.

## Main Functionality

- Retrieves the latest email for a task.
- Fetches the email content and triggers a download as an .eml file.
- Handles errors for missing or inaccessible emails.

## Key Functions

- `onDownload()`: Main entry point for the download action.
- `downloadEmail()`: Fetches and downloads the email as an attachment.

## Integration Notes

- Uses `Xrm.WebApi` to retrieve emails.
- Uses browser APIs to trigger file downloads.
- Designed for use on the Task main form.

## Error Handling

- Alerts users if the email cannot be retrieved or downloaded.
- Cleans up object URLs after download.

---
