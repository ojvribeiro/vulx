import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRelativePath } from './getRelativePath.js'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const normalizePath = originalPath => {
  return originalPath.replace(/\\/g, '/')
}

const isDevMode = !fs.existsSync(
  path.resolve(__dirname, '../../../vulmix.config.ts')
)

/**
 * Returns absolute paths
 * @returns {object} {} - absolute paths
 * @returns {string} absoluteRootPath - absolute path to the project root folder
 * @returns {string} absolutePackagePath - absolute path to the `vulmix` package folder
 * @returns {string} absolutePublicPath - absolute path to the `_dist` folder
 */
const absoluteVulmixPaths = () => {
  return {
    absoluteRootPath:
      isDevMode === true
        ? normalizePath(path.resolve(__dirname, '../../../demo'))
        : normalizePath(path.resolve(__dirname, '../../..')),

    absolutePackagePath:
      isDevMode === true
        ? normalizePath(path.resolve(__dirname, '../../..'))
        : normalizePath(path.resolve(__dirname, '../../vulmix')),

    absolutePublicPath:
      isDevMode === true
        ? normalizePath(path.resolve(__dirname, '../../../demo/_dist'))
        : normalizePath(path.resolve(__dirname, '../../../_dist')),
  }
}

/**
 * Returns relative paths
 * @returns {object} {} - relative paths
 * @returns {string} relativePackagePath - relative path to the `vulmix` package folder
 * @returns {string} relativePublicPath - relative path to the `_dist` folder
 */
const relativeVulmixPaths = () => {
  const ABSOLUTE_ROOT_PATH = absoluteVulmixPaths(isDevMode).absoluteRootPath
  const ABSOLUTE_PACKAGE_PATH =
    absoluteVulmixPaths(isDevMode).absolutePackagePath
  const ABSOLUTE_PUBLIC_PATH = absoluteVulmixPaths(isDevMode).absolutePublicPath

  return {
    relativePackagePath:
      isDevMode === true
        ? getRelativePath(ABSOLUTE_PACKAGE_PATH, ABSOLUTE_PACKAGE_PATH)
        : getRelativePath(ABSOLUTE_ROOT_PATH, ABSOLUTE_PACKAGE_PATH),

    relativePublicPath:
      isDevMode === true
        ? getRelativePath(ABSOLUTE_PACKAGE_PATH, ABSOLUTE_PUBLIC_PATH)
        : getRelativePath(ABSOLUTE_ROOT_PATH, ABSOLUTE_PUBLIC_PATH),
  }
}

export { absoluteVulmixPaths, relativeVulmixPaths, isDevMode }
