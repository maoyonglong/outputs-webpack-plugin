const path = require("path");

class OutputsPlugin {
    constructor(options) {
        this.options = options;
    }
    changeKeyName(obj, origin, target) {
        let value = obj[origin];
        delete obj[origin];
        obj[target] = value;
    }
    getExtension(file) {
        let parts = file.split(".");
        return parts[parts.length-1];
    }
    parseTemplate(tmp, path, name) {
        if(!path && /\[path\]/.test(tmp)) {
            throw "[path] is not defined";
        }
        path = path || "";
        return tmp.replace(/\[path\]/g, path).replace(/\[name\]/g, name).replace(/\/{2,}/g, "/");
    }
    parseSpecail(specail) {
        for(let chunk in specail) {
            let value = specail[chunk];
            if(typeof value === "object" && !(value instanceof Array)) {
                specail[chunk] = this.parseTemplate(value.template, value.path, chunk);
            }else if(typeof value === "string") {
                specail[chunk] = this.parseTemplate(value, undefined, chunk);
            }
        }
    }
    parseCommon(common) {
        let result = {};
        common.forEach(rule => {
            let chunks = rule.chunks;
            chunks.forEach(chunk => {
                let chunkPath = this.parseTemplate(rule.template, rule.path, chunk);
                result[chunk] = chunkPath;
            });
        });
        return result;
    }
    removeAsset(obj, filename) {
        delete obj[filename];
    }
    apply(compiler) {
        compiler.hooks.emit.tapPromise("OutputsPlugin", compilation => {
            return new Promise((reslove, reject) => {
                let options = this.options;
                let common = options.common;
                let eliminate = options.eliminate;
                let assets = compilation.assets;
                delete options.common;
                delete options.eliminate;
                this.parseSpecail(options);
                if(common) {
                    Object.assign(options, this.parseCommon(common));
                }
                compilation.chunks.forEach(chunk => {
                    let name = chunk.name;
                    chunk.files.forEach((filename, idx) => {
                        let extension = this.getExtension(filename);
                        if(eliminate.chunks && eliminate.chunks.indexOf(name) >= 0) {
                            this.removeAsset(assets, filename);
                            return;
                        }
                        let elimExtension = eliminate ? eliminate[extension] : false;
                        if(elimExtension && elimExtension.indexOf(name) >= 0) {
                            this.removeAsset(assets, filename);
                            return;
                        }
                        let newFilename;
                        if(name in options) {
                            newFilename = path.join(options[name], filename);
                        }
                        if(newFilename) {
                            this.changeKeyName(assets, filename, newFilename);
                        }
                    });
                }); 
                reslove();
            });    
        });
    }
}

module.exports = OutputsPlugin;