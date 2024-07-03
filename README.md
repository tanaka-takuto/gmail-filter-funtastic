## Overview

GmailFilterFuntastic is an application that manages Gmail labels and filters via a spreadsheet. It uses OpenAI to automatically suggest labels for incoming emails that don't have labels.

## Features

- Manage Gmail labels and filters via a spreadsheet.
- Utilize OpenAI to suggest labels for unlabeled emails.

## Usage

### Prerequisites

- npm must be available.
- clasp must be available.

### Instructions

1. package install:

```
npm install
```

2. Log in to clasp:

```
clasp login
```

3. Create a new spreadsheet with clasp:

```
clasp create --type sheets --title GmailFilterFuntastic
```

4. Build the project:

```
npm run build
```

5. Deploy the project:

```
npm run deploy
```

6. Run the initialization script in the created AppScript:

```
clasp open
```

Execute the `init` function.

- This will require permissions for Gmail and other services, so grant the necessary permissions.
- This will create a Filter sheet and a Setting sheet.

7. To enable automatic label suggestions by OpenAI, set the API Key in the Setting sheet.

8. Create triggers in AppScript:

- Sync: Recommended to run once a day.
- reflectUnlabeled: Recommended to run once a week to apply OpenAI's suggested labels to unlabeled emails.

## License

MIT
