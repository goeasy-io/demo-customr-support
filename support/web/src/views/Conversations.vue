<template>
  <div class="conversation-container">
    <div class="conversation-list">
      <div class="conversation-list-item">
        <div class="conversation-list-title">待接入 {{ pendingConversations.length }}</div>
        <div class="conversation-list-body">
          <div
            v-for="(conversation, key) in pendingConversations"
            :key="key" :class="{checked:conversation.id === $route.query.id}"
            class="conversation-item"
            @click="chat(conversation)"
          >
            <div class="conversation-item-head">
              <img :src="conversation.data.avatar" class="conversation-item-avatar"/>
            </div>
            <div class="item-info">
              <div class="item-info-name">{{ conversation.data.name }}</div>
              <div v-if="conversation.lastMessage.type === 'text'" class="item-info-message">
                {{ conversation.lastMessage.payload.text }}
              </div>
              <div v-else-if="conversation.lastMessage.type === 'image'" class="item-info-message">[图片消息]</div>
              <div v-else-if="conversation.lastMessage.type === 'video'" class="item-info-message">[视频消息]</div>
              <div v-else-if="conversation.lastMessage.type === 'audio'" class="item-info-message">[语音消息]</div>
              <div v-else-if="conversation.lastMessage.type === 'order'" class="item-info-message">[自定义消息:订单]</div>
              <div v-else-if="conversation.lastMessage.type === 'CS_END'" class="item-info-message">会话已结束</div>
              <div v-else-if="conversation.lastMessage.type === 'CS_ACCEPT'" class="item-info-message">接入成功</div>
              <div v-else-if="conversation.lastMessage.type === 'CS_TRANSFER'" class="item-info-message">
                {{
                  conversation.lastMessage.senderId === currentAgent.id ? `已转接给` +
                    conversation.lastMessage.payload.transferTo.data.name : '已接入来自' +
                    conversation.lastMessage.senderData.name + '的转接'
                }}
              </div>
              <div v-else class="item-info-message">[未识别内容]</div>
            </div>
          </div>
        </div>
      </div>
      <div class="conversation-list-item">
        <div class="conversation-list-title">已接入 {{ conversations.length }}</div>
        <div v-if="conversations.length" class="conversation-list-body">
          <div
            v-for="(conversation, key) in conversations"
            :key="key" :class="{checked:conversation.id === $route.query.id}"
            class="conversation-item"
            @click="chat(conversation)"
            @contextmenu.prevent.stop="e => showRightClickMenu(e,conversation)"
          >
            <div class="conversation-item-head">
              <img :src="conversation.data.avatar" class="conversation-item-avatar"/>
              <span v-if="conversation.unread" class="conversation-item-unread">{{ conversation.unread }}</span>
            </div>
            <div class="conversation-item-info">
              <div class="item-info-top">
                <div class="item-info-name">{{ conversation.data.name }}</div>
                <div class="item-info-time">{{ formatDate(conversation.lastMessage.timestamp) }}</div>
              </div>
              <div class="item-info-bottom">
                <div v-if="conversation.lastMessage.status === 'sending'" class="item-info-sending"></div>
                <div v-if="conversation.lastMessage.status === 'fail'" class="item-info-failed"></div>
                <div v-if="conversation.lastMessage.type === 'text'" class="item-info-message">
                  {{ conversation.lastMessage.payload.text}}
                </div>
                <div v-else-if="conversation.lastMessage.type === 'image'" class="item-info-message">[图片消息]</div>
                <div v-else-if="conversation.lastMessage.type === 'video'" class="item-info-message">[视频消息]</div>
                <div v-else-if="conversation.lastMessage.type === 'audio'" class="item-info-message">[语音消息]</div>
                <div v-else-if="conversation.lastMessage.type === 'order'" class="item-info-message">[自定义消息:订单]</div>
                <div v-else-if="conversation.lastMessage.type === 'CS_END'" class="item-info-message">会话已结束</div>
                <div v-else-if="conversation.lastMessage.type === 'CS_ACCEPT'" class="item-info-message">接入成功</div>
                <div v-else-if="conversation.lastMessage.type === 'CS_TRANSFER'" class="item-info-message">
                  {{
                    conversation.lastMessage.senderId === currentAgent.id ? `已转接给` +
                      conversation.lastMessage.payload.transferTo.data.name : '已接入来自' +
                      conversation.lastMessage.senderData.name + '的转接'
                  }}
                </div>
                <div v-else class="item-info-message">[未识别内容]</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="rightClickMenu.visible" :style="{'left': rightClickMenu.x + 'px', 'top': rightClickMenu.y + 'px'}"
           class="action-box">
        <div class="action-item" @click="topConversation">{{ rightClickMenu.conversation.top ? '取消置顶' : '置顶' }}</div>
        <div class="action-item" @click="deleteConversation">删除聊天</div>
      </div>
    </div>
    <div class="conversation-main">
      <router-view :key="$route.query.id"></router-view>
    </div>
  </div>
</template>

