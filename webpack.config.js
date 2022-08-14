const Path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = [{
    mode: 'production',
    devtool: false,
    target: 'node',
    entry: {
        index: './src/index.ts'
    },
    output: {
        path: Path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'JsonApiEntityProvider',
        libraryTarget: 'umd',
        globalObject: 'this',
        umdNamedDefine: true
    },
    externals: {
        '@dipscope/type-manager': {
            root: 'TypeManager',
            amd: '@dipscope/type-manager',
            commonjs2: '@dipscope/type-manager',
            commonjs: '@dipscope/type-manager'
        },
        '@dipscope/entity-store': {
            root: 'EntityStore',
            amd: '@dipscope/entity-store',
            commonjs2: '@dipscope/entity-store',
            commonjs: '@dipscope/entity-store'
        }
    },
    plugins: [
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            include: /src/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd()
        })
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: [{
                loader: 'ts-loader',
                options: {
                    configFile: 'tsconfig.webpack.json'
                }
            }],
            exclude: /node_modules/,
            include: [
                Path.resolve(__dirname, 'src')
            ],
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    }
}, {
    mode: 'production',
    devtool: false,
    target: 'web',
    entry: {
        index: './src/index.ts'
    },
    output: {
        path: Path.resolve(__dirname, 'dist'),
        filename: '[name].browser.js',
        library: 'JsonApiEntityProvider',
        libraryTarget: 'umd',
        globalObject: 'this',
        umdNamedDefine: true
    },
    externals: {
        '@dipscope/type-manager': {
            root: 'TypeManager',
            amd: '@dipscope/type-manager',
            commonjs2: '@dipscope/type-manager',
            commonjs: '@dipscope/type-manager'
        },
        '@dipscope/entity-store': {
            root: 'EntityStore',
            amd: '@dipscope/entity-store',
            commonjs2: '@dipscope/entity-store',
            commonjs: '@dipscope/entity-store'
        }
    },
    plugins: [
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            include: /src/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd()
        })
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: [{
                loader: 'ts-loader',
                options: {
                    configFile: 'tsconfig.webpack.json'
                }
            }],
            exclude: /node_modules/,
            include: [
                Path.resolve(__dirname, 'src')
            ],
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    }
}];
