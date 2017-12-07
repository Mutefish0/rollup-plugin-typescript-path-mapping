const fs = require('fs')
const path = require('path')

function reEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

function isRelativeModuleId(id) {
    return /^\.+\//.test(id)
}

let exts = ['.js', '.json']

module.exports = function (options) {
    options = options || {}

    let compilerOptions
    if (options.tsconfig) {
        compilerOptions = JSON.parse(fs.readFileSync('tsconfig.json')).compilerOptions
    }

    let paths = compilerOptions && compilerOptions.paths || options.paths
    let baseUrl = compilerOptions && compilerOptions.baseUrl || options.baseUrl
    let outDir = compilerOptions && compilerOptions.outDir || options.outDir
    let rootDir = compilerOptions && compilerOptions.rootDir || options.rootDir

    if (!(paths && baseUrl && outDir && rootDir)) {
        throw new Error('rollup-plugin-typescript-path-mapping: both `paths`, `baseUrl`, `outDir`, `rootDir` are required, in plugin\'s options or tsconfig\'s compilerOptions.')
    }

    let rootDirPrefixRe = new RegExp(reEscape(path.resolve(rootDir)))

    function redirecToDir(modulePath) {
        return modulePath.replace(rootDirPrefixRe, path.resolve(outDir))
    }

    return {
        name: 'typescript-path-mapping',
        resolveId: function (id) {
            if (isRelativeModuleId(id)) {
                return null
            } else {
                let mappedModuleId
                for (let rule in paths) {
                    let prefixRule = rule.replace(/\*$/, '')
                    if (id.indexOf(prefixRule) == 0) {
                        let wildCardPart = id.slice(prefixRule.length)
                        for (let mapTo of paths[rule]) {
                            mappedModuleId = baseUrl + mapTo.replace(/\*$/, wildCardPart)
                            let absoluteModulePath = path.resolve(mappedModuleId)
                            let redirectedModulePath = redirecToDir(absoluteModulePath)
                            for (let ext of exts) {
                                if (fs.existsSync(redirectedModulePath + ext)) {
                                    return redirectedModulePath + ext
                                }
                            }
                        }
                    }
                }
            }
            return null
        }
    }
}