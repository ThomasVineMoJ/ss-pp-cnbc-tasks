# task_mainform_related.js

## Purpose

Filters and manages the related sub-tasks grid and updates based on changes to the case number or related data.

## Main Functionality

- Filters the related sub-tasks grid based on the case number.
- Updates the grid when the case number changes.
- Handles fetchXml construction and grid refresh.

## Key Functions

- `onLoad(executionContext)`: Entry point for form load.
- `filterRelatedSubTasks()`: Applies filtering logic to the related sub-tasks grid.

## Integration Notes

- Uses form controls and attributes to manage grid state.
- Designed for use on the Task main form.

## Error Handling

- Alerts users if related tasks cannot be retrieved.
- Logs errors to the console.

---
