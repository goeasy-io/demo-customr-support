module.exports = {
  configureWebpack: config => {
      // 为生产环境修改配置...
      if (process.env.NODE_ENV === 'production') {
          config.mode = 'production';
          // 打包文件大小配置
          config.performance = {
            maxEntrypointSize: 10000000,
            maxAssetSize: 30000000
          }
      }
  },
}