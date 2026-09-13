# WS5 Evaluation Toolkit Logging Prototype Notes

## Purpose

This is a locally testable interaction-logging prototype for the WS5 Evaluation Toolkit. It demonstrates how interface interactions can be recorded with hierarchical event codes while the LAMP server is unavailable.

This is not a production research-data system. It does not create a database, does not transmit logs to a server or third party, and must not be used to collect real participant data.

## Hierarchical Coding Structure

Event codes use broad toolkit areas as the first number and specific interactions as the decimal number.

Example:

- `1` = Micro-surveys
- `1.1` = Survey link selected

Each prototype event is stored locally with:

```json
{
  "userId": "Unknown User",
  "sessionId": "anonymous-session-id",
  "eventCode": "2.2",
  "eventName": "Optional details opened",
  "page": "reflection.html",
  "timestamp": "ISO-8601 timestamp",
  "metadata": {}
}
```

## Full Event-Code Dictionary

| Code | Event name | Prototype status |
| --- | --- | --- |
| 0.1 | Login page viewed | Not implemented: no `login.html` exists in this codebase |
| 0.2 | Mock login completed | Not implemented: no mock login form exists in this codebase |
| 0.3 | Logout selected | Not implemented: no logout control exists in this codebase |
| 1.0 | Micro-surveys page viewed | Implemented on `micro-surveys.html` and legacy `survey.html` |
| 1.1 | Survey link selected | Implemented on micro-survey list items and the current survey external link |
| 1.2 | Micro-survey information area opened | Not implemented: the information area is static, not an openable control |
| 1.3 | Micro-survey navigation control selected | Implemented on survey filters and Record as completed |
| 2.0 | Reflection Space page viewed | Implemented on `reflection.html` |
| 2.1 | Reflection field focused | Implemented once per page load for user focus on the reflection textarea |
| 2.2 | Optional details opened | Implemented on the optional details `<details>` element |
| 2.3 | Theme selected | Implemented on predefined and custom theme selection |
| 2.4 | Intensity selected | Implemented on mouse and keyboard intensity selection |
| 2.5 | Confidence selected | Implemented on confidence selection |
| 2.6 | Reflection submitted | Implemented when Finish & copy to clipboard is selected |
| 3.0 | Best Practices page viewed | Implemented on `best-practices.html` |
| 3.1 | Search performed | Implemented once per non-empty search sequence; search text is not logged |
| 3.2 | Filter selected | Implemented on school filter, sort, tag filters, clear filters, contribution tags, and evidence level |
| 3.3 | Practice card opened | Not implemented: practice cards are displayed directly and do not have an open action |
| 3.4 | Vote selected | Implemented on practice vote buttons |
| 3.5 | Contribution form opened | Implemented when the share-practice panel is opened with the toggle |
| 3.6 | Contribution submitted | Implemented after a valid local Add practice action |
| 4.0 | Dashboard page viewed | Implemented on `dashboard.html` |
| 4.1 | Dashboard filter changed | Retained for future real Unit/Period filters; the current datasets contain neither dimension |
| 4.2 | Comparison control used | Implemented on Compare mode and question comparison selectors |
| 4.3 | Methods and definitions opened | Implemented on status help and Overview, Question Detail, and Compare methodology disclosures |
| 4.4 | Excel export selected | Implemented on Export to Excel |
| 4.5 | Copy to Word selected | Implemented on Copy to Word |
| 4.6 | Reload data selected | Implemented on Reload data |
| 4.7 | Dashboard question detail opened | Implemented when a ranked question View action is selected |
| 4.8 | Dashboard overview returned to | Implemented on Back to overview controls |
| 4.9 | Dashboard qualitative detail opened | Implemented on Explore feedback and View more responses |
| 4.10 | Dashboard full question list opened | Implemented on View all questions |
| 5.1 | Home navigation selected | Implemented for local links to `index.html` |
| 5.2 | Toolkit section navigation selected | Implemented for local links to toolkit section pages |

## Files Created

- `ws5-logger.js`
- `logging-test.html`
- `LOGGING-SYSTEM-NOTES.md`

## Files Modified

- `index.html`
- `micro-surveys.html`
- `reflection.html`
- `best-practices.html`
- `dashboard.html`
- `survey.html`

No Git repository metadata was available in this working folder, so a Git backup/diff could not be created. The modified files are listed above.

## Data Fields Stored

The prototype stores:

- authenticated user ID, or `Unknown User` when no authenticated user exists
- anonymous session ID
- event code
- event name
- current page filename
- ISO timestamp
- safe metadata with non-identifying interface information only

Accepted metadata keys are limited in `ws5-logger.js`, for example:

- `destinationPage`
- `filterCategory`
- `filterType`
- `control`
- `section`
- `exportType`
- `surveyId`
- `selected`
- `state`
- `pageArea`
- `cardId`
- `voteType`

## Data Deliberately Excluded

The logger must not store:

- names
- email addresses
- passwords
- IP addresses
- authentication tokens
- cookies
- session secrets
- email passwords
- raw authentication responses
- reflection text
- survey answers
- contribution text
- search text
- free-text input
- form-field content
- other participant identifiers
- personally identifiable information
- sensitive or special-category data

The implementation logs only the occurrence of approved interface interactions.

## Authenticated User ID

Every new event includes a `userId` field. The value is obtained by the
`getUserId()` function in `ws5-logger.js`, which is the single integration point
for a future University SSO identifier.

