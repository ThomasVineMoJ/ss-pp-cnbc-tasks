# application_ribbon.js

## Purpose

Provides logic for custom ribbon (command bar) actions, specifically for creating new Email records with preset parameters from the ribbon in Dynamics 365.

## Main Functionality

- Adds a ribbon button action to open a new Email form.
- Sets the `tsk_isinitialoutbound` parameter to `true` when creating the email.
- Handles success and error responses from the form opening action.

## Key Functions

- `createEmail(primaryControl)`: Entry point for the ribbon button. Calls `createEmailLogic`.
- `createEmailLogic(primaryControl)`: Opens a new Email form with preset parameters using `Xrm.Navigation.openForm`.

## Parameters

- `primaryControl`: The form context or control from which the ribbon action is triggered.

## Integration Notes

- Designed to be used as a ribbon command in the model-driven app.
- Relies on the Dynamics 365 `Xrm.Navigation` API.

## Example Usage

A user clicks a custom ribbon button labeled "New Outbound Email". The script opens a new Email form with the `tsk_isinitialoutbound` field set to `true`.

## Error Handling

- Logs errors to the console if the form cannot be opened.

---
