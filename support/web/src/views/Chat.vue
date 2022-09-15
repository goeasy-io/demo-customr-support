<template>
  <div class="chat-container">
    <div class="chat-title">
      <img :src="customer.avatar" class="chat-avatar"/>
      <div class="chat-name">{{ customer.name }}</div>
    </div>
    <div ref="scrollView" class="chat-main">
      <div ref="messageList" class="message-list">
        <div v-if="history.loading" class="history-loading">
          <img src="/static/images/pending.gif"/>
        </div>
        <div v-else class="history-loaded" @click="loadHistoryMessage(false)">
          {{ history.allLoaded ? '已经没有更多的历史消息' : '获取历史消息' }}
        </div>
        <div v-for="(message, index) in history.messages" :key="index">
          <div class="time-tips">
            {{ renderMessageDate(message, index) }}
          </div>
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
                  <goeasy-audio-player
                    v-if="message.type ==='audio'"
                    :duration="message.payload.duration"
                    :src="message.payload.url"
                  />
                  <goeasy-video-player
                    v-if="message.type === 'video'"
                    :src="message.payload.video.url"
                    :thumbnail="message.payload.thumbnail"
                  />
                  <div v-if="message.type === 'order'" class="content-order">
                    <div class="order-description">发送订单：</div>
                    <div class="order-content">
                      <img :src="message.payload.url"/>
                      <div class="order-info">
                        <div class="order-name">{{ message.payload.name }}</div>
                        <div>月销{{ message.payload.sales }}</div>
                        <div>{{ message.payload.price }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span ref="bottomView"></span>
    </div>
    <div class="chat-footer">
      <div v-if="customerStatus==null" class="accept-session">
        <div>离线中</div>
      </div>
      <div v-else-if="customerStatus.status==='PENDING'" class="accept-session">
        <div class="accept-info">
          会话已等待{{ (Math.ceil((Date.now() - customerStatus.start)) / 60000).toFixed(1) }}分钟
        </div>
        <button class="accept-btn" @click="acceptSession">立即接入</button>
      </div>
      <div v-else-if="customerStatus.status==='ACCEPTED' && currentAgent.id !== customerStatus.agent.id"
           class="accept-session">
        <div class="accept-info">{{ customerStatus.agent.data.name }}已接入</div>
      </div>
      <div v-else-if="customerStatus.status==='FREE'" class="accept-session">
        <button class="accept-btn" @click="acceptSession">发起会话</button>
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
              <div v-if="orderList.visible" class="link-box">
                <div v-for="(order, index) in orderList.orders" :key="index" class="order-item"
                     @click="sendOrderMessage(order)">
                  <img :src="order.url" class="order-img">
                  <div>{{ order.name }}</div>
                </div>
              </div>
              <i class="iconfont icon-lianjie" title="商品链接" @click="showOrderMessageList"></i>
            </div>
          </div>
          <div class="session-action">
            <span class="transfer" @click="showTransferForm()">转接</span>
            <i class="iconfont icon-end_chat" title="结束会话" @click="endSession"></i>
          </div>
        </div>
        <div class="input-box">
          <textarea ref="input" v-model="text" autocomplete="off" class="input-content"></textarea>
        </div>
        <div class="send-box">
          <button class="send-button" @click="sendTextMessage">发送</button>
        </div>
      </div>
    </div>
    <!-- 图片预览弹窗 -->
    <div v-if="imagePopup.visible" class="image-preview">
      <img :src="imagePopup.url" alt="图片"/>
      <span class="close" @click="hideImagePreviewPopup">x</span>
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
  </div>
</template>

<script>
  import restApi from '../api/restapi';
  import EmojiDecoder from '../utils/EmojiDecoder';
  import GoEasyAudioPlayer from "../components/GoEasyAudioPlayer";
  import GoEasyVideoPlayer from "../components/GoEasyVideoPlayer";

  const IMAGE_MAX_WIDTH = 200;
  const IMAGE_MAX_HEIGHT = 150;
  export default {
    name: "Chat",
    components: {
      "goeasy-audio-player": GoEasyAudioPlayer,
      "goeasy-video-player": GoEasyVideoPlayer
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
          allLoaded: false,
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
        orderList: {
          orders: [],
          visible: false,
        },
        transferForm: {
          visible: false,
          agents: [],
          to: {}
        },
      }
    },
    created() {
      this.customer = {
        id: this.$route.query.id,
        name: this.$route.query.name,
        avatar: this.$route.query.avatar,
      };
      this.to = {
        type: this.GoEasy.IM_SCENE.CS,
        id: this.customer.id,
        data: {name: this.customer.name, avatar: this.customer.avatar},
      };
      this.currentAgent = JSON.parse(localStorage.getItem("currentAgent"));
      this.csteam = this.goEasy.im.csteam(this.currentAgent.shopId);

      this.liveSession();
      this.loadHistoryMessage(true);
    },
    beforeDestroy() {
      this.csteam.quitLiveSession({
        onSuccess: () => {
          console.log('quit successfully ');
        },
        onFailed: (error) => {
          console.log('failed to quit:', error);
        },
      });
    },
    methods: {
      renderTextMessage(text) {
        return this.emoji.decoder.decode(text);
      },
      liveSession() {
        this.csteam.liveSession({
          customerId: this.customer.id,
          onSuccess: () => {
            console.log('live successfully');
            this.markMessageAsRead();
          },
          onFailed: (error) => {
            console.log('failed to live session:', error);
          },
          onStatusUpdated: (status) => {
            this.customerStatus = status;
          },
          onNewMessage: (message) => {
            this.onReceivedMessage(message);
          },
        })
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
              this.history.allLoaded = true;
            } else {
              if (lastMessageTimeStamp) {
                this.history.messages = messages.concat(this.history.messages);
              } else {
                this.history.messages = messages;
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
      renderMessageDate(message, index) {
        if (index === 0) {
          return this.formatDate(message.timestamp);
        } else {
          if (message.timestamp - this.history.messages[index - 1].timestamp > 5 * 60 * 1000) {
            return this.formatDate(message.timestamp);
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
      //todo:session这个名字
      acceptSession() {
        this.csteam.accept({
          id: this.customer.id,
          onSuccess: () => {
            console.log('accept successfully.');
          },
          onFailed: (error) => {
            // if (error.content === 'CUSTOMER_BUSY') {
            //   alert('接入失败，用户正在忙')
            // }
            // if (error.content === 'OFFLINE_AGENT') {
            //   alert('接入失败，请将您的状态改为上线状态，再进行操作。')
            // }
            console.log('accept failed', error);
          }
        })
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
              console.log('发送语音/图片/视频/文件失败，没有配置OSS存储，详情参考：https://www.goeasy.io/cn/docs/goeasy-2.x/im/message/media/send-media-message.html');
            } else {
              console.log('发送失败:', error);
            }
          }
        });
      },
      scrollToBottom() {
        this.$nextTick(() => {
          if (this.$refs.bottomView) {
            this.$refs.bottomView.scrollIntoView();
          }
        })
      }
    }

  };
</script>

<style lang="scss" scoped>
  .chat-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .chat-title {
      height: 61px;
      padding: 15px;
      display: flex;
      align-items: center;
      font-size: 18px;

      .chat-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .chat-name {
        margin-left: 10px;
      }

    }

    .chat-main {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      flex: 1;

      .message-list {
        padding: 0 15px;
      }

      .history-loaded {
        text-align: center;
        font-size: 12px;
        color: #d02129;
        cursor: pointer;
        line-height: 20px;
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

      .message-item {
        display: flex;

        .accept-message {
          width: 100%;
          text-align: center;
          color: #606164;
          line-height: 25px;
        }

        .message-item-content {
          flex: 1;
          max-height: 230px;
          margin: 5px 0;
          overflow: hidden;
          display: flex;

          .sender-info {
            margin: 5px;

            .sender-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
            }

            .sender-name {
              color: #606164;
              text-align: center;
            }

          }

          .message-content {
            max-width: calc(100% - 100px);

            .message-payload {
              display: flex;
              align-items: center;
            }

            .pending {
              background: url("../../public/static/images/pending.gif") no-repeat center;
              background-size: 13px;
              width: 15px;
              height: 15px;
            }

            .send-fail {
              background: url("../../public/static/images/failed.png") no-repeat center;
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
              margin: 5px 0;
              line-height: 25px;
              white-space: pre-line;
              overflow-wrap: anywhere;
              border-radius: 8px;
            }

            .content-image {
              display: block;
              margin: 5px 10px;
              cursor: pointer;
            }

            .content-order {
              border-radius: 10px;
              background: #eeeeee;
              padding: 8px;
              display: flex;
              flex-direction: column;

              img {
                width: 100px;
                height: 100px;
              }

              .order-description {
                font-weight: bold;
                margin-bottom: 20px;
              }

              .order-content {
                display: flex;
                background-color: #fffcfc;
              }

              .order-info {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                font-size: 14px;
                padding: 14px 5px;

                .order-name {
                  font-size: 15px;
                }

              }
            }
          }
        }

        .self {
          overflow: hidden;
          display: flex;
          justify-content: flex-start;
          flex-direction: row-reverse;
        }

        .self /deep/ .play-icon {
          background: url("../../public/static/images/play.gif") no-repeat center;
          background-size: 20px;
          -moz-transform: rotate(180deg);
          -webkit-transform: rotate(180deg);
          -o-transform: rotate(180deg);
          transform: rotate(180deg);
        }

      }
    }

    .chat-footer {
      border-top: 1px solid #dcdfe6;
      width: 100%;
      height: 200px;
      background: #FFFFFF;

      .action-box {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;

        .action-bar {
          display: flex;
          flex-direction: row;
          justify-content: space-between;

          .iconfont {
            font-size: 22px;
            margin: 0 10px;
            z-index: 3;
            color: #606266;
            cursor: pointer;

            &
            :focus {
              outline: none;
            }

            &
            :hover {
              color: #d02129;
            }

          }

          .chat-action {
            display: flex;
            flex-direction: row;
            padding: 0 10px;

            .action-item {
              text-align: left;
              padding: 10px 0;
              position: relative;

              .emoji-box {
                width: 250px;
                position: absolute;
                top: -125px;
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

                .emoji-list {
                  display: flex;
                  flex-wrap: wrap;
                }

                .emoji-item {
                  width: 45px;
                  height: 45px;
                  margin: 0 2px
                }

              }

              .link-box {
                width: 160px;
                position: absolute;
                top: -146px;
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

                .order-item {
                  display: flex;
                  align-items: center;
                  margin: 5px 0;
                  cursor: pointer;

                  .order-img {
                    width: 40px;
                    height: 40px;
                    margin-right: 5px;
                  }

                }
              }
            }
          }

          .session-action {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;

            .transfer {
              padding: 2px;
              display: inline-block;
              max-width: 60px;
              border: 1px solid gray;
              border-radius: 2px;
              text-align: center;
              cursor: pointer;
            }

          }
        }

        .input-box {
          padding: 0 10px;
          flex: 1;

          .input-content {
            height: 110px;
            border: none;
            resize: none;
            display: block;
            padding: 5px 15px;
            box-sizing: border-box;
            width: 100%;
            color: #606266;
            outline: none;
            background: #FFFFFF;
          }

        }

        .send-box {
          padding: 5px 10px;
          text-align: right;

          .send-button {
            width: 60px;
            height: 30px;
            font-size: 15px;
            border: 1px solid #d02129;
            background-color: #ffffff;
            color: #d02129;
            border-radius: 5px;
          }

        }
      }

      .accept-session {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

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

      }
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

      img {
        max-width: 750px;
        max-height: 500px;
      }

      .close {
        padding: 0 8px;
        background: #f6f2f2;
        border: 1px solid #eeeeee;
        font-size: 15px;
        cursor: pointer;
        color: #333333;
        position: absolute;
        top: 4px;
        right: 10px;
      }

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

        .transfer-content {
          flex: 1;
          display: flex;
          align-items: center;
          flex-wrap: wrap;

          .agent-info {
            width: 110px;
            padding: 20px;

            .agent-label {
              display: flex;
              align-items: center;
            }

            .agent-avatar {
              width: 40px;
              height: 40px;
              min-width: 40px;
              min-height: 40px;
              margin: 0 5px;
            }

            .agent-name {
              font-size: 14px;
              word-break: break-all;
            }

          }

          .no-agent {
            flex: 1;
          }

        }

        .transfer-bottom {
          height: 50px;
          display: flex;
          margin: 0 50px;
          align-items: center;
          justify-content: space-around;

          .transfer-button {
            display: inline-block;
            padding: 8px 15px;
            font-size: 13px;
            border: 1px solid #d02129;
            color: #d02129;
            border-radius: 4px;
            cursor: pointer;
          }

        }
      }
    }
  }
</style>
