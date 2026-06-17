# Operational Runbook
The runbook document provides operational guidance for deploying, configuring, and supporting the Task Management base solution, outlining the steps and controls required to deploy the solution downstream, so that it can be customised for new products in the low code platform team.

## Solutions

The project is formed of 6 different Power Platform solutions, all 6 should be imported into the starting development environment before customising the project.

> **Note:** Ribbon Workbench only accepts solutions containing a maximum of 5 entities with no other component types in that solution.

|Name|Purpose|
|-|-|
|Task Management Base|Main store of all core customisations including tables, apps and automations.|
|Task Management Custom Connector| Contains separate, re-usable custom connectors which should be deployed before the base solution.
|Task Management Ribbon Customisations 1|Contains custom command buttons and hide rules for the first 5 entities, edited in Ribbon Workbench.
|Task Management Ribbon Customisations 2|Contains the 6<sup>th</sup>, and final entity, customised in Ribbon Workbench with custom commands and hide rules.| 
|Task Management Global Command Bar|Holds the Application Ribbon component used to customise the global command bar, separate from entity-based command bars.
|[Ribbon Workbench](https://www.develop1.net/public/rwb/ribbonworkbench.aspx) (Managed)| 3<sup>rd</sup> party solution used to administer command bars and application ribbons. Please note Ribbon Workbench is also accessable via XRMToolBox, without needing to install the solution.
|[UltimateWorkflowToolkit](https://github.com/AndrewButenko/UltimateWorkflowToolkit) (Managed)| 3<sup>rd</sup> party solution used in classic workflows to calculate task due date, based on Queue SLA's.
|User Settings Updater (Optional)| 2 utility Power Automate flows to manage user settings in the environment, such as date formatting and language. This can also be achieved using the [User Settings Utility](https://www.xrmtoolbox.com/plugins/MsCrmTools.UserSettingsUtility/) in XRMToolBox.

## Deployment
This section covers the dependencies and steps to import the project into a new development environment.

### Dependencies

#### Dynamics 365 Apps
The main base solution has several dependencies on existing Dynamics 365 products. When creating a new developer environment to customise the solution, it is recommended to check the setting `Install D365 apps`. Alternatively, developers can now install any required dependencies through the solution import wizard.

![Missing dependencies in solution import](./images/install_dependencies.png)

#### Ultimate Workflow Toolkit
The Classic Workflow `Queue Item Sync (Queue)` requires the Ultimate Workflow Toolkit solution, which can be downloaded from the [GitHub Repo](https://github.com/AndrewButenko/UltimateWorkflowToolkit/releases), managed by the creator Andrew butenko.

This solution contains a custom action which allows the calculation of task due date, inside the classic workflow, based on the task creation date + assigned Queue SLA (days).

#### DLP Policies
By default, many MoJ environments block the use of custom connectors and the `HTTP with Entra ID` connector, both of which are required to use the solution. Ensure the accepting environment has a DLP appropriate for the main base solution. A list of connection references can be found below.

#### Dedicated Shared Mailbox
As part of Microsoft's server-side synchronisation feature, only 1 Power Platform environment can be linked to a shared email mailbox at any given time. This means the new development environment must have it's own shared mailbox in order to test and develop features in the development environment. Mailboxes cannot be shared between 2 or more environments.

### Environments
|Name|Type|Purpose|URL|
|-|-|-|-|
|HMCTS-LCPT-TASKS-BASE-DEV|Sandbox|Development|https://hmcts-lcpt-tasks-base-dev.crm11.dynamics.com|

### Environment Variables
All environment variables are included in the core solution `Task Management Base`.

|Name|Description|DEV Value|Notes
|-|-|-|-|
|Auto Allocation Delay Length Before Unassign|For auto allocation, how many minutes should the user be offline for before any tasks get auto unassigned from them. | 2 |  |
|Auto Allocation Related Tasks|Tasks with the same Case Number can be auto allocated.| Yes |  |
|Case Number Pattern|Stores the regular expression (regex) pattern used to identify and extract case reference numbers from email subject lines and message bodies.| \b[a-zA-Z0-9]\d[a-zA-Z0-9]{3}[a-zA-Z0-9]{3}\b | This will always differ depending on the target solution. |
|Email Loop Detection Destination Queue|When an email loop is detected, which queue should the tasks be routed to. This should be the Queue ID.| 04a82b7d-f297-f011-b41b-6045bdd14a24 |  |
|Email Loop Detection Time Span|The number of minutes that should be considered for detection. This number should be negative.| -5 | |
|Email Loop Number Required|The number of emails required in the Time Span to count as an email loop.| 5 | |
|Email Total Attachment Size Limit (Bytes)|The maximum cumulative size (in bytes) allowed for all attachments combined on a single outgoing email. | 5242880 |  |
|Hearing Date Detection|Is automatic hearing date detection is enabled. | No | This is yet to be enabled in any other live solution. |
|Outbound Email Queue Settings| JSON configuration of the default Queue to send emails from. | {  "outbound": {    "QueueName": "CNBC Incoming 2",    "QueueId": "e4c5ff1e-54b1-ef11-b8e9-6045bdfc394d"  },  "accessibility": {    "QueueName": "Accessibility Emails",    "QueueId": "f2b8127d-b7e6-ef11-9342-7c1e5203c47f"  }} | This can only be set once the solution has been imported and both queues have been created in the environment. Edit via default solution. |
### Connection References

|Name|Connector|Purpose|DEV|UAT|PROD|Notes|
|-|-|-|-|-|-|-|
|Dataverse \| ERM|Microsoft Dataverse| Authenticate Cloud Flows to Dataverse|SVC Account|SVC Account|SVC Account||
|HTTP with Microsoft entra ID (preauthorized) \| ERM |HTTP with Microsoft entra ID (preauthorized)|Connect to Microsoft Graph from Cloud Flows| https://graph.microsoft.com| https://graph.microsoft.com|https://graph.microsoft.com| Both Base Resource URL and Microsoft Entra ID Resource URI should be set to https://graph.microsoft.com


```mermaid
flowchart LR
    subgraph DEV["Development"]
        A[Unmanaged Solution<br/>DEV]
    end

    subgraph SCM["Source Control & CI"]
        B[Commit to Git]
        C[GitHub Action<br/>Export Managed Solution]
    end

    subgraph ENVS["Downstream Environments"]
        D[UAT<br/>Managed Solution]
        E[Production<br/>Managed Solution]
    end

    A --> B --> C --> D --> E

    class B,C gitops;
    classDef gitops fill:#E3F2FD,stroke:#1E88E5,stroke-width:2px;
```

This diagram illustrates the end‑to‑end ALM flow for the Power Platform solution, showing how changes are developed and maintained as an unmanaged solution in the DEV environment before being committed to source control. Each commit to the Git repository triggers a GitHub Action responsible for importing an unmanaged solution artifact, which is then deployed consistently (as managed) to downstream environments such as UAT and Production.

### Deployment Steps

## Configuration






## Operational Support
N/A

