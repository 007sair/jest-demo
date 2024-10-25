const webpack = require('webpack')
const path = require('path')
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin') // @next
const HtmlWebpackPlugin = require('html-webpack-plugin')
const StatsConfig = require('./stats.config')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const PORT = 8080

let config = {
    entry: './src/index.js', // 入口文件，src下的index.js
    output: {
        path: path.join(__dirname, 'dist'), // 出口目录，dist文件
        filename: '[name].[hash].js' // 这里name就是打包出来的文件名，因为是单入口，就是main，多入口下回分解
    },
    module: {
        rules: []
    },
    devServer: {
        public: '127.0.0.1:' + PORT,
        disableHostCheck: true,
        contentBase: path.join(__dirname, "src"), // 静态文件根目录
        port: PORT, // 端口
        host: '0.0.0.0',
        overlay: true,
        compress: true, // 服务器返回浏览器的时候是否启动gzip压缩
        inline: true,
        hot: true,
        stats: StatsConfig,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'jeet-demo',
            template: './src/index.html',
            filename: 'index.html',
        }),
        new ExtractTextWebpackPlugin({
            filename: 'css/[name].[hash].css' //放到dist/css/下
        }),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        })
    ],
}

module.exports = (env, argv) => {

    let rules = [],
        plugins = []

    if (argv.mode === 'development') {
        
        /**
         * 设置调试模式
         * 1. source-map 把映射文件生成到单独的文件，最完整最慢
         * 2. cheap-module-source-map 在一个单独的文件中产生一个不带列映射的Map
         * 3. eval-source-map 使用eval打包源文件模块,在同一个文件中生成完整sourcemap
         * 4. cheap-module-eval-source-map sourcemap和打包后的JS同行显示，没有映射列
         */
        config.devtool = 'eval-source-map';

        rules = [
            {
                test: /\.(css|scss)$/, // 转换文件的匹配正则
                // css-loader用来处理css中url的路径
                // style-loader可以把css文件变成style标签插入head中
                // 多个loader是有顺序要求的，从右往左写，因为转换的时候是从右往左转换的
                // 此插件先用css-loader处理一下css文件
                use: [
                    'style-loader',
                    'css-loader?sourceMap',
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                path: './postcss.config'
                            },
                            sourceMap: true,
                        }
                    },
                    'sass-loader?sourceMap',
                ],
                include: path.join(__dirname, 'src'), // 限制范围，提高打包速度
                exclude: /node_modules/
            }
        ]

        plugins = [
            new webpack.HotModuleReplacementPlugin() // 引入热更新插件，需要开启--hot
        ]
    }

    if (argv.mode === 'production') {
        rules = [
            {
                test: /\.(css|scss)$/, // 转换文件的匹配正则
                use: ExtractTextWebpackPlugin.extract({
                    fallback: 'style-loader',
                    //如果需要，可以在 sass-loader 之前将 resolve-url-loader 链接进来
                    use: ['css-loader', 'postcss-loader', 'sass-loader']
                }),
                include: path.join(__dirname, 'src'), // 限制范围，提高打包速度
                exclude: /node_modules/
            }
        ]

        plugins = [
            new CleanWebpackPlugin([path.join(__dirname, 'dist')])
        ]

    }

    config.module.rules = config.module.rules.concat(rules)
    config.plugins = config.plugins.concat(plugins)

    return config;
};