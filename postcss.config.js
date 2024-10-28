// 返回当前正在运行的脚本名称
const TARGET = process.env.npm_lifecycle_event;

const config = {
  plugins: [
    require('autoprefixer')({
      browsers: ['iOS >= 6', 'Android >= 4.0'],
    }),
  ],
};

if (TARGET === 'build') {
  config.plugins = config.plugins.concat([
    require('cssnano')({
      preset: 'default',
    }),
  ]);
}

module.exports = config;
