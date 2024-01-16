# 📦 Refit - Dependency Manager

[![npm version](https://img.shields.io/npm/v/refit.svg)](https://www.npmjs.com/package/refit)
[![npm downloads](https://img.shields.io/npm/dm/refit.svg)](https://www.npmjs.com/package/refit)

A CLI tool for reviewing, adding, updating, and viewing the changelog for NPM dependencies.

**🚀 Package Managers:** Works with `npm`, `yarn`, and `pnpm`.

**🔥 Monorepos:** Supports managing dependencies across the entire monorepo or individual workspaces.

**🧙 Wizard:** Provides a step by step interactive wizard for full control over managing your dependencies in your project and monorepo workspaces.

**🛠️ Changelogs:** View the changelog for dependencies before you update them so you never have to leave the terminal.

## Installation

Install globally:

```bash
npm install -g refit
```

Or run with npx:

```bash
npx refit
```

> **Note:** Requires Node.js 18+

## Commands

### List

```bash
refit [options]

```

### Update

```bash
refit update [...dependencies] [options]

```

### Wizard

```bash
refit wizard [options]

```

### Changelogs

```bash
refit changes [options]

```



<!-- 
# 📦 Refit - Dependency Management

[![npm](https://img.shields.io/npm/v/refit.svg)](https://www.npmjs.com/package/refit)
[![npm](https://img.shields.io/npm/dt/refit.svg)](https://www.npmjs.com/package/refit)
![GitHub](https://img.shields.io/github/license/bradennapier/refit.svg)

A dependency management tool for managing, adding, updating, and viewing the changelogs for dependencies in your Node.js project.

**🛠️ Package Managers**: Works with `npm`, `yarn`, and `pnpm`.

**🚀 Monorepo Support**: Manage all the dependencies in your monorepo with ease.

**🔥 Interactive**: Interactively bulk update dependencies or manage them individually in detail.

**📜 Changelogs**: View changelogs for dependencies, even during interactive mode, so you never have to leave your terminal making dependency updates more efficient.

## Install

```bash
npm install -g refit
```

Or run with npx:

```bash
npx refit
```

> Requires Node.js 18+

## Features

### List Dependencies

```bash
refit [options]

# or
refit ls [options]
```

| option               | default | type    | description                                                      |
| -------------------- | ------- | ------- | ---------------------------------------------------------------- |
| --all, -a            | false   | boolean | show all dependencies including up to date ones                  |
| --deprecated         | false   | boolean | allow updating to deprecated versions                            |
| --depTypes, -d       |         | array   | filter by dependency type (choices: `dev`, `prod`, `optional`)   |
| --global, -g         | false   | boolean | check global node modules instead of local ones                  |
| --groupByPackage, -G | false   | boolean | list dependencies grouped by package                             |
| --noIssues, -n       | false   | boolean | hide issues section from list output                             |
| --packageDirs, -P    |         | array   | directories of the monorepo packages                             |
| --packageManager     | npm     | string  | package manager to use                                           |
| --prerelease         | false   | boolean | allow updating to prerelease versions                            |
| --packages, -p       |         | array   | filter by package name                                           |
| --sort, -s           | type    | string  | sort dependencies (choices: `name`, `date`, `type`)              |
| --updateTo, -t       | latest  | string  | update dependencies to semver type (choices: `latest`, `wanted`) |
| --updateTypes, -u    |         | array   | filter by update type (choices: `major`, `minor`, `patch`)       |
| --verbose, -v        | false   | boolean | display all columns of dependency information                    |

### Update Dependencies

```bash
refit update [options]

# or
refit up [options]
```

| option            | default | type    | description                                                      |
| ----------------- | ------- | ------- | ---------------------------------------------------------------- |
| --deprecated      | false   | boolean | allow updating to deprecated versions                            |
| --depTypes, -d    |         | array   | filter by dependency type (choices: `dev`, `prod`, `optional`)   |
| --interactive, -i | false   | boolean | interactively bulk update dependencies                           |
| --packageDirs, -P |         | array   | directories of the monorepo packages                             |
| --packageManager  | npm     | string  | package manager to use                                           |
| --prerelease      | false   | boolean | allow updating to prerelease versions                            |
| --packages, -p    |         | array   | filter by package name                                           |
| --updateTo, -t    | latest  | string  | update dependencies to semver type (choices: `latest`, `wanted`) |
| --updateTypes, -u |         | array   | filter by update type (choices: `major`, `minor`, `patch`)       |

#### Interactive Bulk Update

### Update Wizard

```bash
refit wizard [options]

# or
refit w [options]
```

| option            | default | type    | description                                                    |
| ----------------- | ------- | ------- | -------------------------------------------------------------- |
| --deprecated      | false   | boolean | allow updating to deprecated versions                          |
| --depTypes, -d    |         | array   | filter by dependency type (choices: `dev`, `prod`, `optional`) |
| --packageDirs, -P |         | array   | directories of the monorepo packages                           |
| --packageManager  | npm     | string  | package manager to use                                         |
| --prerelease      | false   | boolean | allow updating to prerelease versions                          |
| --packages, -p    |         | array   | filter by package name                                         |

### Changelog Viewer

```bash
refit changelog [options]
```

| option            | default | type    | description                          |
| ----------------- | ------- | ------- | ------------------------------------ |
| --full, -f        | false   | boolean | show full changelog                  |
| --packageDirs, -P |         | array   | directories of the monorepo packages |
| --packageManager  | npm     | string  | package manager to use               | -->

