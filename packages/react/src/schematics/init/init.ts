import { chain, Rule } from '@angular-devkit/schematics';
import {
  addDepsToPackageJson,
  updateJsonInTree,
  addPackageWithInit,
  updateWorkspace
} from '@yolkai/nx-workspace';
import { Schema } from './schema';
import {
  reactVersion,
  typesReactVersion,
  typesReactDomVersion,
  testingLibraryReactVersion,
  nxVersion,
  reactDomVersion
} from '../../utils/versions';
import { JsonObject } from '@angular-devkit/core';

export function addDependencies(): Rule {
  return addDepsToPackageJson(
    {
      react: reactVersion,
      'react-dom': reactDomVersion
    },
    {
      '@yolkai/nx-react': nxVersion,
      '@types/react': typesReactVersion,
      '@types/react-dom': typesReactDomVersion,
      '@testing-library/react': testingLibraryReactVersion
    }
  );
}

function moveDependency(): Rule {
  return updateJsonInTree('package.json', json => {
    json.dependencies = json.dependencies || {};

    delete json.dependencies['@yolkai/nx-react'];
    return json;
  });
}

function setDefault(): Rule {
  return updateWorkspace(workspace => {
    // Set workspace default collection to 'react' if not already set.
    workspace.extensions.cli = workspace.extensions.cli || {};
    const defaultCollection: string =
      workspace.extensions.cli &&
      ((workspace.extensions.cli as JsonObject).defaultCollection as string);

    if (!defaultCollection || defaultCollection === '@yolkai/nx-workspace') {
      (workspace.extensions.cli as JsonObject).defaultCollection =
        '@yolkai/nx-react';
    }

    // Also generate all new react apps with babel.
    workspace.extensions.schematics =
      jsonIdentity(workspace.extensions.schematics) || {};
    const reactSchematics =
      jsonIdentity(workspace.extensions.schematics['@yolkai/nx-react']) || {};
    workspace.extensions.schematics = {
      ...workspace.extensions.schematics,
      '@yolkai/nx-react': {
        application: {
          ...jsonIdentity(reactSchematics.application),
          babel: true
        }
      }
    };
  });
}

function jsonIdentity(x: any): JsonObject {
  return x as JsonObject;
}

export default function(schema: Schema) {
  return chain([
    setDefault(),
    addPackageWithInit('@yolkai/nx-jest'),
    addPackageWithInit('@yolkai/nx-cypress'),
    addPackageWithInit('@yolkai/nx-web'),
    addDependencies(),
    moveDependency()
  ]);
}
