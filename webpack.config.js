var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = [
    {
        name : 'browser',
        entry : {
            client: './src/client/index.js'
        },
        output : {
            filename: '[name].js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env'],
                            plugins: ["@babel/plugin-proposal-class-properties"]
                        }
                    }
                }
            ]
        }
    },
    {
        name : 'server',
        target: 'node',
        node: {
          __dirname: false,
          __filename: false,
        },
        entry : {
            server: './src/server/index.js'
        },
        output : {
            filename: '[name].js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env'],
                            plugins: ["@babel/plugin-proposal-class-properties"]
                        }
                    }
                }
            ]
        },
        externals: nodeModules
    }
];