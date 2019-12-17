import { Rule, chain } from '@angular-devkit/schematics';
import {
  updateJsonInTree,
  addPackageWithInit,
  formatFiles
} from '@yolkai/nx-workspace';
import { addDepsToPackageJson } from '@yolkai/nx-workspace';
import { Schema } from './schema';
import {
  nxVersion,
  documentRegisterElementVersion
} from '../../utils/versions';
import { updateWorkspace } from '@yolkai/nx-workspace';
import { JsonObject } from '@angular-devkit/core';

function addDependencies(): Rule {
  return addDepsToPackageJson(
    {
      'document-register-element': documentRegisterElementVersion
    },
    {
      '@yolkai/nx-web': nxVersion
    }
  );
}

function moveDependency(): Rule {
  return updateJsonInTree('package.json', json => {
    json.dependencies = json.dependencies || {};

    delete json.dependencies['@yolkai/nx-web'];
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
        '@yolkai/nx-web';
    }
  });
}

export default function(schema: Schema) {
  return chain([
    setDefault(),
    addPackageWithInit('@yolkai/nx-jest'),
    addPackageWithInit('@yolkai/nx-cypress'),
    addDependencies(),
    moveDependency(),
    formatFiles(schema)
  ]);
}
