const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  productionSourceMap: false,
  transpileDependencies: ['vuetify'],
  chainWebpack: (config) => {
    config.resolve.alias.set('@shared', path.resolve(__dirname, '../shared'));
  },
});
