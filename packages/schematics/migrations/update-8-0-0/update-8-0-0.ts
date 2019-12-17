import {
  chain,
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import { stripIndents } from '@angular-devkit/core/src/utils/literals';
import {
  addDepsToPackageJson,
  formatFiles,
  insert,
  readJsonInTree,
  updateJsonInTree,
  addUpdateTask,
  updateWorkspaceInTree,
  readWorkspace
} from '@yolkai/nx-workspace';
import {
  createSourceFile,
  isImportDeclaration,
  isStringLiteral,
  ScriptTarget
} from 'typescript';
import {
  getSourceNodes,
  ReplaceChange
} from '@yolkai/nx-workspace/src/utils/ast-utils';
import { relative } from 'path';

const ignore = require('ignore');

function addDependencies() {
  return (host: Tree, context: SchematicContext) => {
    const dependencies = readJsonInTree(host, 'package.json').dependencies;
    const builders = new Set<string>();
    const projects = readWorkspace(host).projects;
    Object.values<any>(projects)
      .filter(
        project =>
          typeof project === 'object' && project.hasOwnProperty('architect')
      )
      .forEach(project => {
        Object.values<any>(project.architect).forEach(target => {
          const [builderDependency] = target.builder.split(':');
          builders.add(builderDependency);
        });
      });
    const newDependencies = {};
    const newDevDependencies = {
      '@yolkai/nx-workspace': '8.0.0'
    };
    context.logger.info(`Adding @yolkai/nx-workspace as a dependency`);
    if (dependencies['@angular/core']) {
      newDependencies['@yolkai/nx-angular'] = '8.0.0';
      context.logger.info(`Adding @yolkai/nx-angular as a dependency`);
    }
    if (dependencies['react']) {
      newDevDependencies['@yolkai/nx-react'] = '8.0.0';
      context.logger.info(`Adding @yolkai/nx-react as a dependency`);
    }
    if (dependencies['@nestjs/core']) {
      newDevDependencies['@yolkai/nx-nest'] = '8.0.0';
      context.logger.info(`Adding @yolkai/nx-nest as a dependency`);
    }
    if (dependencies.express) {
      newDevDependencies['@yolkai/nx-express'] = '8.0.0';
      newDevDependencies['@yolkai/nx-node'] = '8.0.0';
      context.logger.info(`Adding @yolkai/nx-express as a dependency`);
    }
    if (builders.has('@yolkai/nx-web')) {
      newDevDependencies['@yolkai/nx-web'] = '8.0.0';
      context.logger.info(`Adding @yolkai/nx-web as a dependency`);
    }
    if (builders.has('@yolkai/nx-node')) {
      newDevDependencies['@yolkai/nx-node'] = '8.0.0';
      context.logger.info(`Adding @yolkai/nx-node as a dependency`);
    }
    if (builders.has('@yolkai/nx-jest')) {
      newDevDependencies['@yolkai/nx-jest'] = '8.0.0';
      context.logger.info(`Adding @yolkai/nx-jest as a dependency`);
    }
    if (builders.has('@yolkai/nx-cypress')) {
      newDevDependencies['@yolkai/nx-cypress'] = '8.0.0';
      context.logger.info(`Adding @yolkai/nx-cypress as a dependency`);
    }
    return chain([addDepsToPackageJson(newDependencies, newDevDependencies)]);
  };
}

const removeOldDependencies = updateJsonInTree(
  'package.json',
  (json, context: SchematicContext) => {
    json.dependencies = json.dependencies || {};
    json.devDependencies = json.devDependencies || {};
    delete json.dependencies['@yolkai/nx'];
    delete json.devDependencies['@yolkai/nx'];
    delete json.dependencies['@yolkai/nx-schematics'];
    delete json.devDependencies['@yolkai/nx-schematics'];
    delete json.dependencies['@yolkai/builders'];
    delete json.devDependencies['@yolkai/builders'];
    context.logger.info(`Removing @yolkai/nx-schematics as a dependency`);
    context.logger.info(`Removing @yolkai/builders as a dependency`);
    context.logger.info(`Removing @yolkai/nx as a dependency`);

    return json;
  }
);

const updateUpdateScript = updateJsonInTree('package.json', json => {
  json.scripts = json.scripts || {};
  json.scripts.update = 'ng update @yolkai/nx-workspace';
  return json;
});

const updateBuilders = updateWorkspaceInTree(json => {
  if (!json.projects) {
    return json;
  }
  Object.entries<any>(json.projects).forEach(([projectKey, project]) => {
    if (!project.architect) {
      return;
    }

    Object.entries<any>(project.architect).forEach(([targetKey, target]) => {
      if (target.builder === '@yolkai/builders:jest') {
        json.projects[projectKey].architect[targetKey].builder =
          '@yolkai/nx-jest:jest';
      }
      if (target.builder === '@yolkai/builders:cypress') {
        json.projects[projectKey].architect[targetKey].builder =
          '@yolkai/nx-cypress:cypress';
      }
      if (target.builder === '@yolkai/builders:web-build') {
        json.projects[projectKey].architect[targetKey].builder =
          '@yolkai/nx-web:build';
      }
      if (target.builder === '@yolkai/builders:web-dev-server') {
        json.projects[projectKey].architect[targetKey].builder =
          '@yolkai/nx-web:dev-server';
      }
      if (target.builder === '@yolkai/builders:node-build') {
        json.projects[projectKey].architect[targetKey].builder =
          '@yolkai/nx-node:build';
      }
      if (target.builder === '@yolkai/builders:node-execute') {
        json.projects[projectKey].architect[targetKey].builder =
          '@yolkai/nx-node:execute';
      }
      if (target.builder === '@yolkai/builders:run-commands') {
        json.projects[projectKey].architect[targetKey].builder =
          '@yolkai/nx-workspace:run-commands';
      }
    });
  });
  return json;
});

const displayInformation = (host: Tree, context: SchematicContext) => {
  context.logger.info(stripIndents`
    Nx has been repackaged. We are installing and migrating your dependencies to the ones necessary.

    If you have workspace schematics, we tried to migrate your imports from "@yolkai/nx-schematics" to "@yolkai/nx-workspace" but your externalSchematics may be broken.
    
    Read this guide to see where to find familiar features: https://nx.dev/guides/nx7-to-nx8
    
    This migration may take a few minutes.
  `);
};

const updateNxModuleImports = (host: Tree) => {
  let ig;

  if (host.exists('.gitignore')) {
    ig = ignore();
    ig.add(host.read('.gitignore').toString());
  }

  host.visit(path => {
    if (!path.endsWith('.ts')) {
      return;
    }

    if (ig && ig.ignores(relative('/', path))) {
      return;
    }

    const sourceFile = createSourceFile(
      path,
      host.read(path).toString(),
      ScriptTarget.Latest,
      true
    );
    const changes = [];
    sourceFile.statements.forEach(statement => {
      if (
        isImportDeclaration(statement) &&
        isStringLiteral(statement.moduleSpecifier)
      ) {
        const nodeText = statement.moduleSpecifier.getText(sourceFile);
        const modulePath = statement.moduleSpecifier
          .getText(sourceFile)
          .substr(1, nodeText.length - 2);
        if (modulePath === '@yolkai/nx') {
          changes.push(
            new ReplaceChange(
              path,
              statement.moduleSpecifier.getStart(sourceFile),
              nodeText,
              `'@yolkai/nx-angular'`
            )
          );
        }

        if (modulePath === '@yolkai/nx/testing') {
          changes.push(
            new ReplaceChange(
              path,
              statement.moduleSpecifier.getStart(sourceFile),
              nodeText,
              `'@yolkai/nx-angular/testing'`
            )
          );
        }

        if (modulePath.startsWith('@yolkai/nx-schematics')) {
          changes.push(
            new ReplaceChange(
              path,
              statement.moduleSpecifier.getStart(sourceFile),
              nodeText,
              nodeText.replace('@yolkai/nx-schematics', '@yolkai/nx-workspace')
            )
          );
        }
      }
    });
    insert(host, path, changes);
  });
};

const updateJestPlugin = (host: Tree) => {
  if (!host.exists('jest.config.js')) {
    return host;
  }

  const sourceFile = createSourceFile(
    'jest.config.js',
    host.read('jest.config.js').toString(),
    ScriptTarget.Latest,
    true
  );
  const changes = [];

  getSourceNodes(sourceFile).forEach(node => {
    if (isStringLiteral(node)) {
      const value = node
        .getText(sourceFile)
        .substr(1, node.getText(sourceFile).length - 2);
      if (value === '@yolkai/builders/plugins/jest/resolver') {
        changes.push(
          new ReplaceChange(
            'jest.config.js',
            node.getStart(sourceFile),
            node.getText(sourceFile),
            `'@yolkai/nx-jest/plugins/resolver'`
          )
        );
      }
    }
  });
  insert(host, 'jest.config.js', changes);
};

const updateTslintRules = updateJsonInTree('tslint.json', json => {
  const { rulesDirectory } = json;
  json.rulesDirectory = rulesDirectory.map(directory => {
    return directory === 'node_modules/@yolkai/nx-schematics/src/tslint'
      ? 'node_modules/@yolkai/nx-workspace/src/tslint'
      : directory;
  });
  return json;
});

const updateDefaultCollection = (host: Tree, context: SchematicContext) => {
  const { dependencies, devDependencies } = readJsonInTree(
    host,
    'package.json'
  );

  return updateWorkspaceInTree(json => {
    json.cli = json.cli || {};
    if (dependencies['@yolkai/nx-angular']) {
      json.cli.defaultCollection = '@yolkai/nx-angular';
    } else if (devDependencies['@yolkai/nx-react']) {
      json.cli.defaultCollection = '@yolkai/nx-react';
    } else if (devDependencies['@yolkai/nx-nest']) {
      json.cli.defaultCollection = '@yolkai/nx-nest';
    } else if (devDependencies['@yolkai/nx-express']) {
      json.cli.defaultCollection = '@yolkai/nx-express';
    } else if (devDependencies['@yolkai/nx-web']) {
      json.cli.defaultCollection = '@yolkai/nx-web';
    } else if (devDependencies['@yolkai/nx-node']) {
      json.cli.defaultCollection = '@yolkai/nx-node';
    } else {
      json.cli.defaultCollection = '@yolkai/nx-workspace';
    }
    context.logger.info(
      `Default collection is now set to ${json.cli.defaultCollection}`
    );
    return json;
  });
};

const setRootDirAndUpdateOurDir = (host: Tree) => {
  let ig;

  if (host.exists('.gitignore')) {
    ig = ignore();
    ig.add(host.read('.gitignore').toString());
  }

  host.visit(path => {
    if (!path.endsWith('.json')) {
      return;
    }

    if (ig && ig.ignores(relative('/', path))) {
      return;
    }

    const json = host.read(path).toString();
    const match = json.match(/"outDir"\s*:\s*"([^"]+)"/);
    if (match) {
      const outParts = match[1].split('out-tsc');
      if (outParts.length > 1) {
        const updatedJson = json.replace(
          /"outDir"\s*:\s*"([^"]+)"/,
          `"outDir": "${outParts[0]}out-tsc"`
        );
        host.overwrite(path, updatedJson);
      }
    }
  });

  updateJsonInTree('tsconfig.json', json => {
    json.compilerOptions = json.compilerOptions || {};
    json.compilerOptions.rootDir = '.';
    return json;
  })(host, null);
};

