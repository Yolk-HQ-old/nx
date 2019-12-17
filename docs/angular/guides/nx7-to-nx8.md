# Changes between Nx 7 and Nx 8

If you have used Nx since before version 8, things might seem different now. Prior to Nx 8 our packages were `@yolkai/nx-schematics` and `@yolkai/builders`. These packages were organized by which Angular CLI feature they depended on. `@yolkai/nx-schematics` contained the core of Nx + schematics for all of our features: Angular, React, Node, and Nest. This organization had very little meaning to users and made it impossible to install only capabilities needed for Angular. To solve this, in Nx 8, we have organized our packages by feature.

## Upgrading from Nx 7 to Nx 8

To upgrade from a Nx 7 workspace to a Nx 8 workspace, run:

- `ng update @yolkai/nx-schematics@8.4.8` to update the workspace to the Nx 8 format.
- Commit the results
- `ng update @yolkai/nx-workspace@8.4.8` to update the workspace to 8.4.8.

### Potential Issues

- If you use publishable libraries, running `ng update @yolkai/nx-schematics@8.4.8` will incorrectly update the version of `@angular/compiler-cli` and `@angular/language-service`. Update the versions manually before committing the changes. The issue is due to an incorrect peer dependency in `ng-packagr`, which we cannot fix in Nx.
- The schematics section of `angular.json` might still contain references to `@yolkai/nx-schematics`. Update them to point to appropriate package (e.g., `@yolkai/nx-angular`, `@yolkai/nx-react`, `@yolkai/nx-nest`).

## Where you can find familiar features

Below is a guide for users to find where the familiar features from Nx 7 can be found in Nx 8.

### `create-nx-workspace`

`create-nx-workspace` has not moved and remains in the `create-nx-workspace` package.

### The Nx CLI

The `nx` CLI has been moved to `@yolkai/nx-workspace` which contains most of the core of Nx. It is still called `nx` so it can still be found at `./node_modules/.bin/nx`.

#### `affected`, `format`, `lint`, `dep-graph`

All CLI commands, `affected`, `format`, `lint`, and `dep-graph` have been moved to `@yolkai/nx-workspace` as well. These commands are still run the same way via `yarn affected`, `yarn format`, etc..

### Jest Builder

The builder for running Jest tests has been moved to `@yolkai/nx-jest` which contains all of the Jest capabilities and can be specified as follows:

- `@yolkai/builders:jest` is now `@yolkai/nx-jest:jest`

### Cypress Builder

The builder for running Cypress tests has been moved `@yolkai/nx-cypress` which contains all of the Cypress capabilities and can be specified as follows:

- `@yolkai/builders:cypress` is now `@yolkai/nx-cypress:cypress`

### Angular

#### Schematics

All Angular schematics such as `app`, `lib`, `ngrx`, `downgrade-module`, and `upgrade-module` have been moved to `@yolkai/nx-angular` which contains all of the Angular Capabilities. You can generate these same schematics by specifying `@yolkai/nx-angular` as the collection. For example, use `ng g @yolkai/nx-angular:app` to generate an Angular application. If `@yolkai/nx-angular` is the default collection in the workspace, you can continue using `ng g app`.

#### DataPersistence

DataPersistence has been moved to `@yolkai/nx-angular` as well and can be imported from `@yolkai/nx-angular`.

### React

#### Schematics

All React schematics such as `app` and `lib` have been moved to `@yolkai/nx-react` which contains all of the React capabilities. You can generate these same schematics by specifying `@yolkai/nx-react` as the collection. For example, use `ng g @yolkai/nx-react:app` to generate a React application. If `@yolkai/nx-react` is the default collection in the workspace, you can continue to use `ng g app`.

#### Builders

The builders for building and serving React apps has been moved to `@yolkai/nx-web`. The React builder is no different from the one used to bundle normal web applications so `@yolkai/nx-react` depends on that functionality from `@yolkai/nx-web`. You do not need to add `@yolkai/nx-web` yourself as adding `@yolkai/nx-react` will add it's dependencies for you.

### Web

#### Schematics

All Web schematics such as `app` and `lib` have been moved to `@yolkai/nx-web` which contains all of the Web capabilities. You can generate these same schematics by specifying `@yolkai/nx-web` as the collection. For example, use `ng g @yolkai/nx-web:app` to generate a Web application. If `@yolkai/nx-web` is the default collection in the workspace, you can continue to use `ng g app`.

#### Builders

The builders for building and serving Web apps has been moved to `@yolkai/nx-web` and can be specified as follows:

- `@yolkai/builders:web-build` is now `@yolkai/nx-web:build`
- `@yolkai/builders:web-dev-server` is now `@yolkai/nx-web:dev-server`

### Nest

#### Schematics

All Nest schematics such as `app` have been moved to `@yolkai/nx-nest` which contains all of the Nest capabilities. You can generate these same schematics by specifying `@yolkai/nx-nest` as the collection. For example, use `ng g @yolkai/nx-nest:app` to generate a Nest application. If `@yolkai/nx-nest` is the default collection in the workspace, you can use `ng g app` instead of `ng g node-app`.

#### Builders

The builders for building and serving Nest apps has been moved to `@yolkai/nx-node`. The Nest builder is no different from the one used to bundle normal NodeJS applications so `@yolkai/nx-nest` depends on that functionality from `@yolkai/nx-node`. You do not need to add `@yolkai/nx-node` yourself as adding `@yolkai/nx-nest` will add it's dependencies for you.

### Express

#### Schematics

All Express schematics such as `app` have been moved to `@yolkai/nx-express` which contains all of the Express capabilities. You can generate these same schematics by specifying `@yolkai/nx-express` as the collection. For example, use `ng g @yolkai/nx-express:app` to generate an Express application. If `@yolkai/nx-express` is the default collection in the workspace, you can use `ng g app` instead of `ng g node-app`.

#### Builders

The builders for building and serving Express apps has been moved to `@yolkai/nx-node`. The Express builder is no different from the one used to build normal NodeJS applications so `@yolkai/nx-express` depends on that functionality from `@yolkai/nx-node`. You do not need to add `@yolkai/nx-node` yourself as adding `@yolkai/nx-express` will add it's dependencies for you.

### Node

#### Schematics

All Node schematics such as `app` have been moved to `@yolkai/nx-node` which contains all of the Node capabilities. You can generate these same schematics by specifying `@yolkai/nx-node` as the collection. For example, use `ng g @yolkai/nx-node:app` to generate a Node application. If `@yolkai/nx-node` is the default collection in the workspace, you can use `ng g app` instead of `ng g node-app`.

#### Builders

The builder for building and serving Node apps has been moved to `@yolkai/nx-node` and can be specified as follows:

- `@yolkai/builders:node-build` is now `@yolkai/nx-node:build`
- `@yolkai/builders:node-execute` is now `@yolkai/nx-node:execute`
