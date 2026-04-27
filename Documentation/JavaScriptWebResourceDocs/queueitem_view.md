# queueitem_view.js

## Purpose

Implements actions for queue items, such as picking, releasing, and routing queue items from views.

## Main Functionality

- Allows users to pick queue items (assign to self), release them, or route them without removal.
- Handles batch operations for multiple queue items.
- Provides confirmation dialogs and progress indicators for user actions.

## Key Functions

- `onPick(control, itemids, itemType)`: Initiates picking of queue items.
- `onRelease(control, itemids, itemType)`: Initiates release of queue items.
- `onRouteNoRemove(control, itemids, itemType)`: Opens a dialog to route queue items without removing them from the queue.

## Parameters

- `control`: The grid or view control.
- `itemids`: Array of queue item IDs.
- `itemType`: Type code for the items (e.g., 2029 for tasks).

## Integration Notes

- Uses `Xrm.WebApi.online.executeMultiple` for batch operations.
- Integrates with custom dialogs and navigation APIs.

## Error Handling

- Shows user dialogs for errors and logs details to the console.
- Handles confirmation and cancellation gracefully.

---
