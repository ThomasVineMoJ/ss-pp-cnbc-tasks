# Web Form JSON Mapper

This connector processes web‑form submission JSON and automatically enriches each response row by joining it with the metadata from the corresponding component in the form definition. The output includes labels, legends, types, UUIDs, and radio‑button item details.

## Overview

### Scope
Platform: Power Platform (Power Automate / Logic Apps) 

Connector type: Custom Code Connector 

Operations: `EnrichResponses​`

Consumers: `Create Task From Web Form Submission | Automated`

### Prerequisites
- No authentication required
- Must provide `formDefinitionJSON` and `responsesJSON` objects
- Form definition must include _id, _type, labels, legends, and items (for radio fields)

## Actions
### Enrich form response data

Summary: Enrich form response data

Description: Accepts a form definition JSON and an object of response entries, then returns an enriched array combining component metadata into each row.

Operation ID: `EnrichResponses`

#### Inputs

Requires a JSON object containing `formDefinitionJSON` and `responsesJSON`:

```json
{
  "formDefinitionJSON": {
    "_id": "service.base",
    "_type": "service.base",
    "pages": [
      {
        "_id": "page.get-update-how-long-transfer-case-offline",
        "url": "get-update-how-long-transfer-case-offline",
        "_type": "page.multiplequestions",
        "_uuid": "87969497-ba5b-49e3-9ebf-d0d77f15d1bb",
        "heading": "How long it takes to transfer a case",
        "components": [
           {
            "_id": "get-update-how-long-transfer-case-offline_radios_1",
            "hint": "",
            "name": "get-update-how-long-transfer-case-offline_radios_1",
            "_type": "radios",
            "_uuid": "27dd6e1b-f892-457a-8c7b-0879d2e044db",
            "items": [
              {
                "_id": "get-update-how-long-transfer-case-offline_radios_1_item_1",
                "hint": "",
                "name": "get-update-how-long-transfer-case-offline_radios_1",
                "_type": "radio",
                "_uuid": "7ab2c84c-4648-47e0-8cf4-11f92abc546b",
                "label": "Send a message to get an update",
                "value": "value-1",
                "errors": {},
                "legend": "Question",
                "collection": "components",
                "validation": {
                  "required": true
                }
              },
              {
                "_id": "get-update-how-long-transfer-case-offline_radios_1_item_2",
                "hint": "",
                "name": "get-update-how-long-transfer-case-offline_radios_1",
                "_type": "radio",
                "_uuid": "8e832209-0926-4661-a15d-e7235c956c78",
                "label": "Ask a question",
                "value": "value-2",
                "errors": {},
                "legend": "Question",
                "collection": "components",
                "validation": {
                  "required": true
                }
              },
              {
                "_id": "get-update-how-long-transfer-case-offline_radios_1_item_3",
                "hint": "",
                "name": "get-update-how-long-transfer-case-offline_radios_1",
                "_type": "radio",
                "_uuid": "9b90895b-f49b-4bdd-af6e-f64bc03b8781",
                "label": "Exit this contact form",
                "value": "value-3",
                "errors": {},
                "legend": "Question",
                "collection": "components",
                "validation": {
                  "required": true
                }
              }
            ],
            "errors": {},
            "legend": "What do you want to do?",
            "collection": "components",
            "validation": {
              "required": true
            }
          }
        ],
        "add_component": "radios",
        "section_heading": ""
      },
    ],
    "service_name": "Signposting tool "
  },
  "responsesJSON": {
    "submission_id": "ccb86b67-3005-4501-8d72-5d80c6e17347",
    "submission_at": "2026-03-03T15:37:38.000Z",
    "case-reference_radios_1": "A 16 digit reference number",
    "online-offline_radios_1": "Yes",
    "have-hearing-date_radios_1": "Yes, I have a confirmed date for a hearing",
    "helpwith-withdate-offline_radios_1": "Getting an update about my claim",
    "get-update-what-update-offline_radios_1": "Something I have sent or applied for",
    "get-update-what-have-you-sent-offline_radios_1": "A form or application",
    "get-update-which-form-offline_radios_1": "Directions questionnaire (N180 and N181)",
    "get-update-how-long-process-dq-offline_radios_1": "Send a message to get an update",
    "sendmessage-whathelp-offline_textarea_1": "thtrhrththhhhhhtyty",
    "sendmessage-docupload-offline_multiupload_1": "testing.xlsx; testing - Copy.xlsx; testing - Copy - Copy.xlsx",
    "sendmessage-who-offline_radios_1": "Claimant",
    "sendmessage-fullname-offline_text_1": "thomas vine",
    "sendmessage-email-offline_email_1": "Thomas.vine@justice.gov.uk",
    "sendmessage-caseref-offline_text_1": "030320261537",
    "confirmation-email_email_1": "Thomas.vine@justice.gov.uk"
  }
}
```
#### Field Reference
|Name|Type|Required|Description|
|-|-|-|-|
|formDefinitionJSON|object|Yes|Full form definition containing components, labels, legends, types, items, and UUIDs.|
|responsesJSON|object|Yes|Key/value pairs where the key is `component_id` and the value is the submitted response.|

