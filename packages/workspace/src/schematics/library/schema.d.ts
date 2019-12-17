import { Linter } from '@yolkai/nx-workspace/src/utils/lint';

export interface Schema {
  name: string;
  directory?: string;
  skipTsConfig: boolean;
  skipFormat: boolean;
  tags?: string;
  simpleModuleName: boolean;
  unitTestRunner: 'jest' | 'none';
  linter: Linter;
}
