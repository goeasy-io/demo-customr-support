<template>
  <div class="chat-container">
    <div class="chat-title">
      <img class="chat-avatar" :src="client.avatar" />
      <div class="chat-name">{{ client.name }}</div>
<!--      <div class="chat-action" @click="endSession">-->
<!--        <i class="iconfont icon-jieshu" title="结束会话"></i>-->
<!--      </div>-->
    </div>
    <div class="chat-main" ref="scrollView">
      <div class="message-list" ref="messageList">
        <div class="history-loaded" @click="loadHistoryMessage(false,0)">
          {{ history.allLoaded ? '已经没有更多的历史消息' : '获取历史消息' }}
        </div>
        <div v-for="(message, index) in history.messages" :key="index">
          <div class="time-tips">
            {{ renderMessageDate(message, index) }}
          </div>
          <div class="message-item">
            <div class="message-item-content" :class="{ self: message.senderId === currentStaff.uuid }">
              <div class="message-content">
                <div class="message-payload">
                  <div class="pending" v-if="message.status === 'sending'"></div>
                  <div class="send-fail" v-if="message.status === 'fail'"></div>
                  <div class="content-text" v-if="message.type === 'text'">
                    {{ emoji.decoder.decode(message.payload.text) }}
                  </div>
                  <div class="content-image"
                    v-if="message.type === 'image'"
                    :style="getImgHeight(message.payload.width,message.payload.height)"
                    @click="showImagePreview(message.payload.url)"
                  >
                    <img :src="message.payload.url" alt="图片" />
                  </div>
                  <a
                    v-if="message.type === 'file'"
                    :href="message.payload.url"
                    target="_blank"
                    download="download"
                  >
                    <div class="content-file">
                      <div class="file-info">
                        <span class="file-name">{{ message.payload.name }}</span>
                        <span class="file-size">{{ (message.payload.size / 1024).toFixed(2) }}KB</span>
                      </div>
                      <img class="file-img" src="/static/images/file.png" />
                    </div>
                  </a>
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
                  <div class="content-custom" v-if="message.type === 'order'">
                    <div class="title">
                      <img src="/static/images/order.png" />
                      <div>自定义消息</div>
                    </div>
                    <div>编号: {{message.payload.number}}</div>
                    <div>商品: {{message.payload.goods}}</div>
                    <div>金额: {{message.payload.price}}</div>
                  </div>
                  <div v-if="message.type === 'goods'" class="content-goods">
                    <div class="goods-description">为你推荐：</div>
                    <div style="display: flex;background-color: #fffcfc;">
                      <img :src="message.payload.url"/>
                      <div class="goods-info">
                        <div class="goods-name">{{message.payload.name}}</div>
                        <div style="color: #434343;">月销17</div>
                        <div class="foods-price">{{message.payload.price}}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div :class="message.read ?'message-read':'message-unread'">
                  <div v-if="message.senderId === currentStaff.uuid">{{message.read?'已读':'未读'}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-footer">
      <!--todo: clientStatus的时间处理-->
      <div v-if="clientStatus.status==='PENDING'" class="accept-session">
        <button class="accept-btn" @click="acceptSession">接入</button>
      </div>
      <div v-else-if="clientStatus.status==='ACCEPTED' && currentStaff.uuid !== clientStatus.staff.id" class="accept-session">
        <button class="accept-btn">{{ clientStatus.staff.data.name }}已接入</button>
      </div>
      <div v-else-if="clientStatus.status==='FREE'" class="accept-session">
        <button class="accept-btn" @click="acceptSession">发起会话</button>
      </div>
      <div v-else class="action-box">
        <div class="action-bar">
          <div class="chat-action">
            <!-- 表情 -->
            <div class="action-item">
              <i class="iconfont icon-smile" title="表情" @click=""></i>
            </div>
            <!-- 图片 -->
            <div class="action-item">
              <label for="img-input">
                <i class="iconfont icon-picture" title="图片"></i>
              </label>
            </div>
            <!-- 视频 -->
            <div class="action-item">
              <label for="video-input">
                <i class="iconfont icon-film" title="视频"></i>
              </label>
            </div>
            <!-- 文件 -->
            <div class="action-item">
              <label for="file-input">
                <i class="iconfont icon-wj-wjj" title="文件"></i>
              </label>
            </div>
            <!-- 自定义 -->
            <div class="action-item">
              <i class="iconfont icon-dingdan" title="订单" @click=""></i>
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
  </div>
</template>

<script>
import restApi from '../../api/restapi';
import EmojiDecoder from '../../utils/EmojiDecoder';
import GoeasyAudioPlayer from "../../components/GoEasyAudioPlayer/GoEasyAudioPlayer";
import GoeasyVideoPlayer from "../../components/GoEasyVideoPlayer/GoEasyVideoPlayer";
import RestApi from "../../api/restapi";
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
      currentStaff: null,
      currentTeam: null,
      client: null,
      clientStatus: {},

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
    }
  },
  created() {
    let clientId = this.$route.params.id;
    clientId = clientId.split('#')[0];

    this.client = restApi.findUserById(clientId);
    this.currentStaff = JSON.parse(localStorage.getItem("currentStaff"));
    this.currentTeam = restApi.findShopByStaff(this.currentStaff.uuid);
    console.log('this.client',this.client);
    console.log('this.currentTeam',this.currentTeam);

    this.loadHistoryMessage(true,0);
    this.getClientStatus();

    this.goEasy.im.on(this.GoEasy.IM_EVENT.CS_MESSAGE_RECEIVED, this.onReceivedMessage);
  },
  beforeDestroy() {
    this.goEasy.im.off(this.GoEasy.IM_EVENT.CS_MESSAGE_RECEIVED, this.onReceivedMessage);
  },
  methods: {
    getClientStatus () {
      this.goEasy.im.csTeam(this.currentTeam.id).customerStatus({
        id: this.client.uuid,
        onSuccess: (result) => {
          console.log('clientStatus:',result);
          this.clientStatus = result.content;
        },
        onFailed: (error) => {
          console.log('获取用户当前状态失败',error)
        }
      })
    },
    onReceivedMessage (message) {
      if (message.senderId === this.client.uuid) {
        this.history.messages.push(message);
        this.markMessageAsRead();
      }
      this.scrollToBottom();
    },
    markMessageAsRead() {
      console.log('currentTeam:',this.currentTeam.id)
      console.log('id:',this.client.uuid)
      this.goEasy.im.csTeam(this.currentTeam.id).markMessageAsRead({
        type:'cs',
        id: this.client.uuid,
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
      //历史消息
      let lastMessageTimeStamp = null;
      let lastMessage = this.history.messages[0];
      if (lastMessage) {
        lastMessageTimeStamp = lastMessage.timestamp;
      }
      this.goEasy.im.history({
        userId: this.client.uuid,
        lastTimestamp: lastMessageTimeStamp,
        limit: 10,
        onSuccess: (result) => {
          this.history.loading = false;
          let messages = result.content;
          if (messages.length === 0) {
            this.history.allLoaded = true;
          } else {
            this.history.messages = messages.concat(this.history.messages);
            if (messages.length < 10) {
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
        return { height:'200px' }
      } else if (width > height) {
        return { height:'150px' }
      } else {
        return { height: '100%' }
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
      this.goEasy.im.csTeam(this.currentTeam.id).accept({
        id: this.client.uuid,
        onSuccess: (result) => {
          console.log('accept',result);
          this.getClientStatus();
        },
        onFailed: (error) => {
          console.log('accept failed',error);
        }
      })
    },
    endSession () {
      this.goEasy.im.csTeam(this.currentTeam.id).end({
        id: this.client.uuid,
        onSuccess: (result) => {
          console.log('endSession',result);
          this.getClientStatus();
        },
        onFailed: (error) => {
          console.log('endSession failed',error);
        }
      })
    },
    sendTextMessage() {
      if (!this.text.trim()) {
        console.log('输入为空');
        return
      }
      const textMessage = this.goEasy.im.csTeam(this.currentTeam.id).createTextMessage({
        text: this.text,
        to: {
          type: this.GoEasy.IM_SCENE.CS,
          id: this.client.uuid,
          data: this.client,
        },
      });
      this.sendMessage(textMessage);
      this.text = '';
    },
    sendMessage(message) {
      this.history.messages.push(message);
      this.scrollToBottom();
      this.goEasy.im.sendMessage({
        message: message,
        onSuccess: (message) => {
          console.log('发送成功',message);
        },
      });
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
    //border-bottom: 1px solid #dae3ef;
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
      color: #9fc8ff;
      cursor: pointer;
      line-height: 20px;
    }
    .time-tips {
      color: #999;
      text-align: center;
      font-size: 12px;
    }
    .message-item {
      display: flex;
      .message-item-checkbox {
        height: 55px;
        margin-right: 15px;
        display: flex;
        align-items: center;
      }
      .message-item-content {
        flex: 1;
        max-height: 230px;
        margin: 5px 0;
        overflow: hidden;
        display: flex;
        .user-avatar > img {
          width: 45px;
          height: 45px;
          margin-top: 5px;
        }
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
            color: #9fc8ff;
            font-size: 12px;
            text-align: end;
            margin: 0 10px;
            height: 16px;
          }
          .content-text {
            text-align: left;
            background: #FFFFFF;
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
          .content-file {
            width: 240px;
            height: 65px;
            font-size: 15px;
            background: white;
            display: flex;
            margin: 5px 10px;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            &:hover {
              background: #f6f2f2;
            }
            .file-info {
              width: 194px;
              text-align: left;
              .file-name {
                text-overflow: ellipsis;
                overflow: hidden;
                display: -webkit-box;
                word-break: break-all;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              }
              .file-size {
                font-size: 12px;
                color: #ccc;
              }
            }
            .file-img {
              width: 30px;
              height: 30px;
              margin: auto 8px;
            }
          }
          .content-custom {
            width: 150px;
            height: 110px;
            display: flex;
            flex-direction: column;
            font-size: 14px;
            background: #ffffff;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            padding: 0 10px;
            margin: 5px 10px;
            text-align: left;
            line-height: 25px;
            .title {
              display: flex;
              align-items: center;
              font-size: 15px;
              flex: 1;
              img {
                width: 20px;
                height: 20px;
                margin-right: 5px;
              }
            }
          }
          .content-goods {
            border-radius: 10px;
            background: #ffffff;
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
        .content-text {
          background: #dae3ef !important;
        }
      }
      .self/deep/.audio-facade {
        flex-direction: row-reverse;
        background: #d1bfb6 !important;
      }
      .self/deep/.audio-facade-bg {
        background: url("/static/images/voice.png") no-repeat center;
        background-size: 15px;
        width: 20px;
        -moz-transform:rotate(180deg);
        -webkit-transform:rotate(180deg);
        -o-transform:rotate(180deg);
        transform:rotate(180deg);
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
    .action-box {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #F0F0F0;
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
            color: #9fc8ff;
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
              top: -126px;
              left: -53px;
              z-index: 2007;
              margin-bottom: 12px;
              background: #fff;
              min-width: 150px;
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
                .emoji-item {
                  width: 50px;
                  height: 50px;
                }
              }
            }
            .order-form {
              width: 220px;
              position: absolute;
              top: -160px;
              left: -105px;
              z-index: 2015;
              margin-bottom: 12px;
              background: #fff;
              border: 1px solid #ebeef5;
              padding: 12px;
              color: #606266;
              text-align: justify;
              font-size: 14px;
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
              border-radius: 4px;
              .order-form-item {
                display: flex;
                margin: 10px 0;
                .order-form-label {
                  width: 50px;
                }
                .order-form-input {
                  input:focus-visible {
                    outline: none;
                  }
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
          background: #F0F0F0;
        }
      }
      .send-box {
        padding: 5px 10px;
        text-align: right;
        .send-button {
          width: 60px;
          height: 30px;
          font-size: 15px;
          border: 1px solid #9fc8ff;
          background-color: #dae3ef;
          color: #327fe5;
          border-radius: 5px;
        }
      }
    }
    .accept-session {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      .accept-btn {
        width: 75px;
        height: 30px;
        font-size: 15px;
        border: 1px solid #9fc8ff;
        background-color: #dae3ef;
        color: #327fe5;
        border-radius: 5px;
        cursor: pointer;
      }
    }
  }
}
</style>
