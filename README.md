# About
With this plug-in, you can achieve multi-directory output to some extent.

# Install
```sh
npm install outputs-webpack-plugin --save-dev
```

# Usage
First, you should import the module and set filename in the output option of webpack to `[name].js`
```js
// webpack.config.js
module.exports = {
    ...
    output: {
        filename: "[name].js"
    }
};
```
Secondly, you can add your entry files in webpack.config.js. Maybe, your config is like this: 
```js
// webpack.config.js
module.exports = {
    entry: {
        a: "./a.js",
        b: "./b.js"
    },
    output: {
        filename: "[name].js",
        path: path.reslove(__dirname, "dist")
    },
    ...
};
```
> Be careful: the following code defaults to the configuration of webpack.config.js above.  

The format for using this plug-in is:
```js
// options is a json object.
new outputsPlugin(options);
```
## Options
### Separate rules
```js
{
    // chunkName : path
    a: "a"
}
// This will create "a.js" in dist/a
```
Also, you can use [name] to represent the chunk name in path string.
```js
{
    a: "[name]/[name]"
}
// This will create "a.js" in dist/a/a
```
In addition, you can use template, [path] and [name] to set the output path relative to dist.
```js
{
    // chunkName: object
    a: {
        template: "[path][name]",
        path: "pathUrl"
    }
    // The [path] of template will be change to pathUrl, and the [name] will be change to chunkName. And they will be join by "/" to be the output path relative to dist
    // So, this will create "pathUrl/a/a.js" in dist.
}
```
> tip: you can only use template without path property, and plugin will ignore "[path]" and regard template as the output path
### Common rules
Sometimes, you need to set the common rules to output files. You can use the key of options "common".
```js
{
    common: [
        // rule 1
        {
            // chunks applying the rule
            chunks: ["a", "b"],
            template: "[name]"
        },
        // other rules
    ]
    // also, you can use path property as before
    /*
    common: [
        {
            chunks: ["a", "b"],
            template: "[path][name]",
            path: ""
        }
    ]
    */

   // This will create "a/a.js" and "b/b.js" in dist
}
```
## Eliminate
With "eliminate" option, you can remove some chunks or files out of output assets.
```js
// eliminate chunk name
{
    eliminate: {
        // the extension of output file : array consists of chunk name
        js: ["a"]
    }
}
// if you don't want to remove all files in a chunk, you should use "filename"
{
    eliminate: {
        // the chunks to remove all files
        chunks: ["a"],
        // extension : chunks
        // -> remove b.js
        js: ["b"]
    }
}
// This means remove all files created by chunk "a", and remove the "b.js" in chunk "b"
```
# Examples
### Example One
```js
// webpack.config.js
const outputsPlugin = require("outputs-webpack-plugin");
module.exports = {
    ...
    plugins: [
        new outputsPlugin({
            // chunkName : path
            // => outputPath: path + chunkName
            a: "[name]",
            b: "[name]"
        });
    ] 
};
```
The result of output is:  
![special](/images/special.jpg)  
Now use the common option to achieve the same result.
```js
...
module.exports = {
    ...
    plugins: [
        new outputsPlugin({
            common: [
                {
                    chunks: ["a", "b"],
                    template: "[name]"
                }
            ]
        });
    ]
};
```
### Example Two
When you use sass-loader, you maybe only need css file, but not js file.
```js
module.exports = {
    mode: "development",
    entry: {
        "a": "./a.scss",
        "b": "./b.scss"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        "css-loader", 
                        {
                            loader: "sass-loader",
                            options: {
                                outputStyle: "expanded",
                                chunkFilename: "[name]"
                            }                        
                        }
                    ]
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: "[name].css"
        }),
        new outputsPlugin({
            common: [
                {
                    chunks: ["a", "b"],
                    template: "[name]"
                }
            ],
            eliminate: {
                js: ["a", "b"]
            }
        })
    ]
};
```
The result is :  
![eliminate](/images/eliminate.jpg)