# JavaScript Web Resources in CNBCTaskManagement

## application_ribbon.js
Provides logic for ribbon (command bar) actions, such as opening a new Email form with specific parameters. Used to support custom ribbon buttons and actions in the application.

---

## email_mainform.js
Handles logic for the Email main form, including attachment size validation, default signature handling, and error messaging. It manages form behaviors, user messages, and integrates with environment variables for configuration.

---

## queueitem_view.js
Implements actions for queue items, such as picking, releasing, and routing queue items. Provides functions for custom buttons in queue item views, enabling users to manage work items directly from the list.

---

## task_mainform.js
Contains helper functions for the Task main form, including retrieving email participants (sender, recipients), and supporting actions like reply, reply all, and forward. It helps display and process related email data for tasks.

---

## task_mainform_emaildownload.js
Enables downloading of the most recent sent or received email related to a task as an .eml file. It retrieves the email, fetches its content, and triggers a download for the user, with error handling for missing or inaccessible emails.

---

## task_mainform_emails.js
Shows banners and parses expected/received emails for a task, helping users identify if any expected emails are missing based on subject line patterns.

---

## task_mainform_notes.js
Displays notifications and updates the Notes tab label if notes have been added to a task by users other than the creator. Helps users quickly see if there are important notes to review.

---

## task_mainform_related.js
Filters and manages the related sub-tasks grid and updates based on changes to the case number or related data. Ensures users see only relevant related tasks.

---

## tsk_queue_form.js
Handles logic for the Queue form, including showing/hiding sections based on form type and email address presence. Improves user experience by dynamically adjusting the form layout.

---

## tsk_routingrules_mainform.js
Manages the Routing Rule form, including showing/hiding sections based on rule type and adjusting the embedded canvas app height. Provides error handling and UI adjustments for routing rule configuration.

---

## tsk_webformconfiguration_banner.js
Adds a warning notification on form load to remind users to upload valid JSON (not JSONC) for web form configuration. Ensures users are aware of the correct file format requirements.

---