<script>
  import {formatDate} from '../utils/utils.js'

  export default {
    name: 'Conversation',
    data() {
      return {
        pendingConversations: [],
        conversations: [],
        // Conversation右键菜单
        rightClickMenu: {
          conversation: null,
          visible: false,
          x: null,
          y: null,
        },
        currentAgent: null
      }
    },
    created() {
      //隐藏Conversation右键菜单
      document.addEventListener('click', this.hideRightClickMenu);
      this.currentAgent = this.globalData.currentAgent;
      this.listenConversationUpdate(); //监听会话列表变化
      this.loadConversations(); //加载会话列表
    },
    beforeDestroy() {
      this.goEasy.im.off(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.renderLatestConversations);
      this.goEasy.im.off(this.GoEasy.IM_EVENT.PENDING_CONVERSATIONS_UPDATED, this.renderPendingConversations);
    },
    methods: {
      formatDate,
      loadConversations() {
        this.goEasy.im.pendingConversations({
          onSuccess: (result) => {
            this.renderPendingConversations(result.content);
          },
          onFailed: (error) => {
            console.log('获取待接入列表失败, code:' + error.code + 'content:' + error.content);
          },
        });
        this.goEasy.im.latestConversations({
          onSuccess: (result) => {
            this.renderLatestConversations(result.content);
          },
          onFailed: (error) => {
            console.log('获取已接入列表失败, code:' + error.code + 'content:' + error.content);
          },
        });
      },
      listenConversationUpdate() {
        // 监听会话列表变化
        this.goEasy.im.on(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.renderLatestConversations);
        this.goEasy.im.on(this.GoEasy.IM_EVENT.PENDING_CONVERSATIONS_UPDATED, this.renderPendingConversations);
      },
      renderPendingConversations(content) {
        this.pendingConversations = content.conversations;
      },
      renderLatestConversations(content) {
        this.conversations = content.conversations;
      },
      chat(conversation) {
        this.$router.replace({
          path: '/conversations/chat',
          query: {
            id: conversation.id,
            name: conversation.data.name,
            avatar: conversation.data.avatar
          }
        });
      },
      showRightClickMenu(e, conversation) {
        this.rightClickMenu.conversation = conversation;
        this.rightClickMenu.visible = true;
        this.rightClickMenu.x = e.pageX;
        this.rightClickMenu.y = e.pageY;
      },

      hideRightClickMenu() {
        this.rightClickMenu.visible = false;
      },

      topConversation() {
        let conversation = this.rightClickMenu.conversation;
        let description = conversation.top ? '取消置顶' : '置顶';
        this.goEasy.im.topConversation({
          top: !conversation.top,
          conversation: conversation,
          onSuccess: function () {
            console.log(description, '成功');
          },
          onFailed: function (error) {
            console.log(description, '失败：', error);
          },
        });
      },
      deleteConversation() {
        if (!this.rightClickMenu.conversation.ended) {
          alert("删除失败：会话尚未结束");
          return
        }
        let confirmResult = confirm('确认要删除这条会话吗？');
        if (confirmResult===true) {
          this.goEasy.im.removeConversation({
            conversation: this.rightClickMenu.conversation,
            onSuccess: function () {
              console.log('删除会话成功');
            },
            onFailed: function (error) {
              console.log(error);
            },
          });
        }
      }
    }
  }
</script>

<style scoped>
  .conversation-container {
    width: 100%;
    height: 100%;
    display: flex;
    background: #FFFFFF;
  }

  .conversation-list {
    width: 240px;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    padding: 10px;
    position: relative;
  }

  .conversation-list-title {
    font-size: 16px;
    margin: 10px;
    color: rgba(0, 0, 0, 0.9);
  }

  .conversation-list-body {
    overflow-y: auto;
    max-height: 350px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .conversation-list-body::-webkit-scrollbar {
    display: none;
  }

  .action-box {
    width: 100px;
    height: 60px;
    background: #ffffff;
    border: 1px solid #cccccc;
    position: fixed;
    z-index: 100;
    border-radius: 5px;
  }

  .action-item {
    padding-left: 15px;
    line-height: 30px;
    font-size: 13px;
    color: #262628;
    cursor: pointer;
  }

  .action-item:hover {
    background: #dddddd;
  }

  .conversation-item {
    display: flex;
    padding: 10px;
    cursor: pointer;
  }

  .conversation-item-head {
    position: relative;
    margin-right: 5px;
  }

  .conversation-item-avatar {
    width: 45px;
    height: 45px;
    border-radius: 4px;
  }

  .conversation-item-unread {
    position: absolute;
    top: -9px;
    right: -9px;
    width: 18px;
    height: 18px;
    line-height: 18px;
    border-radius: 50%;
    text-align: center;
    color: #fff;
    font-size: 12px;
    background-color: #fa5151;
  }

  .conversation-item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .item-info-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-info-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    font-size: 15px;
    width: 100px;
    line-height: 25px;
    color: #333333;
  }

  .item-info-time {
    color: #666666;
    font-size: 12px;
  }

  .item-info-bottom {
    display: flex;
    align-items: center;
  }

  .item-info-message {
    font-size: 12px;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 150px;
    color: #606266;
  }

  .item-info-failed {
    background: url("../assets/images/failed.png") no-repeat center;
    background-size: 12px;
    width: 12px;
    height: 12px;
    margin-right: 2px;
  }

  .item-info-sending {
    background: url("../assets/images/pending.gif") no-repeat center;
    background-size: 12px;
    width: 12px;
    height: 12px;
    margin-right: 2px;
  }

  .checked {
    background: #eeeeee;
    border-radius: 5px;
  }

  .conversation-main {
    flex: 1;
    background: #FFFFFF;
  }

</style>
