/**
 * This file is used by `nx list` to display approved plugins
 */

export interface Plugin {
  name: string;
  capabilities: 'builders' | 'schematics' | 'builders,schematics';
  link?: string;
}

export const approvedPlugins: Plugin[] = [
  {
    name: '@yolkai/nx-angular',
    capabilities: 'schematics'
  },
  {
    name: '@yolkai/nx-cypress',
    capabilities: 'builders,schematics'
  },
  {
    name: '@yolkai/nx-express',
    capabilities: 'builders,schematics'
  },
  {
    name: '@yolkai/nx-jest',
    capabilities: 'builders,schematics'
  },
  {
    name: '@yolkai/nx-nest',
    capabilities: 'builders,schematics'
  },
  {
    name: '@yolkai/nx-next',
    capabilities: 'builders,schematics'
  },
  {
    name: '@yolkai/nx-node',
    capabilities: 'builders,schematics'
  },
  {
    name: '@yolkai/nx-react',
    capabilities: 'builders,schematics'
  },
  {
    name: '@yolkai/nx-storybook',
    capabilities: 'builders,schematics'
  },
  {
    name: '@yolkai/nx-web',
    capabilities: 'builders,schematics'
  }
];
