import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import {
  updateJsonInTree,
  readJsonInTree,
  updateWorkspaceInTree,
  readWorkspace,
  getWorkspacePath
} from '@yolkai/nx-workspace';

import * as path from 'path';
import { stripIndents } from '@angular-devkit/core/src/utils/literals';

describe('Update 8-5-0', () => {
  let tree: Tree;
  let schematicRunner: SchematicTestRunner;

  beforeEach(async () => {
    tree = Tree.empty();
    schematicRunner = new SchematicTestRunner(
      '@yolkai/nx-react',
      path.join(__dirname, '../../../migrations.json')
    );
  });

  it(`should remove babel schematic defaults`, async () => {
    tree.create(
      'workspace.json',
      JSON.stringify({
        schematics: {
          '@yolkai/nx-react': {
            application: {
              babel: true
            }
          },
          '@yolkai/nx-react:application': {
            babel: true
          }
        }
      })
    );

    tree = await schematicRunner
      .runSchematicAsync('update-workspace-8.5.0', {}, tree)
      .toPromise();

    const config = readWorkspace(tree);
    expect(config).toEqual({
      schematics: {
        '@yolkai/nx-react': {
          application: {}
        },
        '@yolkai/nx-react:application': {}
      }
    });
  });
});
