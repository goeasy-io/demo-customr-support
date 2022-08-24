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
            <div v-if="message.type === 'CS_ACCEPT'" class="accept-message">
              {{message.senderData.name}}已接入
            </div>
            <div v-else-if="message.type === 'CS_END'" class="accept-message">
              {{message.senderData.name}}已结束
            </div>
			<div v-else-if="message.type === 'CS_TRANSFER'" class="accept-message">
				{{message.senderId === staffData.uuid ? `已转接给` + message.payload.transferTo.data.name: '已接入来自' + message.senderData.name +'的转接'}}
			</div>
            <div v-else class="message-item-content" :class="{ self: message.senderId !== customer.uuid }">
              <div class="sender-info">
                <img class="sender-avatar" :src="message.senderData.avatar" />
                <div class="sender-name" v-if="message.senderId !== customer.uuid">{{message.senderData.name}}</div>
              </div>
              <div class="message-content">
                <div class="message-payload">
                  <div class="pending" v-if="message.status === 'sending'"></div>
                  <div class="send-fail" v-if="message.status === 'fail'"></div>
                  <div class="content-text" v-if="message.type === 'text'" v-html="renderTextMessage(message.payload.text)"></div>

                  <div class="content-image"
                    v-if="message.type === 'image'"
                    :class="getImgClass(message.payload.width,message.payload.height)"
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
                  <div v-if="message.type === 'order'" class="content-order">
                    <div class="order-description">发送订单：</div>
                    <div class="order-content">
                      <img :src="message.payload.url"/>
                      <div class="order-info">
                        <div class="order-name">{{message.payload.name}}</div>
                        <div>月销17</div>
                        <div>{{message.payload.price}}</div>
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
      <div v-if="customerStatus && customerStatus.status==='PENDING'" class="accept-session">
        <div class="accept-info">会话已等待{{Math.ceil((Date.now()-customerStatus.time)/60000)}}分钟</div>
        <button class="accept-btn" @click="acceptSession">立即接入</button>
      </div>
      <div v-else-if="customerStatus && customerStatus.status==='ACCEPTED' && staffData.uuid !== customerStatus.staff.id" class="accept-session">
        <div class="accept-info">{{ customerStatus.staff.data.name }}已接入</div>
      </div>
      <div v-else-if="customerStatus && customerStatus.status==='FREE'" class="accept-session">
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
                <div class="order-item" v-for="(order, index) in customMessage.orderList" :key="index" @click="sendCustomMessage(order)">
                  <img class="order-img" :src="order.url">
                  <div>{{order.name}}</div>
                </div>
              </div>
              <i class="iconfont icon-lianjie" title="商品链接" @click="showLinkBox"></i>
            </div>
          </div>
		<div class="session-action">
			<span @click="transferStaffs()" class="transfer">转接</span>
			<i class="iconfont icon-end_chat" title="结束会话" @click="endSession"></i>
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
	<!-- 转接弹窗 -->
	<div v-if="transferModel" class="transfer-popup">
		<div class="transfer-model">
			<div class="transfer-content">
				<div class="transfer-to-info" v-for="(staff, index) in staffs">
					<label>
						<img class="transfer-to-avatar" :src="staff.data.avatar"></img>
						<span class="transfer-to-name">{{staff.data.name}}</span>
						<input :name="staff.data.name" :value="staff" v-model="transferTo" type="radio"/>
					</label>
				</div>
			</div>
			<span class="transfer-button" @click="transfer()">确认</span>
			<span class="transfer-button" @click="closeTransferModel()">取消</span>
		</div>
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
      customerStatus: null,

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
        orderList:[],
        visible: false,
      },
	  staffs: [],
	  transferModel: false,
	  transferTo: null
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
    this.customMessage.orderList = restApi.getOrderList();
	
    this.loadHistoryMessage(true, 0);
    this.getCustomerStatus();
	this.markMessageAsRead();
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
		    console.log('获取用户当前状态失败',error);
		  }
		})
    },
    onReceivedMessage (message) {
		if (this.existsMessage(message)) {
			return;
		}
		if (this.teamData.id === message.teamId && (this.customer.uuid === message.senderId || this.customer.uuid === message.to)) {
			if (this.customerStatus) {
				if (this.customerStatus.sessionId === message.sessionId) {
					if (message.type === 'CS_TRANSFERRED') {
						this.refresh();
					} else {
						this.history.messages.push(message);
						this.markMessageAsRead();
						this.scrollTo(0);
					}
				} else {
					this.refresh();
				}
			} else {
				this.history.messages.push(message);
				this.markMessageAsRead();
				this.scrollTo(0);
			}
		}
    },
	existsMessage(newMessage) {
		let exists = false;
		for(let i = this.history.messages.length - 1; i >=0; i--) {
			let message = this.history.messages[i];
			if (newMessage.messageId === message.messageId) {
				exists = true;
				break;
			}
		}
		return exists;
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
        }
      });
    },
	refresh() {
		this.$emit('refresh', this.customer.uuid);
	},
    loadHistoryMessage(scrollTo,offsetHeight) {
      this.history.loading = true;
      let lastMessageTimeStamp;
      let lastMessage = this.history.messages[0];
      if (lastMessage) {
        lastMessageTimeStamp = lastMessage.timestamp;
      }
	  let limit = 10;
      this.goEasy.im.csTeam(this.teamData.id).history({
        id: this.customer.uuid,
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
            if (scrollTo) {
              this.scrollTo(offsetHeight);
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
    getImgClass (width,height) {
      if (height < 200) {
        return 'normal-img'
      } else if (width <= height) {
        return 'vertical-img'
      } else if (width > height) {
        return 'horizontal-img'
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
			if (this.customerStatus.sessionId === result.customerStatus.sessionId) {
				this.history.messages.push(result.message);
				this.scrollTo(0);
			} else {
				this.reloadHistory();
			}
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
			this.customerStatus = result.customerStatus;
			this.history.messages.push(result.message);
			this.scrollTo(0);
        },
        onFailed: (error) => {
          console.log('end failed',error);
        }
      })
    },
	transferStaffs() {
		this.goEasy.im.csTeam(this.teamData.id).staffs({
			onSuccess: (result) => {
				this.transferModel = true;
				this.staffs = result.content.filter((staff) => {
					return staff.id !== this.staffData.uuid;
				});
			},
			onFailed: (error) => {
				console.log('query online staffs failed',error);
			}
		});
	},
	transfer() {
		this.goEasy.im.csTeam(this.teamData.id).transfer({
			id: this.customer.uuid,
			to: this.transferTo.id,
			onSuccess: (result) => {
				this.transferModel = false;
				this.customerStatus = result.customerStatus;
				this.history.messages.push(result.message);
				this.scrollTo(0);
			},
			onFailed: (error) => {
				console.log('transfer failed',error);
			}
		})
	},
	closeTransferModel() {
		this.transferModel = false;
	},
    showEmojiBox () {
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
      this.goEasy.im.csTeam(this.teamData.id).createTextMessage({
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
        this.goEasy.im.csTeam(this.teamData.id).createImageMessage({
          file: file,
          to: this.to,
          onProgress :function (progress) {
            console.log(progress)
          },
          onSuccess: (message) => {
            this.sendMessage(message);
          },
          onFailed: (e) => {
            console.log('error :',e);
          }
        });
      })
    },
    sendVideoMessage(e) {
      const file = e.target.files[0];
      this.goEasy.im.csTeam(this.teamData.id).createVideoMessage({
        file: file,
        to: this.to,
        onProgress :function (progress) {
          console.log(progress)
        },
        onSuccess: (message) => {
          this.sendMessage(message);
        },
        onFailed: (e) => {
          console.log('error :',e);
        }
      });
    },
    showLinkBox () {
      this.customMessage.visible = true;
    },
    sendCustomMessage(order) {
      this.customMessage.visible = false;
      this.goEasy.im.csTeam(this.teamData.id).createCustomMessage({
        type : 'order',
        payload : order,
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
      this.scrollTo(0);
      this.goEasy.im.sendMessage({
        message: message,
        onSuccess: (message) => {
          console.log('发送成功',message);
        },
      });
    },
    listenScroll(e){ // todo:命名
      // 监听视图滚动到顶部，自动加载历史消息
      if (e.target.scrollTop === 0 && !this.history.allLoaded) {
        const offsetHeight = this.$refs.messageList.offsetHeight;
        // 记录加载消息前scrollView的高度，加载历史消息之后滚动回原来的位置
        this.loadHistoryMessage(true,offsetHeight);
      }
    },
	scrollTo(offsetHeight) {
		// offsetHeight 距底部的偏移高度，为0则表示滚动到底部
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
      border-radius: 50%;
    }
    .chat-name {
      margin-left: 10px;
    }
  }
  .chat-main {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    padding: 0 15px 200px 15px;
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
          .message-payload{
            display: flex;
            align-items: center;
          }
          .pending{
            background: url(/static/images/pending.gif) no-repeat center;
            background-size: 13px;
            width: 15px;
            height: 15px;
          }
          .send-fail{
            background: url(/static/images/failed.png) no-repeat center;
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
              .order-name{
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
    height: 200px;
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
  
  .transfer-popup {
	  position: absolute;
	  left: 0; 
	  right: 0;
	  top: 0;
	  bottom: 0;
	  
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  
	  background: rgba(165, 42, 42, 0.3);
	  
	  .transfer-model {
		  width: 100%;
		  padding: 5px;
		  box-sizing: border-box;
		  border: 1px solid gainsboro;
		  border-radius: 4px;
		  text-align: center;
		  background: #fff;
		  
		  .transfer-content {
			  display: flex;
			  align-items: center;
			  justify-content: center;
			  flex-wrap: wrap;
			  
			  .transfer-to-info {
				  padding: 20px;
				  
				  .transfer-to-avatar {
					  width: 40px;
					  height: 40px;
					  min-width: 40px;
					  min-height: 40px;
				  }
				  
				  .transfer-to-name {
					  word-break: break-all;
				  }
			  }
		  }
		  
		  .transfer-button {
			  display: inline-block;
			  padding: 5px;
			  border: 1px solid gainsboro;
			  border-radius: 4px;
			  cursor: pointer;
		   }
	  }
  }
}
</style>
