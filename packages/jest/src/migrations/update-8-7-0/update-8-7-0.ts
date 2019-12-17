import { Rule } from '@angular-devkit/schematics';
import { updateWorkspace } from '@yolkai/nx-workspace/src/utils/workspace';

const convertToArray = updateWorkspace(workspace => {
  workspace.projects.forEach(project => {
    project.targets.forEach(target => {
      if (
        target.builder === '@yolkai/nx-jest:jest' &&
        target.options &&
        target.options.testPathPattern
      ) {
        target.options.testPathPattern = [target.options.testPathPattern];
      }
    });
  });
});

export default function(): Rule {
  return convertToArray;
}
