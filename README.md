# dependency-report

> Generate usage reports for JavaScript dependencies through an AST.

_Note: only supports ES2015 `import` statements (not CommonJS `require` calls)._

## Install

```
yarn add @sailthru/dependency-report
# or
npm install @sailthru/dependency-report
```

## CLI Usage

### Input

```
$ dependency-report './client/**/*.js' --packages=evergreen-ui --exports=SideSheet
```

### Results

```
[
  [
    {
      "name": "SideSheet",
      "files": 6,
      "filepaths": [
        "./client/components/Customers/Audiences/Audience/Overview/RunOverview/index.js",
        "./client/components/Customers/Destinations/View.js",
        "./client/components/Customers/DestinationSettings.js",
        "./client/components/Destinations/DestinationErrors/ErrorSheet.js",
        "./client/components/WorkspaceSettingsV2/DeletionRequests/RegulationSheet.js",
        "./client/containers/Navigation/UserDropdownApp.js"
      ]
    }
  ]
]
```

### input

```
$ dependency-report './client/**/*.js' --packages=evergreen-ui --exports=SideSheet,Popover,CornerDialog,RadioGroup
```

### Results

```
[
  [
    {
      "name": "SideSheet",
      "files": 6,
      "filepaths": [
        "./client/components/Customers/Audiences/Audience/Overview/RunOverview/index.js",
        "./client/components/Customers/Destinations/View.js",
        "./client/components/Customers/DestinationSettings.js",
        "./client/components/Destinations/DestinationErrors/ErrorSheet.js",
        "./client/components/WorkspaceSettingsV2/DeletionRequests/RegulationSheet.js",
        "./client/containers/Navigation/UserDropdownApp.js"
      ]
    },
    {
      "name": "Popover",
      "files": 2,
      "filepaths": [
        "./client/components/WorkspaceSettingsV2/SuppressedUsers/RemoveButton.js",
        "./client/containers/Navigation/UserDropdownApp.js"
      ]
    },
    {
      "name": "CornerDialog",
      "files": 4,
      "filepaths": [
        "./client/components/GDPRNotification.js",
        "./client/components/NewAgreementNotification.js",
        "./client/components/Sources/SourceDebugger/TestConnectionNotice.js",
        "./client/containers/Sources/SourceSchema/DataGovernanceFeedbackApp.js"
      ]
    },
    {
      "name": "RadioGroup",
      "files": 0,
      "filepaths": []
    }
  ]
]
```

## Usage

```javascript
const DependencyReport = require('@segment/dependency-report')

const report = new DependencyReport({
  files: '**/*.js'
})
```
