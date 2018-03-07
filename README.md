[![Travis](https://img.shields.io/travis/parpeoficial/stackerjs-forklift.svg)](https://travis-ci.org/parpeoficial/stackerjs-forklift)
[![Maintainability](https://api.codeclimate.com/v1/badges/35f0d9b2c8798f66d10a/maintainability)](https://codeclimate.com/github/parpeoficial/stackerjs-forklift/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/35f0d9b2c8798f66d10a/test_coverage)](https://codeclimate.com/github/parpeoficial/stackerjs-forklift/test_coverage)
[![Dependencies](https://img.shields.io/david/parpeoficial/stackerjs-forklift.svg)](https://david-dm.org/parpeoficial/stackerjs-forklift)
[![npm](https://img.shields.io/npm/dt/stackerjs-forklift.svg)](https://www.npmjs.com/package/stackerjs-forklift)


[![NPM](https://nodei.co/npm/stackerjs-forklift.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/stackerjs-forklift)

![StackerJS](https://s3-sa-east-1.amazonaws.com/parpe.prod/StackerJS-logo.png)

# Forklift
Command line manager for [StackerJS](https://github.com/parpeoficial/stackerjs) applications.

## Installation
```bash
npm install -g stackerjs-forklift
```

## Commands

### MVC

#### Controllers
Creating a controller
```bash
forklift mvc:controller:create ExampleController.js
```

Creating typescript controller
```bash
forklift mvc:controller:create ExampleController.ts
```

#### Entities
Creating an Entity
```bash
forklift mvc:entity:create ExampleEntity.js
```

Creating a Typescript Entity
```bash
forklift mvc:entity:create ExampleEntity.ts
```

### DB

#### Migrations
Creating a migration file
```bash
forklift mvc:migrate:create createTableRequirements
# Creates a file at /path/to/project/storage/database/migrations
```

Executing migrations
```bash
forklift mvc:migrate:up
```

Executing rollbacks/downgrades
```bash
forklift mvc:migrate:down
```