<template>
  <div class="chat-container">
    <div class="chat-title">
      <img class="chat-avatar" :src="customer.avatar" />
      <div class="chat-name">{{ customer.name }}</div>
    </div>
    <div class="chat-main" ref="scrollView" @scroll="listenScroll">
      <div class="message-list" ref="messageList">
        <div v-if="history.loading" class="history-loading">
          <img src="/static/images/pending.gif" />
        </div>
        <div v-else class="history-loaded" @click="loadHistoryMessage(false,0)">
          {{ history.allLoaded ? '已经没有更多的历史消息' : '获取历史消息' }}
        </div>
        <div v-for="(message, index) in history.messages" :key="index">
          <div class="time-tips">
            {{ renderMessageDate(message, index) }}
          </div>
          <div class="message-item">
            <div v-if="message.type === 'ACCEPTED'" class="accept-message">
              {{message.senderData.name}}已接入
            </div>
            <div v-if="message.type === 'CLOSED'" class="accept-message">
              {{message.payload.text}}
            </div>
            <div v-else class="message-item-content" :class="{ self: message.senderId !== customer.uuid }">
              <div class="message-content">
                <div class="message-payload">
                  <div class="pending" v-if="message.status === 'sending'"></div>
                  <div class="send-fail" v-if="message.status === 'fail'"></div>
                  <div class="content-text" v-if="message.type === 'text'" v-html="renderTextMessage(message.payload.text)"></div>

                  <div class="content-image"
                    v-if="message.type === 'image'"
                    :class="getImgHeight(message.payload.width,message.payload.height)"
                    @click="showImagePreview(message.payload.url)"
                  >
                    <img :src="message.payload.url" alt="图片" />
                  </div>
                  <goeasy-audio-player
                    v-if="message.type ==='audio'"
                    :src="message.payload.url"
                    :duration="message.payload.duration"
                  />
                  <goeasy-video-player
                    v-if="message.type === 'video'"
                    :thumbnail="message.payload.thumbnail"
                    :src="message.payload.video.url"
                  />
                  <div v-if="message.type === 'goods'" class="content-link">
                    <div class="goods-description">为你推荐：</div>
                    <div style="display: flex;background-color: #fffcfc;">
                      <img :src="message.payload.url"/>
                      <div class="goods-info">
                        <div class="goods-name">{{message.payload.name}}</div>
                        <div>月销17</div>
                        <div class="foods-price">{{message.payload.price}}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="message.senderId !== customer.uuid" :class="message.read ?'message-read':'message-unread'">
                  <div>{{message.read?'已读':'未读'}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-footer">
      <div v-if="customerStatus.status==='PENDING'" class="accept-session">
        <div class="accept-info">会话已等待{{Math.ceil((Date.now()-customerStatus.time)/60000)}}分钟</div>
        <button class="accept-btn" @click="acceptSession">立即接入</button>
      </div>
      <div v-else-if="customerStatus.status==='ACCEPTED' && staffData.uuid !== customerStatus.staff.id" class="accept-session">
        <div class="accept-info">{{ customerStatus.staff.data.name }}已接入</div>
      </div>
      <div v-else-if="customerStatus.status==='FREE'" class="accept-session">
        <button class="accept-btn" @click="acceptSession">发起会话</button>
      </div>
      <div v-else class="action-box">
        <div class="action-bar">
          <div class="chat-action">
            <!-- 表情 -->
            <div class="action-item">
              <div class="emoji-box" v-if="emoji.visible">
                <img
                  class="emoji-item"
                  v-for="(emojiItem, emojiKey, index) in emoji.map"
                  :key="index"
                  :src="emoji.url + emojiItem"
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
              <input
                accept="image/*"
                type="file"
                multiple
                @change="sendImageMessage"
                id="img-input"
                v-show="false"
              />
            </div>
            <!-- 视频 -->
            <div class="action-item">
              <label for="video-input">
                <i class="iconfont icon-film" title="视频"></i>
              </label>
              <input
                accept="video/*"
                type="file"
                @change="sendVideoMessage"
                id="video-input"
                v-show="false"
              />
            </div>
            <!-- 商品链接 -->
            <div class="action-item">
              <div v-if="customMessage.visible" class="link-box">
                <div class="goods-item" v-for="goods in customMessage.goodsList" @click="sendCustomMessage(goods)">
                  <img class="goods-img" :src="goods.url">
                  <div>{{goods.name}}</div>
                </div>
              </div>
              <i class="iconfont icon-lianjie" title="商品链接" @click="showLinkBox"></i>
            </div>
          </div>
          <div class="session-action">
            <i class="iconfont icon-h" title="结束会话" @click="endSession"></i>
          </div>
        </div>

        <div class="input-box">
          <textarea
            autocomplete="off"
            class="input-content"
            ref="input"
            v-model="text"
          ></textarea>
        </div>

        <div class="send-box">
          <button class="send-button" @click="sendTextMessage">发送</button>
        </div>
      </div>
    </div>
    <div class="image-preview" v-if="imagePreview.visible">
      <img :src="imagePreview.url" alt="图片" />
      <span class="close" @click="imagePreview.visible = false">x</span>
    </div>
  </div>
</template>

<script>
import restApi from '../api/restapi';
import EmojiDecoder from '../utils/EmojiDecoder';
import GoeasyAudioPlayer from "../components/GoEasyAudioPlayer";
import GoeasyVideoPlayer from "../components/GoEasyVideoPlayer";
export default {
  name: "Chat",
  components: {
    GoeasyAudioPlayer,
    GoeasyVideoPlayer
  },
  data () {
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
      staffData: null,
      teamData: null,

      customer: null,
      customerStatus: {},

      to: {},

      history: {
        messages: [],
        allLoaded: false,
        loading: true
      },

      text: '',
      emoji: {
        url: emojiUrl,
        map : emojiMap,
        visible: false,
        decoder: new EmojiDecoder(emojiUrl, emojiMap),
      },
      imagePreview: {
        visible: false,
        url: ''
      },
      customMessage: {
        goodsList:[],
        visible: false,
      }
    }
  },
  created() {
    const customerId = this.$route.params.id;
    this.customer = restApi.findUserById(customerId);
    this.to = {
      type: this.GoEasy.IM_SCENE.CS,
      id: this.customer.uuid,
      data: this.customer,
    }
    this.staffData = JSON.parse(localStorage.getItem("staffData"));
    this.teamData = restApi.findShopByStaff(this.staffData.uuid);
    this.customMessage.goodsList = restApi.getGoodsList();

    this.loadHistoryMessage(true,0);
    this.getCustomerStatus();

    this.goEasy.im.on(this.GoEasy.IM_EVENT.CS_MESSAGE_RECEIVED, this.onReceivedMessage);
  },
  beforeDestroy() {
    this.goEasy.im.off(this.GoEasy.IM_EVENT.CS_MESSAGE_RECEIVED, this.onReceivedMessage);
  },
  methods: {
    renderTextMessage(text) {
      return this.emoji.decoder.decode(text);
    },

    getCustomerStatus () {
      this.goEasy.im.csTeam(this.teamData.id).customerStatus({
        id: this.customer.uuid,
        onSuccess: (result) => {
          this.customerStatus = result.content;
        },
        onFailed: (error) => {
          console.log('获取用户当前状态失败',error)
        }
      })
    },
    onReceivedMessage (message) {
      if (message.senderId === this.customer.uuid || message.type === 'ACCEPTED' || message.type === 'CLOSED') {
        this.history.messages.push(message);
        this.markMessageAsRead();
      }
      this.scrollToBottom(0);
    },
    markMessageAsRead() {
      this.goEasy.im.csTeam(this.teamData.id).markMessageAsRead({
        type: this.GoEasy.IM_SCENE.CS,
        id: this.customer.uuid,
        onSuccess: function () {
          console.log('标记已读成功');
        },
        onFailed: function (error) {
          console.log('标记已读失败', error);
        },
      });
    },
    loadHistoryMessage(scrollToBottom,offsetHeight) {
      this.history.loading = true;
      let lastMessageTimeStamp = null;
      let lastMessage = this.history.messages[0];
      if (lastMessage) {
        lastMessageTimeStamp = lastMessage.timestamp;
      }
      this.goEasy.im.csTeam(this.teamData.id).history({
        id: this.customer.uuid,
        type: this.GoEasy.IM_SCENE.CS,
        lastTimestamp: lastMessageTimeStamp,
        limit: 10,
        onSuccess: (result) => {
          this.history.loading = false;
          let messages = result.content;
          if (messages.length === 0) {
            this.history.allLoaded = true;
          } else {
            this.history.messages = messages.concat(this.history.messages);
            if (messages.length < 9) {
              this.history.allLoaded = true;
            }
            if (scrollToBottom) {
              this.scrollToBottom(offsetHeight);
              //收到的消息设置为已读
              this.markMessageAsRead();
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
    getImgHeight (width,height) {
      if (width < height) {
        return 'vertical-img'
      } else if (width > height) {
        return 'horizontal-img'
      } else {
        return 'normal-img'
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
    showImagePreview(url) {
      this.imagePreview.visible = true;
      this.imagePreview.url = url;
    },
    acceptSession () {
      this.goEasy.im.csTeam(this.teamData.id).accept({
        id: this.customer.uuid,
        onSuccess: (result) => {
          this.getCustomerStatus();
        },
        onFailed: (error) => {
          console.log('accept failed',error);
        }
      })
    },
    endSession () {
      this.goEasy.im.csTeam(this.teamData.id).end({
        id: this.customer.uuid,
        onSuccess: (result) => {
          this.getCustomerStatus();
        },
        onFailed: (error) => {
          console.log('endSession failed',error);
        }
      })
    },
    showEmojiBox () {
      this.emoji.visible = !this.emoji.visible;
    },
    chooseEmoji(emojiKey) {
      this.text += emojiKey;
      this.emoji.visible = false;
    },
    sendTextMessage() {
      if (!this.text.trim()) {
        console.log('输入为空');
        return
      }
      const textMessage = this.goEasy.im.csTeam(this.teamData.id).createTextMessage({
        text: this.text,
        to: this.to,
      });
      this.sendMessage(textMessage);
      this.text = '';
    },
    sendImageMessage(e) {
      let fileList = [...e.target.files];
      fileList.forEach((file) => {
        const imageMessage = this.goEasy.im.csTeam(this.teamData.id).createImageMessage({
          file: file,
          to: this.to,
        });
        imageMessage.buildOptions.complete.then(() => {
          this.sendMessage(imageMessage);
        }).catch((error) => {
          console.log(error);
        });
      })
    },
    sendVideoMessage(e) {
      const file = e.target.files[0];
      const videoMessage = this.goEasy.im.csTeam(this.teamData.id).createVideoMessage({
        file: file,
        to: this.to,
      });
      videoMessage.buildOptions.complete.then(() => {
        this.sendMessage(videoMessage);
      }).catch((error) => {
        console.log(error);
      });
    },
    showLinkBox () {
      this.customMessage.visible = true;
    },
    sendCustomMessage(goods) {
      this.customMessage.visible = false;
      const customMessage = this.goEasy.im.csTeam(this.teamData.id).createCustomMessage({
        type : 'goods',
        payload : goods,
        to: this.to,
      });
      this.sendMessage(customMessage);
    },
    sendMessage(message) {
      this.history.messages.push(message);
      this.scrollToBottom(0);
      this.goEasy.im.sendMessage({
        message: message,
        onSuccess: (message) => {
          console.log('发送成功',message);
        },
      });
    },
    listenScroll(e){
      if (e.target.scrollTop === 0 && !this.history.allLoaded) {
        const offsetHeight = this.$refs.messageList.offsetHeight;
        this.loadHistoryMessage(true,offsetHeight);
      }
    },
    scrollToBottom(offsetHeight) {
      this.$nextTick(() => {
        this.$refs.scrollView.scrollTop = this.$refs.messageList.scrollHeight - offsetHeight;
      });
    },
  }

};
</script>

<style lang="scss" scoped>
.chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  .chat-title {
    height: 61px;
    padding: 15px;
    display: flex;
    align-items: center;
    font-size: 18px;
    .chat-avatar {
      width: 40px;
      height: 40px;
    }
    .chat-name {
      margin-left: 10px;
    }
  }
  .chat-main {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    padding: 0 15px 250px 15px;
    scrollbar-color: transparent transparent;
    scrollbar-track-color: transparent;
    -ms-scrollbar-track-color: transparent;
    &::-webkit-scrollbar {
      width: 1px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #99565600;
    }
    .history-loaded {
      text-align: center;
      font-size: 12px;
      color: #af4e4e;
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
        .message-content {
          max-width: calc(100% - 100px);
          .message-payload{
            display: flex;
            align-items: center;
          }
          .pending{
            background: url("/static/images/pending.gif") no-repeat center;
            background-size: 13px;
            width: 15px;
            height: 15px;
          }
          .send-fail{
            background: url("/static/images/failed.png") no-repeat center;
            background-size: 13px;
            width: 15px;
            height: 15px;
          }
          .message-read {
            color: gray;
            font-size: 12px;
            text-align: end;
            margin: 0 10px;
            height: 16px;
          }
          .message-unread {
            color: #af4e4e;
            font-size: 12px;
            text-align: end;
            margin: 0 10px;
            height: 16px;
          }
          .content-text {
            display: flex;
            align-items: center;
            text-align: left;
            background: #eeeeee;
            font-size: 14px;
            font-weight: 500;
            padding: 6px 8px;
            margin: 5px;
            line-height: 25px;
            white-space: pre-line;
            overflow-wrap: anywhere;
            border-radius: 8px;
          }
          .content-image {
            display: block;
            margin: 5px 10px;
            cursor: pointer;
            img {
              height: 100%;
            }
          }
          .vertical-img {
            height: 200px;
          }
          .horizontal-img {
            height: 150px;
          }
          .normal-img {
            height: 100%;
          }
          .content-link {
            border-radius: 10px;
            background: #eeeeee;
            padding: 8px;
            display: flex;
            flex-direction: column;
            img {
              width: 100px;
              height: 100px;
            }
            .goods-description {
              font-weight: bold;
              margin-bottom: 20px;
            }
            .goods-info {
              display: flex;
              flex-direction: column;
              justify-content: space-around;
              font-size: 14px;
              padding: 14px 5px;
              .goods-name{
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
      .self/deep/.play-icon {
        background: url("/static/images/play.gif") no-repeat center;
        background-size: 20px;
        -moz-transform:rotate(180deg);
        -webkit-transform:rotate(180deg);
        -o-transform:rotate(180deg);
        transform:rotate(180deg);
      }
    }
  }
  .chat-footer {
    border-top: 1px solid #dcdfe6;
    width: 100%;
    height: 250px;
    position: absolute;
    bottom: 0;
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
          &:focus {
            outline: none;
          }
          &:hover {
            color: #af4e4e;
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
              width: 156px;
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
              .goods-item {
                display: flex;
                align-items: center;
                .goods-img {
                  width: 40px;
                  height: 40px;
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
        }
      }
      .input-box {
        padding: 0 10px;
        flex: 1;
        .input-content {
          height: 160px;
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
          border: 1px solid #af4e4e;
          background-color: #ffffff;
          color: #af4e4e;
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
        color: #af4e4e;
        margin-bottom: 10px;
      }
      .accept-btn {
        width: 75px;
        height: 30px;
        font-size: 15px;
        border: 1px solid #af4e4e;
        background-color: #ffffff;
        color: #af4e4e;
        border-radius: 5px;
        cursor: pointer;
      }
    }
  }
  .image-preview {
    max-width: 750px;
    max-height: 500px;
    background: rgba(0,0,0,0.8);
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
}
</style>
