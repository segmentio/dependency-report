# dependency-report

> Generate usage reports for JavaScript dependencies through an AST.

_Note: only supports ES2015 `import` statements (not CommonJS `require` calls)._

## Install

```
yarn add @segment/dependency-report
# or
npm install @segment/dependency-report
```

## Usage

```javascript
const DependencyReport = require('dependency-report')

const report = new DependencyReport({
  files: '**/*.js'
})
```
