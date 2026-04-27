# Power Automate Flows in CNBCTaskManagement

## Email-CreateTaskwhenGeneralEmailReceivedAutomated
This flow is triggered when a new general email is received (excluding submissions and emails with no subject). It processes the email, ensures the subject is set (using '(no subject)' if blank), and updates the email status. The flow then converts the email body to plain text, extracts attachment names, and attempts to extract a case number from the subject, body, and attachments. Finally, it creates a new Task record in Dynamics 365, linking it to the originating queue and owner, and relates the email to the created task. This automation ensures that all general email enquiries are tracked as tasks and enriched with relevant metadata for efficient case management.

---

## Email-CreateTaskwhenOutboundEmailCreatedAutomated
This flow triggers when an outbound email is created and not already linked to a task. It creates a new Task record for the outbound email, populating fields such as subject, case number, and recipient email. The flow then links the email and task together, and marks the task as completed. This ensures outbound communications are tracked as tasks and properly related to their originating emails.

---

## Email-MitigateEmailLoop
This scheduled flow runs every minute to detect potential email loops (repeated emails with the same subject and sender within a short time frame). If a loop is detected (based on configurable thresholds), the flow creates a global routing rule and keyword to route future emails matching the pattern to a designated queue for review. This helps prevent system overload and ensures problematic email loops are managed efficiently.

---

## QueueItems-NightlyEmailCleanup
This flow runs nightly and deletes email queue items older than one day. It helps keep the queue clean and ensures that outdated or irrelevant items do not clutter the system, maintaining optimal performance and user focus.

---

## TaskQueueItemAddedModifiedAutomated
This flow triggers when a queue item is added or modified. It updates the related Task record with the correct due date (based on the queue's SLA days), assigns the task to the appropriate owner (either the queue owner or the worker), and updates the current queue reference. This ensures that task ownership, due dates, and queue relationships are always accurate and up to date.

---
