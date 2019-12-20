import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

import * as path from 'path';

import { serializeJson } from '@yolkai/nx-workspace';
import { readJsonInTree } from '@yolkai/nx-workspace';
import { createEmptyWorkspace } from '@yolkai/nx-workspace/testing';

describe('Update 7.5.0', () => {
  let initialTree: Tree;
  let schematicRunner: SchematicTestRunner;

  beforeEach(() => {
    initialTree = createEmptyWorkspace(Tree.empty());

    initialTree.overwrite(
      'package.json',
      serializeJson({
        devDependencies: {
          typescript: '~3.1.0'
        }
      })
    );

    schematicRunner = new SchematicTestRunner(
      '@yolkai/nx-schematics',
      path.join(__dirname, '../migrations.json')
    );
  });

  it('should update typescript', async () => {
    const result = await schematicRunner
      .runSchematicAsync('update-7.5.0', {}, initialTree)
      .toPromise();

    expect(
      readJsonInTree(result, 'package.json').devDependencies.typescript
    ).toEqual('~3.2.2');
  });
});
