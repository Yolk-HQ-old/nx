# dev-server

Serve a Next.js app

Builder properties can be configured in workspace.json when defining the builder, or when invoking it.
Read more about how to use builders and the CLI here: https://nx.dev/web/guides/cli.

## Properties

### baseUrl

Type: `string`

Protocol, hostname, and port on which the application is served.

### buildTarget

Type: `string`

Target which builds the application

### customServerTarget

Type: `string`

Target which builds a custom server

### dev

Default: `true`

Type: `boolean`

Serve the application in the dev mode

### environmentFilePath

Type: `string`

Load environment variables from a file.

### hostname

Type: `string`

Hostname on which the application is served.

### port

Default: `4200`

Type: `number`

Port to listen on.

### quiet

Default: `false`

Type: `boolean`

Hide error messages containing server information.

### skipBuild

Default: `false`

Type: `boolean`

Skip building buildTarget and customServerTarget.
