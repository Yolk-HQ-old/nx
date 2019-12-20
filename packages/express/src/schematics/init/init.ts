import { Rule, chain } from '@angular-devkit/schematics';
import {
  addDepsToPackageJson,
  updateJsonInTree,
  addPackageWithInit,
  updateWorkspace,
  formatFiles
} from '@yolkai/nx-workspace';
import { Schema } from './schema';
import {
  expressTypingsVersion,
  expressVersion,
  nxVersion
} from '../../utils/versions';
import { JsonObject } from '@angular-devkit/core';

function addDependencies(): Rule {
  return addDepsToPackageJson(
    {
      express: expressVersion
    },
    {
      '@types/express': expressTypingsVersion,
      '@yolkai/nx-express': nxVersion
    }
  );
}

function moveDependency(): Rule {
  return updateJsonInTree('package.json', json => {
    json.dependencies = json.dependencies || {};

    delete json.dependencies['@yolkai/nx-express'];
    return json;
  });
}

function setDefault(): Rule {
  return updateWorkspace(workspace => {
    workspace.extensions.cli = workspace.extensions.cli || {};

    const defaultCollection: string =
      workspace.extensions.cli &&
      ((workspace.extensions.cli as JsonObject).defaultCollection as string);

    if (!defaultCollection || defaultCollection === '@yolkai/nx-workspace') {
      (workspace.extensions.cli as JsonObject).defaultCollection =
        '@yolkai/nx-express';
    }
  });
}

export default function(schema: Schema) {
  return chain([
    setDefault(),
    addPackageWithInit('@yolkai/nx-node'),
    addPackageWithInit('@yolkai/nx-jest'),
    addDependencies(),
    moveDependency(),
    formatFiles(schema)
  ]);
}
