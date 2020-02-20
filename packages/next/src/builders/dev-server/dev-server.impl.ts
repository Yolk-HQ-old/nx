import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
  targetFromTargetString,
  scheduleTargetAndForget
} from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import * as http from 'http';
import next from 'next';
import * as path from 'path';
import { from, Observable, of, forkJoin } from 'rxjs';
import { switchMap, concatMap, tap } from 'rxjs/operators';
import { StartServerFn } from '../../..';

try {
  require('dotenv').config();
} catch (e) {}

export interface NextBuildBuilderOptions extends JsonObject {
  dev: boolean;
  port: number;
  quiet: boolean;
  buildTarget: string;
  customServerTarget: string;
  environmentFilePath: string;
  baseUrl: string;
  hostname: string;
  skipBuild: boolean;
}

export default createBuilder<NextBuildBuilderOptions>(run);

/**
 * A simple default server implementation to be used if no `customServerTarget` is provided.
 */
const defaultStartServer: StartServerFn = async (nextApp, options) => {
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();
  const server = http.createServer((req, res) => {
    handle(req, res);
  });
  return new Promise((resolve, reject) => {
    server.on('error', (error: Error) => {
      if (error) {
        reject(error);
      }
    });
    if (options.hostname) {
      server.listen(options.port, options.hostname, () => {
        resolve();
      });
    } else {
      server.listen(options.port, () => {
        resolve();
      });
    }
  });
};

function run(
  options: NextBuildBuilderOptions,
  context: BuilderContext
): Observable<BuilderOutput> {
  if (options.environmentFilePath) {
    const envFilePath = path.resolve(
      context.workspaceRoot,
      options.environmentFilePath
    );
    require('dotenv').config({ path: envFilePath });
  }

  const buildTarget = targetFromTargetString(options.buildTarget);
  const customServerTarget =
    options.customServerTarget &&
    targetFromTargetString(options.customServerTarget);
  const baseUrl =
    options.baseUrl ||
    `http://${options.hostname || 'localhost'}:${options.port}`;

  const success: BuilderOutput = { success: true };
  const build$ =
    !options.dev && !options.skipBuild
      ? scheduleTargetAndForget(context, buildTarget)
      : of(success);
  const customServer$ =
    customServerTarget && !options.skipBuild
      ? scheduleTargetAndForget(context, customServerTarget)
      : of(success);

  return forkJoin(build$, customServer$).pipe(
    concatMap(([buildResult, customServerResult]) => {
      if (!buildResult.success) return of(buildResult);
      if (!customServerResult.success) return of(customServerResult);

      return from(context.getTargetOptions(buildTarget)).pipe(
        concatMap((buildOptions: JsonObject) => {
          const root = path.resolve(
            context.workspaceRoot,
            buildOptions.root as string
          );

          const nextApp = next({
            dev: options.dev,
            dir: root,
            quiet: options.quiet
          });

          let server$: Observable<void>;
          if (customServerTarget) {
            server$ = from(context.getTargetOptions(customServerTarget)).pipe(
              concatMap((customServerOptions: JsonObject) => {
                const customServerEntry = path.join(
                  context.workspaceRoot,
                  customServerOptions.outputPath as string,
                  'main.js'
                );
                const startServer: StartServerFn = require(customServerEntry)
                  .startServer;
                return from(startServer(nextApp, options));
              })
            );
          } else {
            const startServer: StartServerFn = defaultStartServer;
            server$ = from(startServer(nextApp, options));
          }

          return server$.pipe(
            tap(() => {
              context.logger.info(`Ready on ${baseUrl}`);
            }),
            switchMap(
              _e =>
                new Observable<BuilderOutput>(obs => {
                  obs.next({
                    baseUrl,
                    success: true
                  });
                })
            )
          );
        })
      );
    })
  );
}
