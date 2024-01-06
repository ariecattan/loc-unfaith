const { defineConfig } = require('@vue/cli-service')
module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    devtool: 'source-map'
  }
}

