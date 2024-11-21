import fs from 'node:fs'
import { execSync } from 'node:child_process'
import fp from 'find-free-port'
import chalk from 'chalk'
import { createRequire } from 'node:module'
import { readTSConfig, writeTSConfig } from 'pkg-types'

import { useConsole } from './useConsole.js'
import { absoluteVulmixPaths } from './paths.js'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const ABSOLUTE_ROOT_PATH = absoluteVulmixPaths().absoluteRootPath
const ABSOLUTE_PACKAGE_PATH = absoluteVulmixPaths().absolutePackagePath

const CLI_OPTION = process.argv[2]
const CLI_FLAG = process.argv[3]

const appSubFolder =
  VulmixConfig.dirs?.dist?.root &&
  VulmixConfig.dirs?.dist?.root?.startsWith('/')
    ? VulmixConfig.dirs?.dist?.root
    : `/${VulmixConfig.dirs?.dist?.root}` || ''

/**
 * Creates necessary folders and files
 * @returns {void}
 */
function prepare() {
  const options = [
    ['--outDir', `${ABSOLUTE_ROOT_PATH}/.vulmix`],
    ['--moduleResolution', 'node'],
    ['--skipLibCheck', 'true'],
  ]

  const optionsMap = options.map(([key, value]) => `${key} ${value}`).join(' ')
  const command = `tsc ${ABSOLUTE_ROOT_PATH}/vulmix.config.ts ${optionsMap}`

  if (!fs.existsSync(`${ABSOLUTE_ROOT_PATH}/.vulmix`)) {
    fs.mkdirSync(`${ABSOLUTE_ROOT_PATH}/.vulmix`)
  }

  if (!fs.existsSync(`${ABSOLUTE_ROOT_PATH}/.vulmix/client`)) {
    fs.mkdirSync(`${ABSOLUTE_ROOT_PATH}/.vulmix/client`)
  }

  if (!fs.existsSync(`${ABSOLUTE_ROOT_PATH}/.vulmix/laravel-mix`)) {
    fs.mkdirSync(`${ABSOLUTE_ROOT_PATH}/.vulmix/laravel-mix`)

    copyMixFile()
  } else {
    copyMixFile()
  }

  if (!fs.existsSync(`${ABSOLUTE_ROOT_PATH}/.vulmix/utils`)) {
    fs.mkdirSync(`${ABSOLUTE_ROOT_PATH}/.vulmix/utils`)

    copyUtils()
  } else {
    copyUtils()
  }

  runCommand(command)

  if (!fs.existsSync(`${ABSOLUTE_ROOT_PATH}/.vulmix/types`)) {
    fs.mkdirSync(`${ABSOLUTE_ROOT_PATH}/.vulmix/types`)

    copyTypes()
  } else {
    copyTypes()
  }
}

/**
 * Run dev build with HMR enabled
 * @returns {void}
 */
function dev() {
  prepare()

  runLaravelMix('hot')
}

/**
 * Build for production
 * @returns {void}
 */
function prod() {
  prepare()

  runLaravelMix('prod')
}

/**
 * Serve local production build
 * @returns {void}
 */
function serve() {
  runLaravelMix('serve')
}

/**
 * Run Laravel Mix
 * @param {string} mixCommand - Mix command to run
 * @returns {void}
 */
function runLaravelMix(mixCommand) {
  fp(3000, function (fpError, freePort) {
    if (fpError) {
      console.log(fpError)

      return
    }

    try {
      const port = freePort

      if (mixCommand === 'serve') {
        const serveCommand = `yarpm run http-server -p ${port} -a localhost ${ABSOLUTE_ROOT_PATH}/_dist --gzip --proxy http://localhost:${port}?`

        useConsole.clear()
        useConsole.log(chalk.grey(`Vulxi ${pkg.version}\n`))

        runCommand(serveCommand)

        return
      }

      const command = `mix${
        mixCommand === 'hot' ? ' watch' : ''
      } --mix-config=${ABSOLUTE_ROOT_PATH}/.vulmix/laravel-mix/webpack.mix.js${
        mixCommand === 'hot' ? ` --hot -- --port=${port}` : ''
      }${mixCommand === 'prod' ? ' --production' : ''}`

      useConsole.clear()
      useConsole.log(chalk.grey(`Vulxi ${pkg.version}\n`))

      runCommand(command)
    } catch (err) {
      console.log(err)
    }
  })
}

/**
 * Remove `.vulmix` and `node_modules` folders
 * @returns {void}
 * @todo Add confirmation
 */
