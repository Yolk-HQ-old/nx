import { Tree } from '@angular-devkit/schematics';
import { createEmptyWorkspace } from '@yolkai/nx-workspace/testing';
import { readJsonInTree } from '@yolkai/nx-workspace';
import { updateJsonInTree } from '@yolkai/nx-workspace';
import { runSchematic, callRule } from '../../utils/testing';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = Tree.empty();
    tree = createEmptyWorkspace(tree);
  });

  it('should add react dependencies', async () => {
    const result = await runSchematic('init', {}, tree);
    const packageJson = readJsonInTree(result, 'package.json');
    expect(packageJson.dependencies['@yolkai/nx-next']).toBeUndefined();
    expect(packageJson.dependencies['@yolkai/nx-react']).toBeUndefined();
    expect(packageJson.dependencies['next']).toBeDefined();
  });

  describe('defaultCollection', () => {
    it('should be set if none was set before', async () => {
      const result = await runSchematic('init', {}, tree);
      const workspaceJson = readJsonInTree(result, 'workspace.json');
      expect(workspaceJson.cli.defaultCollection).toEqual('@yolkai/nx-next');
    });

    it('should be set if @yolkai/nx-workspace was set before', async () => {
      tree = await callRule(
        updateJsonInTree('workspace.json', json => {
          json.cli = {
            defaultCollection: '@yolkai/nx-workspace'
          };

          return json;
        }),
        tree
      );
      const result = await runSchematic('init', {}, tree);
      const workspaceJson = readJsonInTree(result, 'workspace.json');
      expect(workspaceJson.cli.defaultCollection).toEqual('@yolkai/nx-next');
    });

    it('should not be set if something else was set before', async () => {
      tree = await callRule(
        updateJsonInTree('workspace.json', json => {
          json.cli = {
            defaultCollection: '@yolkai/nx-angular'
          };

          json.schematics = {};

          return json;
        }),
        tree
      );
      const result = await runSchematic('init', {}, tree);
      const workspaceJson = readJsonInTree(result, 'workspace.json');
      expect(workspaceJson.cli.defaultCollection).toEqual('@yolkai/nx-angular');
    });
  });
});