The toolkit currently has no stored logged-in user identifier, authentication
object, or mock login page. Therefore, `getUserId()` returns the temporary
placeholder `Unknown User`. If authentication is added later, this function
should first return only the authenticated user's unique identifier; it must
not return or log passwords, tokens, cookies, session secrets, or raw
authentication responses.

Existing stored events that predate this field remain readable. The developer
viewer and both exports display `Unknown User` when an older event has no
`userId`.

## Anonymous Session ID

`ws5-logger.js` generates a random anonymous session ID and stores it in `sessionStorage` under `ws5AnonymousSessionId`.

The same ID is kept while the user navigates between toolkit pages in the same browser session. A new browser session gets a new ID because `sessionStorage` is browser-session scoped. The ID is random and is not derived from names, email addresses, roles, or login values.

The developer testing page also has a button to begin a new anonymous test session manually.

## Prototype Local Storage

Prototype events are stored in `localStorage` under `ws5PrototypeEventLogs`.

This is temporary local prototype storage only. The logger handles missing, invalid, or corrupted localStorage safely by falling back to an empty event array. The toolkit should continue working even if logging fails.

The logger caps stored test events at 1,000 and removes the oldest events first.

## Developer Testing Page

Open:

```text
logging-test.html
```

This page is not linked from participant-facing navigation.

It shows:

- current anonymous session ID
- event count summary
- captured events in a table
- user ID, timestamp, event code, event name, page, and safe metadata

Displayed values are written with `textContent`, not injected as HTML.

## Exporting Test Logs

On `logging-test.html`:

- Use Export JSON to download `ws5-prototype-logs.json`.
- Use Export CSV to download `ws5-prototype-logs.csv`.
- Use Clear prototype logs to remove local prototype logs.
- Use Begin new anonymous test session to generate a new local test session ID.

## Testing Performed

Static/local checks performed:

- Parsed `ws5-logger.js` successfully with Node.
- Parsed inline scripts in `index.html`, `micro-surveys.html`, `reflection.html`, `best-practices.html`, `dashboard.html`, `survey.html`, and `logging-test.html`.
- Confirmed every new event contains `userId`, with `Unknown User` used by the current no-login toolkit.
- Confirmed older events without `userId` remain readable and are shown/exported with the fallback value.
- Confirmed JSON and CSV exports contain `userId`, and the developer viewer includes a User ID column.
- Confirmed the user ID resolver does not read or expose passwords, authentication tokens, cookies, session secrets, email passwords, or raw authentication responses.
- Confirmed logger calls are present only in local files and the logger itself does not use `fetch`, `XMLHttpRequest`, `sendBeacon`, or other network transmission APIs.
- Confirmed `logging-test.html` is excluded from the central local navigation logger and is not linked from normal toolkit navigation.
- Confirmed the corrupted smart quotes around `btnComplete` in `micro-surveys.html` were corrected so the existing completion handler can find the button.
- Simulated corrupted localStorage, duplicate page-view calls, the 1,000-event cap, and unsafe metadata filtering with a Node VM harness.

Recommended manual browser checks:

- Load every page.
- Navigate from home to each toolkit section.
- Select survey list items and filters.
- Use Reflection Space optional details, theme, intensity, confidence, and finish flow.
- Use Best Practices search, filters, vote buttons, contribution panel, and Add practice.
- Use Dashboard dataset, comparison, methods/detail controls, Excel export, Copy to Word, and Reload data.
- Open `logging-test.html` and verify the captured events.
- Confirm JSON export, CSV export, clear logs, and new session controls.
- Corrupt `localStorage.ws5PrototypeEventLogs` manually and reload a toolkit page to confirm the toolkit still runs.

## Known Limitations

- Logs are stored only in the browser where the test occurs.
- Clearing browser storage removes prototype logs.
- `sessionStorage` session boundaries depend on browser behavior.
- Microsoft Forms interactions inside cross-origin iframes cannot be safely instrumented from these local pages.
- The prototype does not include consent, retention, participant withdrawal, researcher access control, audit trails, or server-side validation.
- Search is logged as an occurrence only; the search phrase is intentionally excluded.
- Page views are logged once per actual page load by the page-level logger call.

## Privacy and Ethics Considerations

This localStorage prototype must not be used for real participant data collection. It is suitable only for demonstrating event-code structure and local development behavior.

Before any real deployment, the project must have approved consent language, data minimisation rules, retention rules, access controls, security review, and ethics/privacy approval.

## LAMP Integration Requirements

Future LAMP integration should be server-side and approved before deployment. It should include:

- HTTPS-only submission endpoint
- server-side event schema validation
- allow-listed event codes and metadata keys
- server-generated receipt or event ID
- secure database storage
- access controls and audit logging
- retention and deletion policy
- consent and participant information workflow
- documented data protection review
- monitoring and failure handling

## Proposed Future Server-Side Event Structure

This is a proposed shape only and is not implemented:

```json
{
  "eventId": "server-generated-id",
  "userId": "authenticated-university-identifier",
  "sessionId": "anonymous-session-id",
  "eventCode": "4.4",
  "eventName": "Excel export selected",
  "page": "dashboard.html",
  "timestampClient": "ISO-8601 timestamp",
  "timestampServer": "ISO-8601 timestamp",
  "metadata": {
    "exportType": "excel"
  },
  "toolkitVersion": "approved-release-id"
}
```

Server-side storage, retention, consent, and access controls must be approved before deployment.
