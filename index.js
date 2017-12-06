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
    let redirectDir = compilerOptions && compilerOptions.outDir || options.redirectDir

    let redirectDirSuffixRe = new RegExp(reEscape(redirectDir) + '$')
    let redirectReplaceRe = new RegExp([
        '^(',
        reEscape(path.resolve(redirectDir).replace(redirectDirSuffixRe, '')),
        ')[^/]*\/'
    ].join(''))

    function redirecToDir(path) {
        return path.replace(redirectReplaceRe, '$1' + redirectDir.replace(/([^/])$/, '$1/'))
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