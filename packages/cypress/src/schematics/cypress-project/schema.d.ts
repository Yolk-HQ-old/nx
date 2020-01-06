import { Linter } from '@yolkai/nx-workspace';

export interface Schema {
  project: string;
  name: string;
  directory: string;
  linter: Linter;
  js?: boolean;
}
