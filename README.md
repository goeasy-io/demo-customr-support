## GoEasy IM在线客服

GoEasy IM在线客服，帮助开发者在现有的app、小程序和网站中，快速集成一个强大，方便易用在线客服功能。

比如：
* 电商平台的商家在线咨询
* APP加入在线客服功功能，用户就可以随时随地的获得帮助，或者向平台进行意见反馈
* 访问网站的客户，通过网页的在线客服功能获得帮助

### 主要功能
1. 客服人员上线/下线
2. 待接入会话提醒
3. 会话接入
4. 发送文字、图片、视频、语音
5. 发送自定义消息（订单，处方等）
6. 历史消息查询
7. 同一用户多端设备消息同步
8. 会话转接

### 示例在线体验和开发文档

#### [在线客服系统示例在线体验（免注册）](https://www.goeasy.io/cn/demos/demos.html#cs)
#### [开发者文档](https://docs.goeasy.io/2.x/cs/intro)



### 运行步骤

##### 获取appkey

1. 注册goeasy账号: https://www.goeasy.io
2. 登录goeasy控制台，创建应用，获取appkey


##### 用户端Customer

1. HbuilerX打开客服端代码，路径/customer/uniapp/src
2. main.js里将appkey替换为自己应用的Common key (注意，BC-开头的)
3. 运行


##### 客服端Support


1. 命令行进入项目路径/support/web, npm ci
2. /support/web/src/main.js里将appkey替换为自己应用的Common key (注意，BC-开头的)
3. 执行npm run serve 运行

