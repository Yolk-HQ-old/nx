import {
  runCLIAsync,
  ensureProject,
  uniq,
  runCLI,
  forEachCli,
  updateFile
} from './utils';
import { stripIndents } from '@angular-devkit/core/src/utils/literals';

forEachCli(() => {
  describe('Jest', () => {
    it('should be able test projects using jest', async done => {
      ensureProject();
      const mylib = uniq('mylib');
      const myapp = uniq('myapp');
      runCLI(
        `generate @yolkai/nx-angular:app ${myapp} --unit-test-runner jest`
      );
      runCLI(
        `generate @yolkai/nx-angular:lib ${mylib} --unit-test-runner jest`
      );

      await Promise.all([
        runCLIAsync(
          `generate @yolkai/nx-angular:service test --project ${myapp}`
        ),
        runCLIAsync(
          `generate @yolkai/nx-angular:component test --project ${myapp}`
        ),
        runCLIAsync(
          `generate @yolkai/nx-angular:service test --project ${mylib}`
        ),
        runCLIAsync(
          `generate @yolkai/nx-angular:component test --project ${mylib}`
        )
      ]);
      const appResult = await runCLIAsync(`test ${myapp} --no-watch`);
      expect(appResult.stderr).toContain('Test Suites: 3 passed, 3 total');
      const libResult = await runCLIAsync(`test ${mylib}`);
      expect(libResult.stderr).toContain('Test Suites: 3 passed, 3 total');
      done();
    }, 45000);

    it('should merge with jest config globals', async done => {
      ensureProject();
      const testGlobal = `'My Test Global'`;
      const mylib = uniq('mylib');
      runCLI(
        `generate @yolkai/nx-workspace:lib ${mylib} --unit-test-runner jest`
      );

      updateFile(`libs/${mylib}/src/lib/${mylib}.ts`, `export class Test { }`);

      updateFile(
        `libs/${mylib}/src/lib/${mylib}.spec.ts`,
        `
          test('can access jest global', () => {
            expect((global as any).testGlobal).toBe(${testGlobal});
          });
        `
      );

      updateFile(
        `libs/${mylib}/jest.config.js`,
        stripIndents`
          module.exports = {
            testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
            transform: {
              '^.+\\.(ts|js|html)$': 'ts-jest'
            },
            resolver: '@yolkai/nx-jest/plugins/resolver',
            moduleFileExtensions: ['ts', 'js', 'html'],
            coverageReporters: ['html'],
            passWithNoTests: true,
            globals: { testGlobal: ${testGlobal} }
          };`
      );

      const appResult = await runCLIAsync(`test ${mylib} --no-watch`);
      expect(appResult.stderr).toContain('Test Suites: 1 passed, 1 total');
      done();
    }, 45000);

    it('should set the NODE_ENV to `test`', async done => {
      ensureProject();
      const mylib = uniq('mylib');
      runCLI(
        `generate @yolkai/nx-workspace:lib ${mylib} --unit-test-runner jest`
      );

      updateFile(
        `libs/${mylib}/src/lib/${mylib}.spec.ts`,
        `
        test('can access jest global', () => {
          expect(process.env.NODE_ENV).toBe('test');
        });
        `
      );
      const appResult = await runCLIAsync(`test ${mylib} --no-watch`);
      expect(appResult.stderr).toContain('Test Suites: 1 passed, 1 total');
      done();
    }, 45000);
  });
});
