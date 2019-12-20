import { Rule } from '@angular-devkit/schematics';
import { updateWorkspaceInTree } from '@yolkai/nx-workspace';

export default function update(): Rule {
  return updateWorkspaceInTree(config => {
    const a = [];
    const b = [];
    Object.keys(config.schematics).forEach(name => {
      if (name === '@yolkai/nx-react' && config.schematics[name].application) {
        a.push(config.schematics[name]);
      }
      if (name === '@yolkai/nx-react:application') {
        b.push(config.schematics[name]);
      }
    });
    a.forEach(x => {
      delete x.application.babel;
    });
    b.forEach(x => {
      delete x.babel;
    });
    return config;
  });
}
