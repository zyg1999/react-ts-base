const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const dev = require('./webpack.dev')
const prod = require('./webpack.prod')

const merge = require('webpack-merge')
module.exports = env => {
  //env环境变量
  console.log(env)
  const isDev = env.development
  const base = {
    entry: path.resolve(__dirname, '../src/index.tsx'),
    module: {
      //转换什么文件 用什么转，用哪些loader
      rules: [
        {
          // 解析js文件 默认会调用@babel/core
          test: /\.tsx?$/,
          use: 'babel-loader'
        },
        {
          test: /\.tsx?$/,
          use: ['ts-loader'],
          include: path.resolve(__dirname, './src'),
          exclude: /node_modules/
        },
        {
          test: /\.(jsx?|tsx?)$/,
          enforce: 'pre',
          include: path.resolve(__dirname, './src'),
          exclude: /node_modules/,
          use: [
            {
              loader: 'eslint-loader',
              options: { fix: true }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            // 是不是开发环境 如果是就用style-loader
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                // 给loader传递参数
                // 如果css文件引入其他文件@import
                importLoaders: 2
              }
            },
            'postcss-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          // 图标的转化
          test: /\.(woff|ttf|eot)$/,
          use: 'file-loader'
        },
        {
          // 图片的转化
          test: /\.(jpe?g|png|gif|svg)$/,
          use: {
            loader: 'url-loader',
            // 如果大于100k的图片 会使用file-loader
            options: {
              name: 'image/[contentHash].[ext]',
              limit: 1024
            }
          } //将满足条件的图片转化成base64,不满足条件的url-loader会自动调用file-loader来进行处理
        }
      ]
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, '../dist')
    },
    plugins: [
      !isDev &&
        new MiniCssExtractPlugin({
          //若开发模式，则不抽离样式
          filename: 'css/[name].[contentHash].css'
        }), //每次打包前 先清除dist文件夹 不配置默认清空dist

      new HtmlWebpackPlugin({
        filename: 'index.html', // 打包出来的文件名
        template: path.resolve(__dirname, '../public/index.html'),
        hash: true, // 在引用资源的后面增加hash戳
        minify: !isDev && {
          removeAttributeQuotes: true, // 删除属性双引号
          collapseWhitespace: true //折叠html
        }
      })
    ].filter(Boolean)
  }

  if (isDev) {
    return merge(base, dev)
  } else {
    return merge(base, prod)
  }
}
