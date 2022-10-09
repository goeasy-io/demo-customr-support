const config = require('./package.json');
module.exports = {
  lintOnSave : false,
  publicPath: `/show-cs/${config.version}/agent`,
  //只有Https才能使用录音
  devServer : {
    https : false,
    port : 9002
  }
}
