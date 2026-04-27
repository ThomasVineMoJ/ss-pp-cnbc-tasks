# task_mainform_notes.js

## Purpose

Displays notifications and updates the Notes tab label if notes have been added to a task by users other than the creator.

## Main Functionality

- Checks for notes added by users other than the task creator.
- Updates the Notes tab label to show the number of notes.
- Displays an info notification if notes are present.

## Key Functions

- `onLoad(executionContext)`: Entry point for form load.
- `showBannerIfNotesAdded()`: Checks for and displays note notifications.

## Integration Notes

- Uses `Xrm.WebApi` to retrieve notes and task data.
- Designed for use on the Task main form.

## Error Handling

- Alerts users if note retrieval fails.
- Logs errors to the console.

---
