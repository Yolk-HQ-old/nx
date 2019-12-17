import { Tree } from '@angular-devkit/schematics';

import { readJsonInTree } from '@yolkai/nx-workspace';
import { createEmptyWorkspace } from '@yolkai/nx-workspace/testing';

import { runSchematic } from '../../utils/testing';

describe('init', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = Tree.empty();
    appTree = createEmptyWorkspace(appTree);
  });

  it('should add dependencies into `package.json` file', async () => {
    const tree = await runSchematic('init', {}, appTree);
    const packageJson = readJsonInTree(tree, 'package.json');
    expect(packageJson.devDependencies['@storybook/angular']).toBeDefined();
    expect(packageJson.devDependencies['@storybook/addon-knobs']).toBeDefined();
    expect(packageJson.devDependencies['babel-loader']).toBeDefined();
    expect(packageJson.devDependencies['@babel/core']).toBeDefined();
  });
});
