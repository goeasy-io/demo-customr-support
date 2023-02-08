<template>
  <view class="chatInterface">
    <view class="scroll-view">
      <image v-if="history.loading" class="history-loaded" src="/static/images/loading.svg"/>
      <view v-else :class="history.allLoaded ? 'history-loaded':'load'" @click="loadHistoryMessage(false)">
        <view>{{ history.allLoaded ? '已经没有更多的历史消息' : '点击获取历史消息' }}</view>
      </view>

      <view class="message-list">
        <view v-for="(message,index) in history.messages" :key="message.messageId">
          <view class="time-lag">
            {{ renderMessageDate(message, index) }}
          </view>
          <view class="message-item">
            <view v-if="message.type === 'CS_ACCEPT'" class="accept-message">
              {{ message.senderData.name }}已接入
            </view>
            <view v-else-if="message.type === 'CS_END'" class="accept-message">
              {{ message.senderData.name }}已结束会话
            </view>
            <div v-else-if="message.type === 'CS_TRANSFER'" class="accept-message">
              {{ message.payload.transferTo.data.name }}已接入
            </div>
            <view v-else :class="{'self' : message.senderId ===  currentCustomer.id}" class="message-item-content">
              <view class="avatar">
                <image :src="message.senderId === currentCustomer.id? currentCustomer.avatar : shop.avatar"></image>
              </view>
              <view class="content">
                <view v-if="message.senderId !== currentCustomer.id" class="staff-name">
                  {{ message.senderData.name }}
                </view>
                <view class="message-payload">
                  <b v-if="message.status === 'sending'" class="pending"></b>
                  <b v-if="message.status === 'fail'" class="send-fail"></b>
                  <view v-if="message.type === 'text'" v-html="renderTextMessage(message)"></view>
                  <image v-if="message.type === 'image'"
                     :data-url="message.payload.url"
                     :src="message.payload.url"
                     :style="{height: getImageHeight(message.payload.width,message.payload.height)+'rpx' }"
                     class="image-content"
                     mode="heightFix"
                     @click="showImageFullScreen"
                  ></image>
                  <view v-if="message.type === 'video'" :data-url="message.payload.video.url"
                        class="video-snapshot" @click="playVideo">
                    <image
                      :src="message.payload.thumbnail.url"
                      :style="{height: getImageHeight(message.payload.thumbnail.width,message.payload.thumbnail.height)+'rpx' }"
                      mode="heightFix"
                    ></image>
                    <view class="video-play-icon"></view>
                  </view>
                  <view v-if="message.type ==='audio'" class="audio-content" @click="playAudio(message)">
                    <view class="audio-facade" :style="{width:Math.ceil(message.payload.duration)*7 + 50 + 'px'}">
                      <view
                        class="audio-facade-bg"
                        :class="{'play-icon':audioPlayer.playingMessage && audioPlayer.playingMessage.messageId === message.messageId}"
                      ></view>
                      <view>{{Math.ceil(message.payload.duration) || 1}}<span>"</span></view>
                    </view>
                  </view>
                  <view v-if="message.type === 'order'" class="order-content">
                    <view class="order-id">订单号：{{ message.payload.id }}</view>
                    <view class="order-body">
                      <image :src="message.payload.url" class="order-img"></image>
                      <view>
                        <view class="order-name">{{ message.payload.name }}</view>
                        <view class="order-info">
                          <view class="order-price">{{ message.payload.price }}</view>
                          <view class="order-count">共{{ message.payload.count }}件</view>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="action-box">
      <view class="action-top">
        <view @click="switchAudioKeyboard">
          <image class="more" v-if="audio.visible" src="/static/images/jianpan.png"></image>
          <image class="more" v-else src="/static/images/audio.png"></image>
        </view>
        <view v-if="audio.visible" class="record-input" @click="onRecordStart" @touchend="onRecordEnd" @touchstart="onRecordStart">
          {{ audio.recording ? '松开发送' : '按住录音' }}
        </view>
        <!-- GoEasyIM最大支持3k的文本消息，如需发送长文本，需调整输入框maxlength值 -->
        <input v-else v-model="text" @confirm="sendTextMessage" class="consult-input" maxlength="700" placeholder="发送消息" type="text" />
        <view @click="switchEmojiKeyboard">
          <image class="more" v-if="emoji.visible" src="/static/images/jianpan.png"></image>
          <image class="more" v-else src="/static/images/emoji.png"></image>
        </view>
        <view>
          <image @click="showOtherTypesMessagePanel()" class="more" src="/static/images/more.png"/>
        </view>
        <view v-if="text" class="send-btn-box">
          <text class="btn" @click="sendTextMessage()">发送</text>
        </view>
      </view>
      <!--展示表情列表-->
      <view v-if="emoji.visible" class="action-bottom action-bottom-emoji">
        <image v-for="(emojiItem, emojiKey, index) in emoji.map" :key="index" :src="emoji.url + emojiItem"
               class="emoji-item" @click="chooseEmoji(emojiKey)"></image>
      </view>
      <!--其他类型消息面板-->
      <view v-if="otherTypesMessagePanelVisible" class="action-bottom">
        <view class="more-icon">
          <image @click="sendImageMessage()" class="operation-icon" src="/static/images/picture.png"></image>
          <view class="operation-title">图片</view>
        </view>
        <view class="more-icon">
          <image @click="sendVideoMessage()" class="operation-icon" src="/static/images/video.png"></image>
          <view class="operation-title">视频</view>
        </view>
        <view class="more-icon">
          <image @click="showOrderMessageList()" class="operation-icon" src="/static/images/order.png"></image>
          <view class="operation-title">订单</view>
        </view>
      </view>
    </view>
    <view v-if="audio.recording" class="record-loading"></view>
    <video v-if="videoPlayer.visible" id="videoPlayer" :src="videoPlayer.url"
           @fullscreenchange="onVideoFullScreenChange"></video>
    <view v-if="orderList.visible" class="order-list">
      <view class="orders-content">
        <view class="title">
          <view>请选择一个订单</view>
          <view class="close" @click="hideOrderMessageList">×</view>
        </view>
        <view class="orders">
          <view
            v-for="(order, index) in orderList.orders"
            :key="index" class="order-item"
            @click="sendOrderMessage(order)"
          >
            <view class="order-id">订单号：{{ order.id }}</view>
            <view class="order-body">
              <image :src="order.url" class="order-img"></image>
              <view class="order-name">{{ order.name }}</view>
              <view class="order-right">
                <view class="order-price">{{ order.price }}</view>
                <view class="order-count">共{{ order.count }}件</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import restApi from '../lib/restapi';
  import { formatDate } from '../lib/utils';
  import EmojiDecoder from '../lib/EmojiDecoder';

  const recorderManager = uni.getRecorderManager();
  const IMAGE_MAX_WIDTH = 200;
  const IMAGE_MAX_HEIGHT = 150;
  export default {
    data() {
      const emojiUrl = 'https://imgcache.qq.com/open/qcloud/tim/assets/emoji/';
      const emojiMap = {
        '[么么哒]': 'emoji_3@2x.png',
        '[乒乓]': 'emoji_4@2x.png',
        '[便便]': 'emoji_5@2x.png',
        '[信封]': 'emoji_6@2x.png',
        '[偷笑]': 'emoji_7@2x.png',
        '[傲慢]': 'emoji_8@2x.png'
      };

      return {

        currentCustomer: {},
        shop: {},
        to: {},// 作为createMessage的参数
        from: '',// 记录上一个页面的路径
        text: '',
        //定义表情列表
        emoji: {
          url: emojiUrl,
          map: emojiMap,
          visible: false,
          decoder: new EmojiDecoder(emojiUrl, emojiMap),
        },
        //是否展示‘其他消息类型面板’
        otherTypesMessagePanelVisible: false,
        orderList: {
          orders: [],
          visible: false
        },
        history: {
          messages: [],
          allLoaded: false,
          loading: true
        },
        audio: {
          startTime: null,
          //语音录音中
          recording: false,
          //录音按钮展示
          visible: false
        },
        audioPlayer: {
          innerAudioContext: null,
          playingMessage: null,
        },
        videoPlayer: {
          visible: false,
          url: '',
          context: null
        },
      }
    },
    onLoad(options) {
      this.from = options.from;
      this.shop = JSON.parse(options.to);
      this.to = {
        id: this.shop.id,
        type: this.GoEasy.IM_SCENE.CS,
        data: {
          name: this.shop.name,
          avatar: this.shop.avatar
        }
      };
      this.currentCustomer = getApp().globalData.currentCustomer;
      this.markMessageAsRead();
      this.loadHistoryMessage(true);
      // 语音播放器
      this.initialAudioPlayer();
      // 录音监听器
      this.initRecorderListeners();
      this.goEasy.im.on(this.GoEasy.IM_EVENT.CS_MESSAGE_RECEIVED, this.onMessageReceived);
    },
    onReady() {
      this.videoPlayer.context = uni.createVideoContext('videoPlayer', this);
      uni.setNavigationBarTitle({
        title: this.shop.name
      });
    },
    onShow() {
      this.otherTypesMessagePanelVisible = false;
      this.emoji.visible = false;
    },
    beforeDestroy() {
      this.goEasy.im.off(this.GoEasy.IM_EVENT.CS_MESSAGE_RECEIVED, this.onMessageReceived);
    },
    methods: {
      onNavigationBarButtonTap(e) {
        uni.switchTab({ url: `./${this.from}` });
      },
      /**
       * 核心就是设置高度，产生明确占位
       *
       * 小 (宽度和高度都小于预设尺寸)
       *    设高=原始高度
       * 宽 (宽度>高度)
       *    高度= 根据宽度等比缩放
       * 窄 (宽度<高度)或方(宽度=高度)
       *    设高=MAX height
       *
       * @param width,height
       * @returns number
       */
      getImageHeight(width, height) {
        if (width < IMAGE_MAX_WIDTH && height < IMAGE_MAX_HEIGHT) {
          return height * 2;
        } else if (width > height) {
          return (IMAGE_MAX_WIDTH / width * height) * 2;
        } else if (width === height || width < height) {
          return IMAGE_MAX_HEIGHT * 2;
        }
      },
      renderMessageDate(message, index) {
        if (index === 0) {
          return formatDate(message.timestamp)
        } else {
          if (message.timestamp - this.history.messages[index - 1].timestamp > 5 * 60 * 1000) {
            return formatDate(message.timestamp)
          }
        }
        return '';
      },
      initialAudioPlayer () {
        this.audioPlayer.innerAudioContext = uni.createInnerAudioContext();
        this.audioPlayer.innerAudioContext.onEnded(() => {
          this.audioPlayer.playingMessage = null;
        });
        this.audioPlayer.innerAudioContext.onStop(() => {
          this.audioPlayer.playingMessage = null;
        });
      },
      initRecorderListeners() {
        // 监听录音开始
        recorderManager.onStart(() => {
          this.audio.recording = true;
          this.audio.startTime = Date.now();
        });
        //录音结束后，发送
        recorderManager.onStop((res) => {
          let endTime = Date.now();
          this.audio.recording = false;
          let duration = endTime - this.audio.startTime;
          if (duration < 1000) {
            uni.showToast({
              icon: 'error',
              title: '录音时间太短',
              duration: 500
            });
            return;
          }
          res.duration = duration;
          this.sendAudioMessage(res);
        });
        // 监听录音报错
        recorderManager.onError((res) => {
          this.audio.recording = false;
          recorderManager.stop();
          uni.showToast({
            icon: 'none',
            title: '录音失败,请检查麦克风权限',
            duration: 1000
          });
        })
      },
      renderTextMessage(message) {
        return '<span class="text-content">' + this.emoji.decoder.decode(message.payload.text) + '</span>'
      },
      onMessageReceived(message) {
        if (message.teamId === this.shop.id) {
          this.history.messages.push(message);
          this.markMessageAsRead();
          this.scrollToBottom();
        }
      },
      switchEmojiKeyboard() {
        this.emoji.visible = !this.emoji.visible;
        this.otherTypesMessagePanelVisible = false;
      },
      showOtherTypesMessagePanel() {
        this.otherTypesMessagePanelVisible = !this.otherTypesMessagePanelVisible;
        this.emoji.visible = false;
      },
      chooseEmoji(emojiKey) {
        this.text += emojiKey;
      },
      sendAudioMessage(file) {
        this.goEasy.im.createAudioMessage({
          to: this.to,
          file: file,
          notification: {
            title: this.currentCustomer.name + '发来一段语音',
            body: '[语音消息]'		// 字段最长 50 字符
          },
          onProgress: function (progress) {
            console.log(progress)
          },
          onSuccess: (message) => {
            this.sendMessage(message);
          },
          onFailed: (e) => {
            console.log('error :', e);
          }
        });
      },
      sendTextMessage() {
        if (this.text.trim() !== '') {
          let body = this.text;
          if (this.text.length >= 50) {
            body = this.text.substring(0, 30) + '...';
          }
          this.goEasy.im.createTextMessage({
            text: this.text,
            to: this.to,
            notification: {
              title: this.currentCustomer.name + '发来一段文字',
              body: body
            },
            onSuccess: (message) => {
              this.sendMessage(message);
            },
            onFailed: (e) => {
              console.log('error :', e);
            }
          });
        }
        this.text = '';
      },
      sendMessage(message) {
        this.history.messages.push(message);
        this.scrollToBottom();
        this.goEasy.im.sendMessage({
          message: message,
          onSuccess: function (message) {
            console.log('发送成功.', message);
          },
          onFailed: function (error) {
            if (error.code === 507) {
              uni.showModal({
                title: '发送语音/图片/视频/文件失败',
                content: '没有配置OSS存储, 详情参考GoEasy官方文档'
              });
              console.log('发送语音/图片/视频/文件失败，没有配置OSS存储，详情参考：https://www.goeasy.io/cn/docs/goeasy-2.x/im/message/media/send-media-message.html');
            } else {
              console.log('发送失败:', error);
            }
          }
        });
      },
      scrollToBottom() {
        this.$nextTick(() => {
          uni.pageScrollTo({
            scrollTop: 2000000,
            duration: 0
          });
        });
      },
      loadHistoryMessage(scrollToBottom) {//历史消息
        this.history.loading = true;
        let lastMessageTimeStamp = null;
        let lastMessage = this.history.messages[0];
        if (lastMessage) {
          lastMessageTimeStamp = lastMessage.timestamp;
        }
        this.goEasy.im.history({
          type: this.GoEasy.IM_SCENE.CS,
          id: this.shop.id,
          lastTimestamp: lastMessageTimeStamp,
          limit: 10,
          onSuccess: (result) => {
            this.history.loading = false;
            let messages = result.content;
            if (messages.length === 0) {
              this.history.allLoaded = true;
            } else {
              if (lastMessageTimeStamp) {
                this.history.messages = messages.concat(this.history.messages);
              } else {
                this.history.messages = messages;
              }
              if (messages.length < 10) {
                this.history.allLoaded = true;
              }
              if (scrollToBottom) {
                this.scrollToBottom();
              }
            }
          },
          onFailed: (error) => {
            //获取失败
            console.log('获取历史消息失败:', error);
            this.history.loading = false;
          }
        });
      },
      switchAudioKeyboard() {
        this.audio.visible = !this.audio.visible;
      },
      onRecordStart() {
        try {
          recorderManager.start();
        } catch (e) {
          uni.showModal({
            title: '录音错误',
            content: '请在app和小程序端体验录音，Uni官方明确H5不支持getRecorderManager, 详情查看Uni官方文档'
          });
        }
      },
      onRecordEnd() {
        try {
          recorderManager.stop();
        } catch (e) {
          console.log(e);
        }
      },
      sendVideoMessage() {
        uni.chooseVideo({
          success: (res) => {
            this.goEasy.im.createVideoMessage({
              to: this.to,
              file: res,
              notification: {
                title: this.currentCustomer.name + '发来一个视频',
                body: '[视频消息]'
              },
              onProgress: function (progress) {
                console.log(progress)
              },
              onSuccess: (message) => {
                this.otherTypesMessagePanelVisible = false;
                this.sendMessage(message);
              },
              onFailed: (e) => {
                console.log('error :', e);
              }
            });
          }
        })
      },
      sendImageMessage() {
        uni.chooseImage({
          count: 9,
          success: (res) => {
            res.tempFiles.forEach(file => {
              this.goEasy.im.createImageMessage({
                to: this.to,
                file: file,
                notification: {
                  title: this.currentCustomer.name + '发来一张图片',
                  body: '[图片消息]'
                },
                onProgress: function (progress) {
                  console.log(progress)
                },
                onSuccess: (message) => {
                  this.otherTypesMessagePanelVisible = false;
                  this.sendMessage(message);
                },
                onFailed: (e) => {
                  console.log('error :', e);
                }
              });
            })
          }
        });
      },
      showOrderMessageList() {
        this.orderList.orders = restApi.getOrderList();
        this.orderList.visible = true;
      },
      hideOrderMessageList() {
        this.orderList.visible = false;
      },
      sendOrderMessage(order) {
        //GoEasyIM自定义消息,实现订单发送
        this.goEasy.im.createCustomMessage({
          type: 'order',
          payload: order,
          to: this.to,
          notification: {
            title: this.currentCustomer.name + '发来一个订单',
            body: '[订单消息]'
          },
          onSuccess: (message) => {
            this.otherTypesMessagePanelVisible = false;
            this.sendMessage(message);
          },
          onFailed: (e) => {
            console.log('error :', e);
          }
        });
        this.orderList.visible = false;
      },
      showImageFullScreen(e) {
        let imagesUrl = [e.currentTarget.dataset.url];
        uni.previewImage({
          urls: imagesUrl
        });
      },
      playVideo(e) {
        this.videoPlayer.visible = true;
        this.videoPlayer.url = e.currentTarget.dataset.url;
        this.$nextTick(() => {
          this.videoPlayer.context.requestFullScreen({
            direction: 0
          });
          this.videoPlayer.context.play();
        });
      },
      playAudio (audioMessage) {
        let playingMessage = this.audioPlayer.playingMessage;

        if (playingMessage) {
          this.audioPlayer.innerAudioContext.stop();
          // 如果点击的消息正在播放，就认为是停止播放操作
          if (playingMessage === audioMessage) {
            return;
          }
        }
        this.audioPlayer.playingMessage = audioMessage;
        this.audioPlayer.innerAudioContext.src = audioMessage.payload.url;
        this.audioPlayer.innerAudioContext.play();
      },
      onVideoFullScreenChange(e) {
        //当退出全屏播放时，隐藏播放器
        if (this.videoPlayer.visible && !e.detail.fullScreen) {
          this.videoPlayer.visible = false;
          this.videoPlayer.context.stop();
        }
      },
      markMessageAsRead() {
        this.goEasy.im.markMessageAsRead({
          type: this.GoEasy.IM_SCENE.CS,
          id: this.shop.id,
          onSuccess: function () {
            console.log('标记已读成功');
          },
          onFailed: function (error) {
            console.log("标记已读失败", error);
          }
        });
      }
    }
  }
