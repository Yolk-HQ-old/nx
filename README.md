# Nx

Extensible Dev Tools for Monorepos.

This is fork of the upstream [nrwl/nx](https://github.com/nrwl/nx), for the purpose of maintaining and using proposed changes to Nx at Yolk before they are accepted by Nrwl.

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up this repo for development.

### Publishing

In order to consume changes from this fork, it's necessary to rename packages in this repo and publish them under our npm scope `@yolkai`.

All packages in this repo have been renamed from `@nrwl/<name>` to `@yolkai/nx-<name>`.

In order to publish packages for consumption by another workspace, use the release script:

```sh
env GITHUB_TOKEN_RELEASE_IT_NX=<access_token> NPM_CONFIG_USERCONFIG=<user_config> yarn nx-release <version> [--dry-run]
```

Where:

- `<access_token>` is a GitHub access token with access to this repository (generate one [here](https://github.com/settings/tokens))
- `<user_config>` is the path to an `.npmrc` file containing an access token with permissions to publish packages under the `@yolkai` npm scope.
- `<version>` is the intended release version.

Use `--dry-run` to perform all of the build steps required for publishing, without actually publishing packages.

For example:

```sh
env GITHUB_TOKEN_RELEASE_IT_NX=415819xxxx npm run nx-release 8.10.0-alpha.0
```

The above command will build all packages, create a GitHub tag and release, then publish all packages to npm.

### Proposing changes to upstream

First make sure you have added the upstream remote:

```sh
git remote add upstream https://github.com/nrwl/nx.git
```

Branch off of `master` and make your changes.

When you're ready to make a pull request, fetch upstream commits, then rebase your feature branch commits onto `upstream/master`:

```sh
git fetch upstream
git rebase --onto upstream/master master
```

This effectively applies _only_ your feature branch commits onto the upstream `master` branch, so that commits like [0cd9c4](https://github.com/Yolk-HQ/nx/commit/0cd9c4fc9f3f58a48793337e5fd1a09be8e1f126) aren't included in a pull request.

Then push your feature branch and make a pull request against [nrwl/nx](https://github.com/nrwl/nx):

https://github.com/nrwl/nx/compare/master...Yolk-HQ:your-feature-branch

### Updating from upstream

Periodically, we need to update this repository with upstream changes:

```sh
# Check out master and make sure it's up to date:
git checkout master
git pull

# Pull in changes from upstream:
git pull upstream master
```
