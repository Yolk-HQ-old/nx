import { updateJsonInTree } from '@yolkai/nx-workspace';

export default function init() {
  return updateJsonInTree('nx.json', json => {
    return {
      ...json,
      tasksRunnerOptions: {
        default: {
          runner: '@yolkai/nx-insights'
        }
      }
    };
  });
}