function clean() {
  useConsole.clear()
  useConsole.log(chalk.grey(`Vulxi ${pkg.version}\n`))
  useConsole.log(chalk.grey(`Removing .vulmix and node_modules folders\n`))

  if (fs.existsSync(`${ABSOLUTE_ROOT_PATH}/.vulmix`)) {
    fs.rmSync(`${ABSOLUTE_ROOT_PATH}/.vulmix`, {
      recursive: true,
      force: CLI_FLAG === '--force',
    })
  }

  if (fs.existsSync(`${ABSOLUTE_ROOT_PATH}/node_modules`)) {
    fs.rmSync(`${ABSOLUTE_ROOT_PATH}/node_modules`, {
      recursive: true,
      force: CLI_FLAG === '--force',
    })
  }
}

/**
 * Run non-blocking CLI command
 * @param {string} command - Command to run
 * @returns {void}
 */
function runCommand(command) {
  execSync(command, {
    stdio: 'inherit',
  })
}

/**
 * Copy webpack.mix.js file to .vulmix/laravel-mix folder
 * @returns {void}
 */
function copyMixFile() {
  fs.copyFileSync(
    `${ABSOLUTE_PACKAGE_PATH}/utils/webpack.mix.js`,
    `${ABSOLUTE_ROOT_PATH}/.vulmix/laravel-mix/webpack.mix.js`
  )
}

/**
 * Copy tsconfig.json and vue-shims.d.ts files to .vulmix/types folder
 * @returns {void}
 */
async function copyTypes() {
  const VULMIX_CONFIG_PATH = `${ABSOLUTE_ROOT_PATH}/.vulmix/vulmix.config.js`
  const VulmixConfig = require(VULMIX_CONFIG_PATH).default

  const SRC_PATH = VulmixConfig?.dirs?.src || '.'

  fs.copyFileSync(
    `${ABSOLUTE_PACKAGE_PATH}/utils/tsconfig.json`,
    `${ABSOLUTE_ROOT_PATH}/.vulmix/types/tsconfig.json`
  )

  fs.copyFileSync(
    `${ABSOLUTE_PACKAGE_PATH}/types/vue-shims.d.ts`,
    `${ABSOLUTE_ROOT_PATH}/.vulmix/types/vue-shims.d.ts`
  )

  const tsconfig = await readTSConfig(
    `${ABSOLUTE_ROOT_PATH}/.vulmix/types/tsconfig.json`
  )

  // Update tsconfig.json object
  tsconfig.compilerOptions.outDir = `${ABSOLUTE_ROOT_PATH}/.vulmix/client${appSubFolder}`

  tsconfig.compilerOptions.paths = {
    '~/*': [`./*`],
    '@/*': [`${SRC_PATH}/*`],
    '@assets/*': [`${SRC_PATH}/assets/*`],
    '@components/*': [`${SRC_PATH}/components/*`],
    '@composables/*': [`${SRC_PATH}/composables/*`],
    '@layouts/*': [`${SRC_PATH}/layouts/*`],
    '@pages/*': [`${SRC_PATH}/pages/*`],
  }

  writeTSConfig(`${ABSOLUTE_ROOT_PATH}/.vulmix/types/tsconfig.json`, tsconfig)
}

/**
 * Copy defineVulmixConfig.ts file to .vulmix/utils folder
 * @returns {void}
 */
function copyUtils() {
  fs.copyFileSync(
    `${ABSOLUTE_PACKAGE_PATH}/utils/defineVulmixConfig.ts`,
    `${ABSOLUTE_ROOT_PATH}/.vulmix/utils/defineVulmixConfig.ts`
  )

  fs.cpSync(
    `${ABSOLUTE_PACKAGE_PATH}/src/vue/components/runtime`,
    `${ABSOLUTE_ROOT_PATH}/.vulmix/runtime/components`,
    { recursive: true }
  )
}

if (CLI_OPTION === 'prepare') {
  prepare()
} else if (CLI_OPTION === 'dev') {
  dev()
} else if (CLI_OPTION === 'prod' || CLI_OPTION === 'build') {
  prod()
} else if (CLI_OPTION === 'serve') {
  serve()
} else if (CLI_OPTION === 'clean') {
  clean()
} else {
  console.log(
    `${chalk.redBright('Invalid command')}${chalk.grey(
      '. You can use:'
    )} vulxi dev|(prod|build)|serve|prepare|clean`
  )
}