</script>

<style>
  page {
    height: 100%;
  }

  .chatInterface {
    height: 100%;
    background-color: #F1F1F1;
    display: flex;
    flex-direction: column;
  }

  .scroll-view {
    padding-left: 20rpx;
    padding-right: 20rpx;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 120rpx;
    background-color: #F1F1F1;
    flex: 1;
  }

  .history-loading {
    width: 100%;
    text-align: center;
  }

  .history-loading image {
    width: 20rpx;
    height: 20rpx;
  }

  .scroll-view .history-loaded {
    font-size: 24rpx;
    height: 60rpx;
    line-height: 60rpx;
    width: 100%;
    text-align: center;
    color: #cccccc;
  }

  .scroll-view .load {
    font-size: 24rpx;
    height: 60rpx;
    line-height: 60rpx;
    margin: 15rpx 0;
    width: 100%;
    text-align: center;
    color: #d02129;
  }

  .scroll-view .message-item {
    display: flex;
    margin: 20rpx 0;
  }

  .scroll-view .message-item .message-item-content {
    flex: 1;
    overflow: hidden;
    display: flex;
  }

  .scroll-view .message-item .message-item-content.self {
    overflow: hidden;
    display: flex;
    justify-content: flex-start;
    flex-direction: row-reverse;
  }

  .scroll-view .message-item .avatar {
    width: 80rpx;
    height: 80rpx;
    flex-shrink: 0;
    flex-grow: 0;
  }

  .scroll-view .message-item .avatar image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .scroll-view .message-item .accept-message {
    width: 100%;
    text-align: center;
    color: #333333;
    font-size: 28rpx;
  }

  .scroll-view .content {
    font-size: 34rpx;
    line-height: 44rpx;
    margin: 0 20rpx;
    max-width: 520rpx;
    display: flex;
    flex-direction: column;
  }

  .scroll-view .content .staff-name {
    font-size: 28rpx;
    color: #888888;
  }

  .scroll-view .content .message-payload {
    display: flex;
    align-items: center;
  }

  .scroll-view .content .image-content {
    border-radius: 12rpx;
  }

  .scroll-view .content .text-content img {
    width: 50rpx;
    height: 50rpx;
  }

  .scroll-view .content .order-content {
    border-radius: 20rpx;
    background: #FFFFFF;
    padding: 16rpx;
    display: flex;
    flex-direction: column;
  }

  .audio-content {
    height: 86rpx;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .audio-content .audio-facade {
    min-width: 20rpx;
    padding: 6rpx 10rpx;
    line-height: 72rpx;
    background: #FFFFFF;
    font-size: 24rpx;
    border-radius: 14rpx;
    color: #000000;
    display: flex;
    flex-direction: row-reverse;
  }

  .audio-content .audio-facade-bg {
    background: url("/static/images/voice.png") no-repeat center;
    background-size: 30rpx;
    width: 40rpx;
    transform: rotate(180deg);
  }

  .audio-content .audio-facade-bg.play-icon {
    background: url("/static/images/play.gif") no-repeat center;
    background-size: 30rpx;
  }

  .scroll-view .content .order-id {
    color: #333333;
  }

  .scroll-view .content .order-body {
    padding: 10rpx;
  }

  .scroll-view .content .order-name {
    font-weight: normal;
  }

  .scroll-view .content .order-info {
    display: flex;
    justify-content: space-between;
    padding: 10rpx;
  }

  .scroll-view .content .order-info .order-price {
    font-weight: normal;
  }

  .scroll-view .content .pending {
    background: url("~@/static/images/pending.gif") no-repeat center;
    background-size: 30rpx;
    width: 30rpx;
    height: 30rpx;
    margin-right: 10rpx;
  }

  .scroll-view .content .send-fail {
    background: url("~@/static/images/failed.png") no-repeat center;
    background-size: 30rpx;
    width: 30rpx;
    height: 30rpx;
    margin-right: 10rpx;
  }

  .action-box {
    display: flex;
    backdrop-filter: blur(0.27rpx);
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    flex-direction: column;
    background-color: #F1F1F1;
  }

  .action-box .action-top {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    background: #F6F6F6;
    backdrop-filter: blur(27.1828px);
    border-top: 1px solid #ECECEC;
    padding: 0 20rpx;
  }

  .consult-input {
    flex: 1;
    height: 80rpx;
    padding-left: 20rpx;
    margin: 20rpx;
    margin-left: 0;
    border: none;
    outline: none;
    box-sizing: border-box;
    border-radius: 6px;
    background: #FFFFFF;
    font-size: 32rpx;
  }

  .more {
    width: 62rpx;
    height: 62rpx;
    margin-right: 10rpx;
    display: flex;
  }

  .send-btn-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 110rpx;
    height: 60rpx;
    border-radius: 10rpx;
    background: #D02129;

  }

  .send-btn-box .btn {
    color: #FFFFFF;
    font-size: 28rpx;
  }

  .action-box .action-bottom .more-icon {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 0 30rpx;
  }

  .action-box .action-bottom .operation-icon {
    width: 60rpx;
    height: 60rpx;
    min-width: 60rpx;
    min-height: 60rpx;
    padding: 25rpx;
    border-radius: 20rpx;
    background: #FFFFFF;
  }
  .action-box .action-bottom .operation-title {
    font-size: 24rpx;
    line-height: 50rpx;
    color: #82868E;
  }

  .action-box .action-top .record-input {
    flex: 1;
    width: 480rpx;
    height: 80rpx;
    line-height: 80rpx;
    padding-left: 20rpx;
    margin: 20rpx;
    margin-left: 0;
    border: none;
    outline: none;
    box-sizing: border-box;
    border-radius: 6px;
    background: #cccccc;
    color: #FFFFFF;
    font-size: 28rpx;
    text-align: center;
  }

  .action-bottom {
    height: 300rpx;
    width: 100%;
    padding: 20rpx;
    box-sizing: border-box;
    display: flex;
  }

  .action-bottom-emoji {
    justify-content: space-around;
  }

  .action-bottom image {
    width: 100rpx;
    height: 100rpx;
  }

  .record-loading {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 300rpx;
    height: 300rpx;
    margin: -150rpx -150rpx;
    background: #262628;
    background: url("~@/static/images/recording-loading.gif") no-repeat center;
    background-size: 100%;
    border-radius: 40rpx;
  }

  .video-player {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background: rgba(0,0,0,.8);
  }

  .video-player uni-video {
    width: 100%;
    height: 100%;
  }

  .img-layer uni-image {
    height: 100% !important;
  }

  .order-list {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 10;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
  }

  .orders-content {
    position: absolute;
    width: 100%;
    bottom: 0;
    background: #F1F1F1;
    z-index: 200;
  }

  .title {
    font-weight: 600;
    font-size: 30rpx;
    color: #000000;
    margin-left: 20rpx;
    margin-right: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .close {
    font-size: 50rpx;
  }

  .order-item {
    padding: 20rpx;
    background: #FFFFFF;
    margin: 20rpx;
    border-radius: 20rpx;
  }

  .order-id {
    font-size: 24rpx;
    color: #666666;
    margin-bottom: 10rpx;
  }

  .order-body {
    display: flex;
    font-size: 28rpx;
  }

  .order-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: 10rpx;
  }

  .order-name {
    margin-left: 20rpx;
    width: 270rpx;
  }

  .order-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .order-price {
    font-weight: bold;
  }

  .order-count {
    font-size: 24rpx;
    color: #666666;
  }

  .video-snapshot {
    position: relative;
  }

  .video-snapshot video {
    max-height: 300rpx;
    max-width: 400rpx;
  }

  .video-snapshot .video-play-icon {
    position: absolute;
    width: 40rpx;
    height: 40rpx;
    border-radius: 20rpx;
    background: url("~@/static/images/play.png") no-repeat center;
    background-size: 100%;
    top: 50%;
    left: 50%;
    margin: -20rpx;
  }

  .time-lag {
    font-size: 20rpx;
    text-align: center;
  }
</style>
