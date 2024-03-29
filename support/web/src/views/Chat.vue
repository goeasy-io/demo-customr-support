<template>
  <div class="chat-container">
    <div class="chat-title">
      <img :src="customer.avatar" class="chat-avatar"/>
      <div class="chat-name">{{ customer.name }}</div>
    </div>
    <div class="chat-main" ref="scrollView">
      <div class="message-list" ref="messageList">
        <div v-if="history.loading" class="history-loading">
          <img src="../assets/images/pending.gif"/>
        </div>
        <div v-else :class="history.loaded ? 'history-loaded':'load'" @click="loadHistoryMessage(false)">
          {{ history.loaded ? '已经没有更多的历史消息' : '获取历史消息' }}
        </div>
        <div v-for="(message, index) in history.messages" :key="index">
          <div class="time-tips">{{ renderMessageDate(message, index) }}</div>
          <div class="message-item">
            <div v-if="message.type === 'CS_ACCEPT'" class="accept-message">
              {{ message.senderData.name }}已接入
            </div>
            <div v-else-if="message.type === 'CS_END'" class="accept-message">
              {{ message.senderData.name }}已结束会话
            </div>
            <div v-else-if="message.type === 'CS_TRANSFER'" class="accept-message">
              {{
                message.senderId === currentAgent.id ? `已转接给` + message.payload.transferTo.data.name :
                  '已接入来自' + message.senderData.name + '的转接'
              }}
            </div>
            <div v-else :class="{ self: message.senderId !== customer.id }" class="message-item-content">
              <div class="sender-info">
                <img :src="message.senderData.avatar" class="sender-avatar"/>
                <div class="sender-name">
                  {{ message.senderData.name }}
                </div>
              </div>
              <div class="message-content">
                <div class="message-payload">
                  <div v-if="message.status === 'sending'" class="pending"></div>
                  <div v-if="message.status === 'fail'" class="send-fail"></div>
                  <div v-if="message.type === 'text'" class="content-text"
                       v-html="renderTextMessage(message.payload.text)"></div>
                  <div v-if="message.type === 'image'" class="content-image"
                       @click="showImagePreviewPopup(message.payload.url)">
                    <img :src="message.payload.url"
                         :style="{height:getImageHeight(message.payload.width,message.payload.height)+'px'}"/>
                  </div>
                  <div v-if="message.type ==='audio'" class="content-audio" @click="playAudio(message)">
                    <div class="audio-facade" :style="{width:Math.ceil(message.payload.duration)*7 + 50 + 'px'}">
                      <div class="audio-facade-bg" :class="{'play-icon':audioPlayer.playingMessage === message}"></div>
                      <div>{{ Math.ceil(message.payload.duration) || 1 }}<span>"</span></div>
                    </div>
                  </div>
                  <goeasy-video-player
                    v-if="message.type === 'video'"
                    :src="message.payload.video.url"
                    :thumbnail="message.payload.thumbnail"
                  />
                  <div v-if="message.type === 'order'" class="content-order">
                    <div class="order-id">订单号：{{ message.payload.id }}</div>
                    <div class="order-body">
                      <img :src="message.payload.url" class="order-img"/>
                      <div class="order-name">{{ message.payload.name }}</div>
                      <div>
                        <div class="order-price">{{ message.payload.price }}</div>
                        <div class="order-count">共{{ message.payload.count }}件</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-footer">
      <div v-if="customerStatus==null" class="accept-session">
        <div>离线中</div>
      </div>
      <div v-else-if="customerStatus.status==='PENDING'" class="accept-session">
        <div class="accept-info">
          会话已等待{{ pendingTime.duration }}
        </div>
        <button class="accept-btn" @click="acceptSession">立即接入</button>
      </div>
      <div v-else-if="customerStatus.status==='ACCEPTED' && currentAgent.id !== customerStatus.agent.id"
           class="accept-session">
        <div class="accept-info">{{ customerStatus.agent.data.name }}已接入</div>
      </div>
      <div v-else-if="customerStatus.status==='FREE'" class="accept-session">
        <button class="accept-btn" @click="acceptSession">主动接入</button>
      </div>
      <div v-else class="action-box">
        <div class="action-bar">
          <div class="chat-action">
            <!-- 表情 -->
            <div class="action-item">
              <div v-if="emoji.visible" class="emoji-box">
                <img
                  v-for="(emojiItem, emojiKey, index) in emoji.map"
                  :key="index"
                  :src="emoji.url + emojiItem"
                  class="emoji-item"
                  @click="chooseEmoji(emojiKey)"
                />
              </div>
              <i class="iconfont icon-smile" title="表情" @click="showEmojiBox"></i>
            </div>
            <!-- 图片 -->
            <div class="action-item">
              <label for="img-input">
                <i class="iconfont icon-picture" title="图片"></i>
              </label>
              <input v-show="false" id="img-input" accept="image/*" multiple type="file"
                     @change="sendImageMessage"/>
            </div>
            <!-- 视频 -->
            <div class="action-item">
              <label for="video-input"><i class="iconfont icon-film" title="视频"></i></label>
              <input v-show="false" id="video-input" accept="video/*" type="file"
                     @change="sendVideoMessage"/>
            </div>
            <!-- 商品链接 -->
            <div class="action-item">
              <i class="iconfont icon-liebiao" title="订单" @click="showOrderMessageList"></i>
            </div>
          </div>
          <div class="session-action">
            <span class="transfer" @click="showTransferForm()">转接</span>
            <span class="transfer" @click="endSession()">结束会话</span>
          </div>
        </div>
        <div class="input-box">
          <textarea ref="input" @focus="onInputFocus" @keyup.enter="sendTextMessage" v-model="text" autocomplete="off" class="input-content"></textarea>
        </div>
        <div class="send-box">
          <button class="send-button" @click="sendTextMessage">发送</button>
        </div>
      </div>
    </div>
    <!-- 语音播放器 -->
    <audio ref="audioPlayer" @ended="onAudioPlayEnd" @pause="onAudioPlayEnd"></audio>
    <!-- 图片预览弹窗 -->
    <div v-if="imagePopup.visible" class="image-preview">
      <img :src="imagePopup.url" alt="图片"/>
      <span class="close" @click="hideImagePreviewPopup">×</span>
    </div>
    <!-- 转接弹窗 -->
    <div v-if="transferForm.visible" class="transfer-popup">
      <div class="transfer-model">
        <div v-if="transferForm.agents.length" class="transfer-content">
          <div v-for="(agent, index) in transferForm.agents" class="agent-info">
            <label class="agent-label">
              <input v-model="transferForm.to" :name="agent.data.name" :value="agent" type="radio"/>
              <img :src="agent.data.avatar" class="agent-avatar"/>
              <span class="agent-name">{{ agent.data.name }}</span>
            </label>
          </div>
        </div>
        <div v-else class="transfer-content">
          <div class="no-agent">-当前无其他客服在线-</div>
        </div>
        <div class="transfer-bottom">
          <span v-if="transferForm.agents.length" class="transfer-button" @click="transfer()">确认</span>
          <span class="transfer-button" @click="hideTransferForm()">取消</span>
        </div>
      </div>
    </div>
    <!-- 订单弹窗 -->
    <div v-if="orderList.visible" class="order-box">
      <div class="order-list">
        <div class="title">
          <div>请选择一个订单</div>
          <span @click="closeOrderMessageList">×</span>
        </div>
        <div v-for="(order, index) in orderList.orders" :key="index" class="order-item"
             @click="sendOrderMessage(order)">
          <div class="order-id">订单号：{{ order.id }}</div>
          <div class="order-body">
            <img :src="order.url" class="order-img"/>
            <div class="order-name">{{ order.name }}</div>
            <div>
              <div class="order-price">{{ order.price }}</div>
              <div class="order-count">共{{ order.count }}件</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {formatDate, formateTime} from '../utils/utils.js'
  import restApi from '../api/restapi';
  import EmojiDecoder from '../utils/EmojiDecoder';
  import GoeasyVideoPlayer from "../components/GoEasyVideoPlayer";

  const IMAGE_MAX_WIDTH = 200;
  const IMAGE_MAX_HEIGHT = 150;
  export default {
    name: "Chat",
    components: {
      GoeasyVideoPlayer,
    },
    data() {
      const emojiUrl = 'https://imgcache.qq.com/open/qcloud/tim/assets/emoji/';
      const emojiMap = {
        '[么么哒]': 'emoji_3@2x.png',
        '[乒乓]': 'emoji_4@2x.png',
        '[便便]': 'emoji_5@2x.png',
        '[信封]': 'emoji_6@2x.png',
        '[偷笑]': 'emoji_7@2x.png',
        '[傲慢]': 'emoji_8@2x.png',
      };
      return {
        currentAgent: null,
        csteam: null,
        customer: null,
        customerStatus: null,

        to: {},//用于创建消息时传入

        history: {
          messages: [],
          loaded: false,
          loading: true
        },

        text: '',
        emoji: {
          url: emojiUrl,
          map: emojiMap,
          visible: false,
          decoder: new EmojiDecoder(emojiUrl, emojiMap),
        },
        imagePopup: {
          visible: false,
          url: ''
        },
        audioPlayer: {
          playingMessage: null,
        },
        orderList: {
          orders: [],
          visible: false,
        },
        transferForm: {
          visible: false,
          agents: [],
          to: {}
        },
        pendingTime: {
          timer: null,
          duration: ''
        }
      }
    },
    created() {
      this.customer = {
        id: this.$route.params.id,
        name: this.$route.query.name,
        avatar: this.$route.query.avatar,
      };
      this.to = {
        type: this.GoEasy.IM_SCENE.CS,
        id: this.customer.id,
        data: {name: this.customer.name, avatar: this.customer.avatar},
      };
      this.currentAgent = this.globalData.currentAgent;
      this.csteam = this.goEasy.im.csteam(this.currentAgent.shopId);

      this.listenCustomer();
      this.loadHistoryMessage(true);
    },
    beforeDestroy() {
      this.csteam.cancelListenCustomer({
        onSuccess: () => {
          console.log('cancelListenCustomer successfully ');
        },
        onFailed: (error) => {
          console.log('failed to cancelListenCustomer:', error);
        },
      });
      if (this.pendingTime.timer) {
        clearInterval(this.pendingTime.timer);
      }
    },
    methods: {
      renderTextMessage(text) {
        return this.emoji.decoder.decode(text);
      },
      listenCustomer() {
        this.csteam.listenCustomer({
          id: this.customer.id,
          onSuccess: () => {
            console.log('listen customer successfully');
            this.markMessageAsRead();
          },
          onFailed: (error) => {
            console.log('failed to listen customer:', error);
          },
          onStatusUpdated: (customerStatus) => {
            this.customerStatus = customerStatus;
            if (customerStatus.status === 'PENDING') {
              this.updatePendingTime(customerStatus.start);
            }
          },
          onNewMessage: (message) => {
            this.onReceivedMessage(message);
          },
        })
      },
      updatePendingTime(time) {
        this.pendingTime.duration = formateTime(time);
        clearInterval(this.pendingTime.timer);
        this.pendingTime.timer = setInterval(() => {
          this.pendingTime.duration = formateTime(time);
        }, 1000);
      },
      onReceivedMessage(newMessage) {
        //如果该消息已存在，跳过
        if (this.history.messages.findIndex((message) => newMessage.id === message.messageId) >= 0) {
          return;
        }
        this.history.messages.push(newMessage);
        this.markMessageAsRead();
        this.scrollToBottom();
      },
      markMessageAsRead() {
        this.csteam.markMessageAsRead({
          type: this.GoEasy.IM_SCENE.CS,
          id: this.customer.id,
          onSuccess: function () {
            console.log('标记已读成功');
          },
          onFailed: function (error) {
            console.log('标记已读失败', error);
          }
        });
      },
      loadHistoryMessage(scrollToBottom) {
        this.history.loading = true;
        let lastMessageTimeStamp;
        let lastMessage = this.history.messages[0];
        if (lastMessage) {
          lastMessageTimeStamp = lastMessage.timestamp;
        }
        let limit = 10;
        this.csteam.history({
          id: this.customer.id,
          type: this.GoEasy.IM_SCENE.CS,
          lastTimestamp: lastMessageTimeStamp,
          limit: limit,
          onSuccess: (result) => {
            this.history.loading = false;
            let messages = result.content;
            if (messages.length === 0) {
              this.history.loaded = true;
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
            this.history.loading = false;
            console.log('获取历史消息失败, code:' + error.code + ',错误信息:' + error.content);
          },
        });
      },
      /**
       * 核心就是设置高度，产生明确占位
       *
       * 小  (宽度和高度都小于预设尺寸)
       *    设高=原始高度
       * 宽 (宽度>高度)
       *    高度= 根据宽度等比缩放
       * 窄  (宽度<高度)或方(宽度=高度)
       *    设高=MAX height
       *
       * @param width,height
       * @returns number
       */
      getImageHeight(width, height) {
        if (width < IMAGE_MAX_WIDTH && height < IMAGE_MAX_HEIGHT) {
          return height;
        } else if (width > height) {
          return IMAGE_MAX_WIDTH / width * height;
        } else if (width === height || width < height) {
          return IMAGE_MAX_HEIGHT;
        }
      },
      playAudio(audioMessage) {
        let playingMessage = this.audioPlayer.playingMessage;

        if (playingMessage) {
          this.$refs.audioPlayer.pause();
          // 如果点击的消息正在播放，就认为是停止播放操作
          if (playingMessage === audioMessage) {
            return;
          }
        }

        this.audioPlayer.playingMessage = audioMessage;
        this.$refs.audioPlayer.src = audioMessage.payload.url;
        this.$refs.audioPlayer.load();
        this.$refs.audioPlayer.currentTime = 0;
        this.$refs.audioPlayer.play();
      },
      onAudioPlayEnd() {
        this.audioPlayer.playingMessage = null;
      },
      renderMessageDate(message, index) {
        if (index === 0) {
          return formatDate(message.timestamp);
        } else {
          if (message.timestamp - this.history.messages[index - 1].timestamp > 5 * 60 * 1000) {
            return formatDate(message.timestamp);
          }
        }
        return '';
      },
      showImagePreviewPopup(url) {
        this.imagePopup.visible = true;
        this.imagePopup.url = url;
      },
      hideImagePreviewPopup() {
        this.imagePopup.visible = false;
      },

      isOnline() {
        return new Promise((resolve, reject) => {
          this.csteam.isOnline({
            onSuccess: (result) => {
              resolve(result);
            },
            onFailed: (error) => {
              console.log('获取在线状态失败，error:', error)
              reject(error);
            }
          })
        })
      },


      async acceptSession() {
        if (await this.isOnline()) {
          this.csteam.accept({
            customer: {
              id: this.customer.id,
              data: {
                name: this.customer.name,
                avatar: this.customer.avatar
              }
            },
            onSuccess: () => {
              console.log('accept successfully.');
              clearInterval(this.pendingTime.timer);
            },
            onFailed: (error) => {
              console.log('accept failed', error);
            }
          });
        } else {
          alert('您还不是一名该团队的在线客服，请点击左下角头像进行上线操作')
        }
      },
      endSession() {
        this.csteam.end({
          id: this.customer.id,
          onSuccess: () => {
            console.log('end successfully.');
          },
          onFailed: (error) => {
            console.log('end failed', error);
          }
        })
      },
      showTransferForm() {
        this.csteam.agents({
          onSuccess: (result) => {
            this.transferForm.visible = true;
            this.transferForm.agents = result.content.filter((agent) => {
              return agent.id !== this.currentAgent.id;
            });
          },
          onFailed: (error) => {
            console.log('query online agents failed', error);
          }
        });
      },
      transfer() {
        this.csteam.transfer({
          customerId: this.customer.id,
          agentId: this.transferForm.to.id,
          onSuccess: () => {
            this.transferForm.visible = false;
            console.log('transfer successfully.');
          },
          onFailed: (error) => {
            console.log('transfer failed', error);
          }
        })
      },
      hideTransferForm() {
        this.transferForm.visible = false;
      },
      onInputFocus () {
        this.emoji.visible = false;
      },
      showEmojiBox() {
        this.emoji.visible = !this.emoji.visible;
      },
      chooseEmoji(emojiKey) {
        this.text += emojiKey;
        this.emoji.visible = false;
      },
      sendTextMessage() {
        if (this.text.trim().length === 0) {
          console.log('输入为空');
          return
        }
        this.csteam.createTextMessage({
          text: this.text,
          to: this.to,
          onSuccess: (message) => {
            this.sendMessage(message);
            this.text = '';
          },
          onFailed: (err) => {
            console.log("创建消息err:", err);
          }
        });
      },
      sendImageMessage(e) {
        let fileList = [...e.target.files];
        fileList.forEach((file) => {
          this.csteam.createImageMessage({
            file: file,
            to: this.to,
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
        })
      },
      sendVideoMessage(e) {
        const file = e.target.files[0];
        this.csteam.createVideoMessage({
          file: file,
          to: this.to,
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
      closeOrderMessageList() {
        this.orderList.visible = false;
      },
      showOrderMessageList() {
        this.orderList.orders = restApi.getOrderList();
        this.orderList.visible = true;
      },
      sendOrderMessage(order) {
        this.orderList.visible = false;
        this.csteam.createCustomMessage({
          type: 'order',
          payload: order,
          to: this.to,
          onSuccess: (message) => {
            this.sendMessage(message);
          },
          onFailed: (err) => {
            console.log("创建消息err:", err);
          }
        });
      },
      sendMessage(message) {
        this.history.messages.push(message);
        this.scrollToBottom();
        this.goEasy.im.sendMessage({
          message: message,
          onSuccess: (message) => {
            console.log('发送成功', message);
          },
          onFailed: function (error) {
            if (error.code === 507) {
              alert('发送语音/图片/视频/文件失败，没有配置OSS存储');
              console.log('发送语音/图片/视频/文件失败，没有配置OSS存储，详情参考：https://docs.goeasy.io/2.x/im/message/media/alioss');
            } else {
              console.log('发送失败:', error);
            }
          }
        });
      },
      scrollToBottom() {
        this.$nextTick(() => {
          this.$refs.scrollView.scrollTop = this.$refs.messageList.scrollHeight;
        })
      }
    }

  };
</script>

<style scoped>
  .chat-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .chat-title {
    height: 40px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    font-size: 18px;
  }

  .chat-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
  }

  .chat-name {
    width: 400px;
    margin-left: 10px;
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }

  .chat-main {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
    scrollbar-width: thin;
  }

  .chat-main::-webkit-scrollbar {
    width: 0;
  }

  .chat-main .message-list {
    padding: 0 15px;
  }

  .chat-main .history-loaded {
    text-align: center;
    font-size: 12px;
    color: #cccccc;
    cursor: pointer;
    line-height: 20px;
  }

  .chat-main .load {
    text-align: center;
    font-size: 12px;
    color: #d02129;
    line-height: 20px;
    cursor: pointer;
  }

  .history-loading {
    width: 100%;
    text-align: center;
  }

  .time-tips {
    color: #999;
    text-align: center;
    font-size: 12px;
  }

  .message-list {
    padding: 0 10px;
  }

  .message-item {
    display: flex;
  }

  .accept-message {
    width: 100%;
    text-align: center;
    color: #606164;
    line-height: 25px;
  }

  .message-item-content {
    flex: 1;
    margin: 5px 0;
    overflow: hidden;
    display: flex;
  }

  .sender-info {
    margin: 0 5px;
  }

  .sender-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
  }

  .sender-name {
    color: #606164;
    text-align: center;
  }

  .message-content {
    max-width: calc(100% - 100px);
  }

  .message-payload {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }

  .pending {
    background: url("../assets/images/pending.gif") no-repeat center;
    background-size: 13px;
    width: 15px;
    height: 15px;
  }

  .send-fail {
    background: url("../assets/images/failed.png") no-repeat center;
    background-size: 13px;
    width: 15px;
    height: 15px;
  }

  .content-text {
    display: flex;
    align-items: center;
    text-align: left;
    background: #eeeeee;
    font-size: 14px;
    font-weight: 500;
    padding: 6px 8px;
    margin: 3px 0;
    line-height: 25px;
    white-space: pre-line;
    overflow-wrap: anywhere;
    border-radius: 8px;
    word-break: break-all;
    flex-wrap: wrap;
  }

  .content-image {
    display: block;
    cursor: pointer;
  }

  .content-image img {
    height: 100%;
  }

  .content-audio {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .content-audio .audio-facade {
    min-width: 12px;
    background: #eeeeee;
    border-radius: 7px;
    display: flex;
    font-size: 14px;
    padding: 8px;
    margin: 5px 0;
    line-height: 25px;
    cursor: pointer;
  }

  .content-audio .audio-facade-bg {
    background: url("../assets/images/voice.png") no-repeat center;
    background-size: 15px;
    width: 20px;
  }

  .content-audio .audio-facade-bg.play-icon {
    background: url("../assets/images/play.gif") no-repeat center;
    background-size: 20px;
  }

  .content-order {
    border-radius: 5px;
    border: 1px solid #eeeeee;
    padding: 8px;
    display: flex;
    flex-direction: column;
  }

  .content-order .order-id {
    font-size: 12px;
    color: #666666;
    margin-bottom: 5px;
  }

  .content-order .order-body {
    display: flex;
    font-size: 13px;
    padding: 5px;
  }

  .content-order .order-img {
    width: 70px;
    height: 70px;
    border-radius: 5px;
  }

  .content-order .order-name {
    margin-left: 10px;
    width: 135px;
    color: #606164;
  }

  .content-order .order-count {
    font-size: 12px;
    color: #666666;
    flex: 1;
  }

  .message-item .self {
    overflow: hidden;
    display: flex;
    justify-content: flex-start;
    flex-direction: row-reverse;
  }

  .message-item .self::v-deep(.play-icon) {
    background: url("../assets/images/play.gif") no-repeat center;
    background-size: 20px;
    -moz-transform: rotate(180deg);
    -webkit-transform: rotate(180deg);
    -o-transform: rotate(180deg);
    transform: rotate(180deg);
  }

  .chat-footer {
    border-top: 1px solid #dcdfe6;
    width: 100%;
    height: 140px;
    background: #FFFFFF;
  }

  .action-box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .action-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .action-bar .iconfont {
    font-size: 22px;
    margin: 0 10px;
    z-index: 3;
    color: #606266;
    cursor: pointer;
  }

  .action-bar .iconfont:focus {
    outline: none;
  }

  .action-bar .iconfont:hover {
    color: #d02129;
  }

  .chat-action {
    display: flex;
    flex-direction: row;
    padding: 0 10px;
  }

  .action-bar .action-item {
    text-align: left;
    padding: 10px 0;
    position: relative;
  }

  .emoji-box {
    width: 210px;
    position: absolute;
    top: -111px;
    left: -11px;
    z-index: 2007;
    background: #fff;
    border: 1px solid #ebeef5;
    padding: 12px;
    text-align: justify;
    font-size: 14px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    word-break: break-all;
    border-radius: 4px;
  }

  .emoji-item {
    width: 38px;
    height: 38px;
    margin: 0 2px;
  }

  .session-action {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .session-action .transfer {
    cursor: pointer;
    margin-right: 10px;
    line-height: 30px;
    text-align: center;
    width: 70px;
    height: 30px;
    font-size: 15px;
    border: 1px solid #d02129;
    background-color: #ffffff;
    color: #d02129;
    border-radius: 5px;
  }

  .input-box {
    flex: 1;
    padding: 5px 15px;
  }

  .input-content {
    border: none;
    resize: none;
    display: block;
    width: 90%;
    color: #606266;
    outline: none;
    background: #FFFFFF;
    word-break: break-all;
  }

  .send-box {
    padding: 5px 10px;
    text-align: right;
  }

  .send-button {
    width: 70px;
    height: 30px;
    font-size: 15px;
    border: 1px solid #d02129;
    background-color: #ffffff;
    color: #d02129;
    border-radius: 5px;
    cursor: pointer;
  }

  .accept-session {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .accept-info {
    font-size: 18px;
    color: #d02129;
    margin-bottom: 10px;
  }

  .accept-btn {
    width: 75px;
    height: 30px;
    font-size: 15px;
    border: 1px solid #d02129;
    background-color: #ffffff;
    color: #d02129;
    border-radius: 5px;
    cursor: pointer;
  }

  .image-preview {
    max-width: 750px;
    max-height: 500px;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    margin: auto;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9998;
  }

  .image-preview img {
    max-width: 750px;
    max-height: 500px;
  }

  .image-preview .close {
    font-size: 50px;
    line-height: 24px;
    cursor: pointer;
    color: #FFFFFF;
    position: absolute;
    top: 10px;
    right: 5px;
    z-index: 1002;
  }

  .transfer-popup {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(33, 33, 33, 0.7);
  }

  .transfer-model {
    width: 450px;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    padding: 5px;
    border: 1px solid gainsboro;
    border-radius: 4px;
    text-align: center;
    background: #ffffff;
  }

  .transfer-content {
    flex: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .no-agent {
    flex: 1;
  }

  .agent-info {
    width: 110px;
    padding: 20px;
  }

  .agent-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .agent-avatar {
    width: 35px;
    height: 35px;
    margin: 0 5px;
  }

  .agent-name {
    font-size: 14px;
    word-break: break-all;
  }

  .transfer-bottom {
    height: 50px;
    display: flex;
    margin: 0 50px;
    align-items: center;
    justify-content: space-around;
  }

  .transfer-button {
    display: inline-block;
    padding: 8px 15px;
    font-size: 13px;
    border: 1px solid #d02129;
    color: #d02129;
    border-radius: 4px;
    cursor: pointer;
  }

  .order-box {
    width: 848px;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 2007;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(33, 33, 33, 0.7);
  }

  .order-list {
    width: 300px;
    background: #F1F1F1;
    border-radius: 5px;
  }

  .order-list .title {
    font-weight: 600;
    font-size: 15px;
    color: #000000;
    margin-left: 10px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .order-list .title span {
    font-size: 28px;
    font-weight: 400;
    cursor: pointer;
  }

  .order-list .order-item {
    padding: 10px;
    background: #FFFFFF;
    margin: 10px;
    border-radius: 5px;
    cursor: pointer;
  }

  .order-list .order-id {
    font-size: 12px;
    color: #666666;
    margin-bottom: 5px;
  }

  .order-list .order-body {
    display: flex;
    font-size: 13px;
    justify-content: space-between;
  }

  .order-list .order-img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
  }

  .order-list .order-name {
    width: 160px;
  }

  .order-list .order-count {
    font-size: 12px;
    color: #666666;
    flex: 1;
  }

</style>
