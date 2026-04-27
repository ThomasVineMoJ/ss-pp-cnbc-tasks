
# Role: Service Leader

## Consolidated Entity Privileges

| Entity Name      | Create        | Read          | Write         | Delete        | Append        | AppendTo      | Share         |
|------------------|--------------|--------------|--------------|--------------|--------------|--------------|--------------|
| Activity         | Organization | Organization | Organization |              | Organization | Organization | Organization |
| Contact          | Organization | Organization | Organization |              | Organization | Organization | Organization |
| Note             | Organization | Organization | Organization | Organization | Organization | Organization | Organization |
| Queue            |              | Organization | Organization |              | Organization | Organization | Organization |
| Email Template   | Organization | Organization | Organization | Organization | Organization | Organization | Organization |
| New Process      | Organization | Organization | Organization | Organization | Organization | Organization |              |
| TranslationProcess| Organization| Organization | Organization | Organization | Organization | Organization |              |
| User             |              | Organization |              |              | Organization | Organization |              |
| User Query       | Basic        | Basic        | Basic        | Basic        |              |              | Basic        |
| Workflow         | Basic        | Organization | Basic        | Basic        | Basic        | Organization | Basic        |
| Workflow Session | Basic        | Organization | Basic        | Basic        | Basic        | Basic        | Basic        |
| SharePointData   | Organization | Organization | Organization |              |              |              |              |
| PluginAssembly   |              | Organization |              |              |              |              |              |
| PluginType       |              | Organization |              |              |              |              |              |
| SdkMessage       |              | Organization |              |              |              |              |              |
| SdkMessageProcessingStep |      | Organization |              |              |              |              |              |
| SdkMessageProcessingStepImage | | Organization |              |              |              |              |              |
| tsk_Keyword      | Organization | Organization | Organization | Organization | Organization | Organization | Organization |
| tsk_RoutingRules | Organization | Organization | Organization | Organization | Organization | Organization | Organization |
| tsk_WebFormConfiguration |      | Organization |              |              |              |              |              |
| ...              | ...          | ...          | ...          | ...          | ...          | ...          | ...          |

Empty cells mean the privilege is not granted for that entity/action.
Privilege levels are mapped to UI terms (Organization, User, etc.).
| prvReadAppUserSetting | Organization |
| prvWriteAppUserSetting | Organization |

## Contact
| Privilege Name | Access Level |
|----------------|-------------|
| prvAppendContact | Organization |
| prvAppendToContact | Organization |
| prvAssignContact | Organization |
| prvCreateContact | Organization |
| prvReadContact | Organization |
| prvShareContact | Organization |
| prvWriteContact | Organization |

## Email Template
| Privilege Name | Access Level |
|----------------|-------------|
| prvAppendEmailTemplate | Organization |
| prvAppendToEmailTemplate | Organization |
| prvCreateEmailTemplate | Organization |
| prvDeleteEmailTemplate | Organization |
| prvReadEmailTemplate | Organization |
| prvShareEmailTemplate | Organization |
| prvWriteEmailTemplate | Organization |

## Note
| Privilege Name | Access Level |
|----------------|-------------|
| prvAppendNote | Organization |
| prvAppendToNote | Organization |
| prvAssignNote | Organization |
| prvCreateNote | Organization |
| prvDeleteNote | Organization |
| prvReadNote | Organization |
| prvShareNote | Organization |
| prvWriteNote | Organization |

## Queue
| Privilege Name | Access Level |
|----------------|-------------|
| prvAppendQueue | Organization |
| prvAppendToQueue | Organization |
| prvAssignQueue | Organization |
| prvCreateQueue | Organization |
| prvReadQueue | Organization |
| prvShareQueue | Organization |
| prvWriteQueue | Organization |

## SharePointData
| Privilege Name | Access Level |
|----------------|-------------|
| prvCreateSharePointData | Organization |
| prvReadSharePointData | Organization |
| prvWriteSharePointData | Organization |

## SharePointDocument
| Privilege Name | Access Level |
|----------------|-------------|
| prvReadSharePointDocument | Organization |

## User
| Privilege Name | Access Level |
|----------------|-------------|
| prvAppendToUser | Organization |
| prvReadUser | Organization |

