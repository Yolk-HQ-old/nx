import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readJsonInTree } from '@yolkai/nx-workspace';
import * as path from 'path';
import { createEmptyWorkspace } from '@yolkai/nx-workspace/testing';

describe('Update 8-10-0', () => {
  let tree: Tree;
  let schematicRunner: SchematicTestRunner;

  beforeEach(async () => {
    tree = Tree.empty();
    tree = createEmptyWorkspace(tree);
    schematicRunner = new SchematicTestRunner(
      '@yolkai/nx-react',
      path.join(__dirname, '../../../migrations.json')
    );
  });

  it(`should update libs`, async () => {
    tree.overwrite(
      'package.json',
      JSON.stringify({
        dependencies: {
          '@emotion/core': '10.0.23',
          '@emotion/styled': '10.0.23'
        },
        devDependencies: {
          '@types/react': '16.9.13'
        }
      })
    );

    tree = await schematicRunner
      .runSchematicAsync('update-8.10.0', {}, tree)
      .toPromise();

    const packageJson = readJsonInTree(tree, '/package.json');
    expect(packageJson).toMatchObject({
      dependencies: {
        '@emotion/core': '10.0.27',
        '@emotion/styled': '10.0.27'
      },
      devDependencies: {
        '@types/react': '16.9.17'
      }
    });
  });

  it('should add custom typings to react apps', async () => {
    const reactRunner = new SchematicTestRunner(
      '@yolkai/nx-react',
      path.join(__dirname, '../../../collection.json')
    );
    tree = await reactRunner
      .runSchematicAsync('app', { name: 'demo' }, tree)
      .toPromise();
    tree = await reactRunner
      .runSchematicAsync(
        'app',
        { name: 'nested-app', directory: 'nested' },
        tree
      )
      .toPromise();

    tree = await schematicRunner
      .runSchematicAsync('update-8.10.0', {}, tree)
      .toPromise();

    let tsConfig = JSON.parse(tree.read(`apps/demo/tsconfig.json`).toString());
    expect(tsConfig.files).toContain(
      '../../node_modules/@yolkai/nx-react/typings/image.d.ts'
    );

    tsConfig = JSON.parse(
      tree.read(`apps/nested/nested-app/tsconfig.json`).toString()
    );
    expect(tsConfig.files).toContain(
      '../../../node_modules/@yolkai/nx-react/typings/image.d.ts'
    );
  });

  it('should change `@yolkai/nx-react/plugins/babel` with `@yolkai/nx-react/plugins/webpack`', async () => {
    let workspaceJson = readJsonInTree(tree, '/workspace.json');
    workspaceJson.projects = {
      demo: {
        root: 'apps/demo',
        projectType: 'application',
        architect: {
          build: {
            builder: '@yolkai/nx-web:build',
            options: {
              webpackConfig: '@yolkai/nx-react/plugins/babel'
            }
          }
        }
      }
    };
    tree.overwrite('/workspace.json', JSON.stringify(workspaceJson));

    tree = await schematicRunner
      .runSchematicAsync('update-8.10.0', {}, tree)
      .toPromise();

    workspaceJson = readJsonInTree(tree, '/workspace.json');
    expect(workspaceJson.projects).toEqual({
      demo: {
        root: 'apps/demo',
        projectType: 'application',
        architect: {
          build: {
            builder: '@yolkai/nx-web:build',
            options: {
              webpackConfig: '@yolkai/nx-react/plugins/webpack'
            }
          }
        }
      }
    });
  });
});
