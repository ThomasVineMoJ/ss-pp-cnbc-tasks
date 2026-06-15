# task_mainform_emails.js

## Purpose

Shows banners and parses expected/received emails for a task, helping users identify if any expected emails are missing based on subject line patterns.

## Main Functionality

- Parses subject lines to determine the expected number of emails.
- Compares received emails to expected count and notifies users if any are missing.
- Displays warnings on the form if emails are missing.

## Key Functions

- `parseExpectedFromSubjects(emails)`: Determines expected email count from subject lines.
- `showBannerIfEmailsMissing()`: Displays a warning if not all expected emails are present.
- `onLoad(executionContext)`: Entry point for form load.

## Integration Notes

- Uses `Xrm.WebApi` to retrieve related emails.
- Designed for use on the Task main form.

## Error Handling

- Alerts users if email retrieval fails.
- Logs errors to the console.

---
