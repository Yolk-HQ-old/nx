import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { updateJsonInTree, readJsonInTree } from '@yolkai/nx-workspace';

import * as path from 'path';
import { createEmptyWorkspace } from '@yolkai/nx-workspace/testing';

describe('Update 8-0-0', () => {
  let initialTree: Tree;
  let schematicRunner: SchematicTestRunner;

  beforeEach(async () => {
    initialTree = createEmptyWorkspace(Tree.empty());
    schematicRunner = new SchematicTestRunner(
      '@yolkai/nx-schematics',
      path.join(__dirname, '../migrations.json')
    );
    initialTree = await schematicRunner
      .callRule(
        updateJsonInTree('package.json', json => ({
          scripts: {
            update: 'ng update @yolkai/nx-schematics'
          },
          dependencies: {
            '@yolkai/nx': '7.8.1',
            '@nestjs/core': '5.6.0',
            express: '4.16.3',
            react: '16.8.3',
            '@angular/core': '^7.0.0'
          },
          devDependencies: {
            '@yolkai/nx-schematics': '7.8.1',
            cypress: '3.1.0',
            jest: '24.1.0'
          }
        })),
        initialTree
      )
      .toPromise();
    initialTree = await schematicRunner
      .callRule(
        updateJsonInTree('tsconfig.json', json => ({
          compilerOptions: {}
        })),
        initialTree
      )
      .toPromise();
    initialTree = await schematicRunner
      .callRule(
        updateJsonInTree('tsconfig.app.json', json => ({
          compilerOptions: {
            outDir: '../../dist/out-tsc/apps/blah'
          }
        })),
        initialTree
      )
      .toPromise();
    initialTree = await schematicRunner
      .callRule(
        updateJsonInTree('workspace.json', json => ({
          projects: {
            'my-app': {
              architect: {
                cypress: {
                  builder: '@yolkai/builders:cypress',
                  options: {}
                },
                jest: {
                  builder: '@yolkai/builders:jest',
                  options: {}
                },
                nodeBuild: {
                  builder: '@yolkai/builders:node-build',
                  options: {}
                },
                nodeServe: {
                  builder: '@yolkai/builders:node-execute',
                  options: {}
                },
                webBuild: {
                  builder: '@yolkai/builders:web-build',
                  options: {}
                },
                webServe: {
                  builder: '@yolkai/builders:web-dev-server',
                  options: {}
                },
                runCommands: {
                  builder: '@yolkai/builders:run-commands',
                  options: {}
                }
              }
            }
          },
          cli: {
            defaultCollection: '@yolkai/nx-schematics'
          }
        })),
        initialTree
      )
      .toPromise();
    initialTree = await schematicRunner
      .callRule(
        updateJsonInTree('tslint.json', json => ({
          rulesDirectory: ['node_modules/@yolkai/nx-schematics/src/tslint'],
          rules: {}
        })),
        initialTree
      )
      .toPromise();
  });

  describe('imports', () => {
    it(`should be migrated from '@yolkai/nx' to '@yolkai/nx-angular'`, async () => {
      initialTree.create(
        'file.ts',
        `
        import * from '@yolkai/nx';
        import * from '@yolkai/nx/testing';
        import { NxModule } from '@yolkai/nx';
        import { hot } from '@yolkai/nx/testing';
      `
      );

      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();
      expect(tree.readContent('file.ts')).toEqual(`
        import * from '@yolkai/nx-angular';
        import * from '@yolkai/nx-angular/testing';
        import { NxModule } from '@yolkai/nx-angular';
        import { hot } from '@yolkai/nx-angular/testing';
      `);
    });

    it(`should be migrated from '@yolkai/nx-schematics' to '@yolkai/nx-workspace'`, async () => {
      initialTree.create(
        'file.ts',
        `
        import * from '@yolkai/nx-schematics/src/utils/fileutils';
        import { fileExists } from '@yolkai/nx-schematics/src/utils/fileutils';
      `
      );

      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();
      expect(tree.readContent('file.ts')).toEqual(
        `
        import * from '@yolkai/nx-workspace/src/utils/fileutils';
        import { fileExists } from '@yolkai/nx-workspace/src/utils/fileutils';
      `
      );
    });
  });

  describe('builders', () => {
    it('should be migrated', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();
      const { projects } = readJsonInTree(tree, 'workspace.json');
      const { architect } = projects['my-app'];
      expect(architect.cypress.builder).toEqual('@yolkai/nx-cypress:cypress');
      expect(architect.jest.builder).toEqual('@yolkai/nx-jest:jest');
      expect(architect.nodeBuild.builder).toEqual('@yolkai/nx-node:build');
      expect(architect.nodeServe.builder).toEqual('@yolkai/nx-node:execute');
      expect(architect.webBuild.builder).toEqual('@yolkai/nx-web:build');
      expect(architect.webServe.builder).toEqual('@yolkai/nx-web:dev-server');
      expect(architect.runCommands.builder).toEqual(
        '@yolkai/nx-workspace:run-commands'
      );
    });
  });

  describe('update npm script', () => {
    it('should do ng update @yolkai/nx-workspace', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();
      const packageJson = readJsonInTree(tree, 'package.json');
      expect(packageJson.scripts.update).toEqual(
        'ng update @yolkai/nx-workspace'
      );
    });
  });

  describe('set root dir', () => {
    it('should set root dir and update out dirs', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();
      const rootTsConfig = readJsonInTree(tree, 'tsconfig.json');
      expect(rootTsConfig.compilerOptions.rootDir).toEqual('.');

      const appTsConfig = readJsonInTree(tree, 'tsconfig.app.json');
      expect(appTsConfig.compilerOptions.outDir).toEqual('../../dist/out-tsc');
    });
  });

  describe('jest config', () => {
    it('should have the plugin path migrated', async () => {
      initialTree.create(
        'jest.config.js',
        `
        module.exports = {
          resolver: '@yolkai/builders/plugins/jest/resolver',
        };
      `
      );
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();
      expect(tree.readContent('jest.config.js')).toContain(
        '@yolkai/nx-jest/plugins/resolver'
      );
    });
  });

  describe('dependencies', () => {
    it('should change to the new dependencies', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();

      const { dependencies, devDependencies } = readJsonInTree(
        tree,
        'package.json'
      );
      expect(dependencies['@yolkai/nx']).not.toBeDefined();
      expect(devDependencies['@yolkai/nx-schematics']).not.toBeDefined();
      expect(devDependencies['@yolkai/builders']).not.toBeDefined();
      expect(dependencies['@yolkai/nx-angular']).toBeDefined();
      expect(devDependencies['@yolkai/nx-express']).toBeDefined();
      expect(devDependencies['@yolkai/nx-cypress']).toBeDefined();
      expect(devDependencies['@yolkai/nx-jest']).toBeDefined();
      expect(devDependencies['@yolkai/nx-nest']).toBeDefined();
      expect(devDependencies['@yolkai/nx-node']).toBeDefined();
      expect(devDependencies['@yolkai/nx-react']).toBeDefined();
      expect(devDependencies['@yolkai/nx-web']).toBeDefined();
      expect(devDependencies['@yolkai/nx-workspace']).toBeDefined();
    });
  });

  describe('lint rules', () => {
    it('should be migrated to `@yolkai/nx-workspace`', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();

      const { rulesDirectory } = readJsonInTree(tree, 'tslint.json');
      expect(rulesDirectory).not.toContain(
        'node_modules/@yolkai/nx-schematics/src/tslint'
      );
      expect(rulesDirectory).toContain(
        'node_modules/@yolkai/nx-workspace/src/tslint'
      );
    });
  });

  describe('Nest dependencies', () => {
    it('should be updated to 6.x', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();

      const { dependencies, devDependencies } = readJsonInTree(
        tree,
        'package.json'
      );

      expect(dependencies['@nestjs/common']).toEqual('^6.2.4');
      expect(dependencies['@nestjs/core']).toEqual('^6.2.4');
      expect(dependencies['@nestjs/platform-express']).toEqual('^6.2.4');
      expect(dependencies['reflect-metadata']).toEqual('^0.1.12');
      expect(devDependencies['@nestjs/schematics']).toEqual('^6.3.0');
      expect(devDependencies['@nestjs/testing']).toEqual('^6.2.4');
    });
  });

  describe('defaultCollection', () => {
    it('should be set to @yolkai/nx-angular if @angular/core is present', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();

      const defaultCollection = readJsonInTree(tree, 'workspace.json').cli
        .defaultCollection;
      expect(defaultCollection).toEqual('@yolkai/nx-angular');
    });

    it('should be set to @yolkai/nx-react if react is present', async () => {
      initialTree = await schematicRunner
        .callRule(
          updateJsonInTree('package.json', json => ({
            ...json,
            dependencies: {
              '@nestjs/core': '5.6.0',
              express: '4.16.3',
              react: '16.8.3'
            }
          })),
          initialTree
        )
        .toPromise();
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();

      const defaultCollection = readJsonInTree(tree, 'workspace.json').cli
        .defaultCollection;
      expect(defaultCollection).toEqual('@yolkai/nx-react');
    });

    it('should be set to @yolkai/nx-nest if @nestjs/core is present', async () => {
      initialTree = await schematicRunner
        .callRule(
          updateJsonInTree('package.json', json => ({
            ...json,
            dependencies: {
              '@nestjs/core': '5.6.0',
              express: '4.16.3'
            }
          })),
          initialTree
        )
        .toPromise();
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();

      const defaultCollection = readJsonInTree(tree, 'workspace.json').cli
        .defaultCollection;
      expect(defaultCollection).toEqual('@yolkai/nx-nest');
    });

    it('should be set to @yolkai/nx-express if express is present', async () => {
      initialTree = await schematicRunner
        .callRule(
          updateJsonInTree('package.json', json => ({
            ...json,
            dependencies: {
              express: '4.16.3'
            }
          })),
          initialTree
        )
        .toPromise();
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();

      const defaultCollection = readJsonInTree(tree, 'workspace.json').cli
        .defaultCollection;
      expect(defaultCollection).toEqual('@yolkai/nx-express');
    });

    it('should be set to @yolkai/nx-express if express is present', async () => {
      initialTree = await schematicRunner
        .callRule(
          updateJsonInTree('package.json', json => ({
            ...json,
            dependencies: {
              express: '4.16.3'
            }
          })),
          initialTree
        )
        .toPromise();
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();

      const defaultCollection = readJsonInTree(tree, 'workspace.json').cli
        .defaultCollection;
      expect(defaultCollection).toEqual('@yolkai/nx-express');
    });

    it('should fallback to @yolkai/nx-workspace', async () => {
      initialTree = await schematicRunner
        .callRule(
          updateJsonInTree('package.json', json => ({
            ...json,
            dependencies: {}
          })),
          initialTree
        )
        .toPromise();
      initialTree = await schematicRunner
        .callRule(
          updateJsonInTree('workspace.json', json => ({
            ...json,
            projects: {}
          })),
          initialTree
        )
        .toPromise();
      const tree = await schematicRunner
        .runSchematicAsync('update-8.0.0', {}, initialTree)
        .toPromise();

      const defaultCollection = readJsonInTree(tree, 'workspace.json').cli
        .defaultCollection;
      expect(defaultCollection).toEqual('@yolkai/nx-workspace');
    });
  });
});
