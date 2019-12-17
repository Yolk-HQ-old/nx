import { Tree } from '@angular-devkit/schematics';
import { createEmptyWorkspace } from '@yolkai/nx-workspace/testing';
import { readJsonInTree, updateJsonInTree } from '@yolkai/nx-workspace';
import { callRule, runSchematic } from '../../utils/testing';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = Tree.empty();
    tree = createEmptyWorkspace(tree);
  });

  it('should add dependencies', async () => {
    const result = await runSchematic('init', {}, tree);
    const packageJson = readJsonInTree(result, 'package.json');
    expect(packageJson.dependencies['@yolkai/nx-node']).toBeUndefined();
    expect(packageJson.devDependencies['@yolkai/nx-node']).toBeDefined();
  });

  describe('defaultCollection', () => {
    it('should be set if none was set before', async () => {
      const result = await runSchematic('init', {}, tree);
      const workspaceJson = readJsonInTree(result, 'workspace.json');
      expect(workspaceJson.cli.defaultCollection).toEqual('@yolkai/nx-node');
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
      expect(workspaceJson.cli.defaultCollection).toEqual('@yolkai/nx-node');
    });

    it('should not be set if something else was set before', async () => {
      tree = await callRule(
        updateJsonInTree('workspace.json', json => {
          json.cli = {
            defaultCollection: '@yolkai/nx-angular'
          };

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
