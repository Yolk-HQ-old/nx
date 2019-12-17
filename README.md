# Nx

Extensible Dev Tools for Monorepos.

This is fork of the upstream [nrwl/nx](https://github.com/nrwl/nx), for the purpose of maintaining and using proposed changes to Nx at Yolk before they are accepted by Nrwl.

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up this repo for development.

### Publishing

In order to consume changes from this fork, it's necessary to rename packages in this repo and publish them under our npm scope `@yolkai`.

All packages in this repo have been renamed from `@nrwl/<name>` to `@yolkai/nx-<name>`.

In order to publish packages for consumption by [yolksrc](https://github.com/Yolk-HQ/yolksrc) or another workspace, use the release script:

```
env GITHUB_TOKEN_RELEASE_IT_NX=<access_token> NPM_CONFIG_USERCONFIG=<user_config> yarn nx-release <version> [--dry-run]
```

Where:

- `<access_token>` is a GitHub access token with access to this repository (generate one [here](https://github.com/settings/tokens))
- `<user_config>` is the path to an `.npmrc` file containing an access token with permissions to publish packages under the `@yolkai` npm scope.
- `<version>` is the intended release version.

Use `--dry-run` to perform all of the build steps required for publishing, without actually publishing packages.

For example:

```
env GITHUB_TOKEN_RELEASE_IT_NX=415819xxxx NPM_CONFIG_USERCONFIG=$HOME/.npmrc yarn nx-release 8.10.0-alpha.0
```

The above command will build all packages, create a GitHub tag and release, then publish all packages to npm.

### Proposing changes to upstream

TODO

### Updating from upstream

TODO
