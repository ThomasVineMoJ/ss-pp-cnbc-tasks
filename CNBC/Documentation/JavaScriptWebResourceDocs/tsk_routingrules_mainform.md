# tsk_routingrules_mainform.js

## Purpose

Manages the Routing Rule form, including showing/hiding sections based on rule type and adjusting the embedded canvas app height.

## Main Functionality

- Shows or hides sections based on the selected rule type.
- Adjusts the height of the embedded canvas app.
- Clears the destination queue if the record is new.

## Key Functions

- `onLoad(executionContext)`: Entry point for form load. Applies section visibility and canvas height logic.
- `onChangeRuleType(executionContext)`: Handles changes to the rule type field.
- `sectionShowHide(executionContext)`: Shows/hides sections based on rule type.
- `setCanvasAppHeight()`: Adjusts the height of the embedded canvas app.
- `clearSourceQueue(executionContext)`: Clears the destination queue if the record is new.

## Integration Notes

- Uses form context and control APIs.
- Designed for use on the Routing Rule form.

## Error Handling

- Alerts users if errors occur during logic execution.
- Logs errors to the console.

---