> **Note:** The MoJ Forms team supplies form definition files in **JSONC (JSON with Comments)** format. Power Automate and this connector do **not** support JSONC, so all comments must be removed and the file converted to valid JSON prior to use.

#### Outputs
Returns an array of enriched objects, one entry per response row.

Example output (for 1 question/response):

```json
[
  {
      "component_id": "sendmessage-who-offline_radios_1",
      "component_hint": "",
      "component_name": "sendmessage-who-offline_radios_1",
      "component_type": "radios",
      "component_uuid": "7e87a12c-58e4-4905-9cb2-b9a5c95a22f4",
      "component_legend": "Who are you?",
      "response": "Claimant",
      "sort_order": 1,
      "item_uuid": "723b0776-e436-451f-9970-b0669a14d9a5",
      "item_label": "Claimant"
    }
]
```

#### Field Reference
| Name | Type | Required | Description |
|---|---|---|---|
| component_id | string | Yes | Component identifier from the response payload. |
| component_hint | string | No | Hint text from form definition (if present). |
| component_name | string | No | Internal component name. |
| component_type | string | Yes | Component type (text, radios, textarea, etc.). |
| component_uuid | string | No | Unique identifier of the component. |
| component_legend | string | No | Fieldset legend for grouped controls. |
| component_label | string | No | Display label of the component. |
| item_uuid | string | No | For radio components - the UUID of the selected option. |
| item_label | string | No | For radio components - label of the selected option. |
| response | string | Yes | User‑provided answer, originally from CSV. |
| sort_order | integer | Yes | Order the response appeared in the original submission object. |

#### Custom Code Logic
The enrichment engine performs the following:

- Reads and validates the request body 
- Ensures formDefinitionJSON and responsesJSON are present and are objects 
- Converts responsesJSON into an array of answers, assigning a sort_order 
- Builds a dictionary keyed by component _id from the form definition 
- For each response item:
    - Looks up its matching component 
    - Extracts: 
        - hint 
        - name 
        - type (_type) 
        - UUID (_uuid) 
        - legend 
        - label   
    - For radio components:
        - Finds the matching radio option by comparing its label to the response 
        - Adds item_uuid and item_label     
    - Builds a final enriched array of rows 
    - Returns the array as JSON

## Error Handling

| Status | Reason | Example Error |
|---|---|---|
| 400 | Empty request body | Empty request body. |
| 400 | Invalid JSON | Invalid JSON in request body. |
| 400 | Missing required objects | Missing or invalid input. Provide 'formDefinitionJSON' (object) and 'responsesJSON' (object). |

### Error response shape

```json
{
  "error": "<error message>"
}
```