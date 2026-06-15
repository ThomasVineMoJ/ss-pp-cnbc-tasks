# tsk_webformconfiguration_banner.js

## Purpose

Adds a warning notification on form load to remind users to upload valid JSON (not JSONC) for web form configuration.

## Main Functionality

- Displays a warning notification if the uploaded configuration file is not valid JSON.

## Key Functions

- `showMetadataJsonWarning(executionContext)`: Entry point for form load. Shows the warning notification.

## Integration Notes

- Uses form context and notification APIs.
- Designed for use on forms where web form configuration is uploaded.

## Error Handling

- None required; function only displays a notification.

---