export const runAngularMigrations: Rule = (
  host: Tree,
  context: SchematicContext
) => {
  const { dependencies } = readJsonInTree(host, 'package.json');

  return chain([
    addUpdateTask('@angular/cli', '8.0.1'),
    ...(dependencies['@angular/core']
      ? [addUpdateTask('@angular/core', '8.0.0')]
      : [])
  ]);
};

const updateNestDependencies = updateJsonInTree('package.json', json => {
  json.dependencies = json.dependencies || {};
  json.devDependencies = json.devDependencies || {};

  if (!json.devDependencies['@yolkai/nx-nest']) {
    return json;
  }

  const nestFrameworkVersion = '^6.2.4';

  json.dependencies = {
    ...json.dependencies,
    '@nestjs/common': nestFrameworkVersion,
    '@nestjs/core': nestFrameworkVersion,
    '@nestjs/platform-express': nestFrameworkVersion,
    'reflect-metadata': '^0.1.12'
  };

  json.devDependencies = {
    ...json.devDependencies,
    '@nestjs/schematics': '^6.3.0',
    '@nestjs/testing': nestFrameworkVersion
  };

  return json;
});

export default function(): Rule {
  return chain([
    displayInformation,
    runAngularMigrations,
    removeOldDependencies,
    updateUpdateScript,
    updateBuilders,
    updateJestPlugin,
    updateNxModuleImports,
    updateTslintRules,
    addDependencies(),
    updateNestDependencies,
    updateDefaultCollection,
    setRootDirAndUpdateOurDir,
    formatFiles()
  ]);
}
