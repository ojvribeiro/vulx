import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRelativePath } from './getRelativePath.js'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const normalizePath = originalPath => {
  return originalPath.replace(/\\/g, '/')
}

const vulxiRoot = normalizePath(path.resolve(__dirname, '..'))

/**
 * Returns absolute paths
 * @returns {object} {} - absolute paths
 * @returns {string} absoluteRootPath - absolute path to the project root folder
 * @returns {string} absolutePackagePath - absolute path to the `vulmix` package folder
 * @returns {string} absolutePublicPath - absolute path to the `_dist` folder
 */
const absoluteVulmixPaths = () => {
  const absoluteRootPath = normalizePath(path.resolve(vulxiRoot, `../..`))
  const VULMIX_CONFIG_PATH = `${absoluteRootPath}/.vulmix/vulmix.config.js`
  const VulmixConfig = require(VULMIX_CONFIG_PATH).default

  const absolutePackagePath = normalizePath(
    path.resolve(vulxiRoot, `../vulmix`)
  )
  const absolutePublicPath = normalizePath(
    path.resolve(vulxiRoot, `${absoluteRootPath}/_dist`)
  )
  const absoluteSrcPath = normalizePath(
    path.resolve(
      __dirname,
      `${absoluteRootPath}/${VulmixConfig?.dirs?.src || ''}`
    )
  )

  return {
    absoluteRootPath,
    absolutePackagePath,
    absolutePublicPath,
    absoluteSrcPath,
  }
}

/**
 * Returns relative paths
 * @returns {object} {} - relative paths
 * @returns {string} relativePackagePath - relative path to the `vulmix` package folder
 * @returns {string} relativePublicPath - relative path to the `_dist` folder
 */
const relativeVulmixPaths = () => {
  const ABSOLUTE_ROOT_PATH = absoluteVulmixPaths().absoluteRootPath
  const ABSOLUTE_PACKAGE_PATH = absoluteVulmixPaths().absolutePackagePath
  const ABSOLUTE_PUBLIC_PATH = absoluteVulmixPaths().absolutePublicPath

  return {
    relativePackagePath: getRelativePath(
      ABSOLUTE_ROOT_PATH,
      ABSOLUTE_PACKAGE_PATH
    ),

    relativePublicPath: getRelativePath(
      ABSOLUTE_ROOT_PATH,
      ABSOLUTE_PUBLIC_PATH
    ),
  }
}

export { absoluteVulmixPaths, relativeVulmixPaths }