## Workflow
| Privilege Name | Access Level |
|----------------|-------------|
| prvAppendToWorkflow | Organization |
| prvAppendWorkflow | Basic |
| prvAssignWorkflow | Basic |
| prvCreateWorkflow | Basic |
| prvDeleteWorkflow | Basic |
| prvReadWorkflow | Organization |
| prvShareWorkflow | Basic |
| prvWriteWorkflow | Basic |

## Other Entities
Many additional privileges exist for system configuration, templates, routing, and more. See the XML for the full list or request a specific entity breakdown.

## Non-Entity-Specific Privileges

| Privilege Name                      | Access Level     | Description (if known)                       |
|-------------------------------------|------------------|----------------------------------------------|
| prvActivateSynchronousWorkflow      | User             | Activate synchronous workflows               |
| prvDocumentGeneration               | Organization     | Document generation features                 |
| prvExportToExcel                    | Organization     | Export to Excel                              |
| prvFlow                             | Organization     | Run Power Automate flows                     |
| prvPrint                            | Organization     | Print records                                |
| prvReadActionCard                   | Organization     | Read action cards                            |
| prvReadAppConfigMaster              | Organization     | Read app configuration master                |
| prvReadAppModule                    | Organization     | Read app modules                             |
| prvReadAuditSummary                 | Organization     | Read audit summary                           |
| prvReadCustomization                | Organization     | Read system customizations                   |
| prvReadDocumentTemplate             | Organization     | Read document templates                      |
| prvReadOptionSet                    | Organization     | Read option sets                             |
| prvReadOrganization                 | Organization     | Read organization settings                   |
| prvReadPluginTraceLog               | Organization     | Read plugin trace logs                       |
| prvReadQuery                        | Organization     | Read queries                                 |
| prvReadRecordAuditHistory           | Organization     | Read record audit history                    |
| prvReadRelationship                 | Organization     | Read relationships                           |
| prvReadReport                       | User             | Read reports                                 |
| prvReadRole                         | Organization     | Read security roles                          |
| prvReadSavedQueryVisualizations     | Organization     | Read saved query visualizations              |
| prvReadSettingDefinition            | Organization     | Read setting definitions                     |
| prvReadSystemApplicationMetadata    | Organization     | Read system application metadata             |
| prvReadSystemForm                   | Organization     | Read system forms                            |
| prvReadTeam                         | Organization     | Read teams                                   |
| prvReadTraceLog                     | Organization     | Read trace logs                              |
| prvReadTransactionCurrency          | Organization     | Read transaction currencies                  |
| prvShareUserEntityUISettings        | User             | Share user entity UI settings                |
| prvShareUserQuery                   | User             | Share user queries                           |
| prvShareWorkflow                    | User             | Share workflows                              |
| prvShareWorkflowSession             | User             | Share workflow sessions                      |
| prvWorkflowExecution                | Organization     | Execute workflows                            |
| prvPrint                            | Organization     | Print records                                |
| prvExportToExcel                    | Organization     | Export to Excel                              |
| prvFlow                             | Organization     | Run Power Automate flows                     |
| prvDocumentGeneration               | Organization     | Document generation features                 |
| prvReadAppConfigMaster              | Organization     | Read app configuration master                |
| prvReadAuditSummary                 | Organization     | Read audit summary                           |
| prvReadCustomization                | Organization     | Read system customizations                   |
| prvReadDocumentTemplate             | Organization     | Read document templates                      |
| prvReadOptionSet                    | Organization     | Read option sets                             |
| prvReadOrganization                 | Organization     | Read organization settings                   |
| prvReadPluginTraceLog               | Organization     | Read plugin trace logs                       |
| prvReadQuery                        | Organization     | Read queries                                 |
| prvReadRecordAuditHistory           | Organization     | Read record audit history                    |
| prvReadRelationship                 | Organization     | Read relationships                           |
| prvReadReport                       | User             | Read reports                                 |
| prvReadRole                         | Organization     | Read security roles                          |
| prvReadSavedQueryVisualizations     | Organization     | Read saved query visualizations              |
| prvReadSettingDefinition            | Organization     | Read setting definitions                     |
| prvReadSystemApplicationMetadata    | Organization     | Read system application metadata             |
| prvReadSystemForm                   | Organization     | Read system forms                            |
| prvReadTeam                         | Organization     | Read teams                                   |
| prvReadTraceLog                     | Organization     | Read trace logs                              |
| prvReadTransactionCurrency          | Organization     | Read transaction currencies                  |
