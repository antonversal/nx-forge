import { ExecutorContext, logger } from '@nx/devkit';
import { RegisterExecutorOptions } from './schema';
import { normalizeOptions } from './lib/normalize-options';
import { patchManifestYml } from './lib/patch-manifest-yml';
import { runForgeCommandAsync } from '../../utils/forge/async-commands';

export default async function runExecutor(
  rawOptions: RegisterExecutorOptions,
  context: ExecutorContext
) {
  const { root, sourceRoot } = context.workspace.projects[context.projectName];

  if (!sourceRoot) {
    throw new Error(`${context.projectName} does not have a sourceRoot.`);
  }

  if (!root) {
    throw new Error(`${context.projectName} does not have a root.`);
  }

  const options = normalizeOptions(rawOptions, context.root, sourceRoot, root);

  // https://developer.atlassian.com/platform/forge/cli-reference/register/
  const args = [
    'register',
    ...(options.verbose === true ? ['--verbose'] : []),
    options.appName,
  ];

  logger.log(`Running: forge ${args.join(' ')}`);

  await runForgeCommandAsync(args, {
    cwd: options.outputPath,
  });

  await patchManifestYml(options);

  logger.info('✅ Forge app registered');

  return {
    success: true,
  };
}
