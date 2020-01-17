import { chain, noop, Rule, Tree } from '@angular-devkit/schematics';
import { readWorkspace, updateJsonInTree } from '@yolkai/nx-workspace';
import * as path from 'path';

const ignore = require('ignore');

export default function update(): Rule {
  return (host: Tree) => {
    const workspace = readWorkspace(host);
    return chain(
      Object.keys(workspace.projects).map(k => {
        const p = workspace.projects[k];
        if (p.projectType !== 'application') {
          return noop();
        }
        if (isReactProject(p)) {
          return updateJsonInTree(path.join(p.root, 'tsconfig.json'), json => {
            json.files = json.files.filter(
              f => f.indexOf('@yolkai/nx-react/typings/svg.d.ts') === -1
            );
            return json;
          });
        } else {
          return noop();
        }
      })
    );
  };
}

function isReactProject(p) {
  const buildArchitect =
    p.architect && p.architect.build ? p.architect.build : null;
  return (
    buildArchitect &&
    buildArchitect.builder === '@yolkai/nx-web:build' &&
    (buildArchitect.options.webpackConfig ===
      '@yolkai/nx-react/plugins/babel' ||
      buildArchitect.options.webpackConfig ===
        '@yolkai/nx-react/plugins/webpack')
  );
}
