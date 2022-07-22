<template>
  <div class="conversation-container">
    <div class="conversation-list">
      <div class="conversation-list-item">
        <div class="conversation-list-title">待接入 {{ pendingConversations.length }}</div>
        <div class="conversation-list-body">
          <div
            class="consult-user"
            v-for="(conversation, key) in pendingConversations" :key="key"
            @click="goChatPage(conversation.id)"
            :class="{checked:conversation.id === $route.params.id}"
          >
            <img class="user-avatar" :src="conversation.data.avatar" />
            <div class="consult-content">
              <div class="consult-name">{{ conversation.data.name }}</div>
              <div class="consult-msg">{{ renderLastMessageContent(conversation) }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="conversation-list-item">
        <div class="conversation-list-title">已接入 {{ conversations.length }}</div>
        <div class="conversation-list-body" v-if="conversations.length">
          <div
            class="conversation-item"
            v-for="(conversation, key) in conversations" :key="key"
            @click="goChatPage(conversation.id)"
            :class="{checked:conversation.id === $route.params.id}"
          >
            <div class="consult-user">
              <img class="user-avatar" :src="conversation.data.avatar" />
              <div class="consult-content">
                <div class="consult-name">{{ conversation.data.name }}</div>
                <div class="consult-msg">{{ renderLastMessageContent(conversation) }}</div>
              </div>
            </div>
            <span class="more-action" @click.stop="showAction(conversation)">
              <i class="iconfont icon-more"></i>
            </span>
          </div>
        </div>
      </div>
      <div v-if="actionPopup.visible">
        <div class="layer" @click="actionPopup.visible = false"></div>
        <div class="action-box">
          <div class="action-item" @click="topConversation">
            {{ actionPopup.conversation.top ? '取消置顶' : '置顶聊天' }}
          </div>
          <div class="action-item" @click="deleteConversation">删除聊天</div>
        </div>
      </div>
    </div>
    <div class="conversation-main">
      <Chat v-if="$route.name === 'Chat'" :key="$route.params.id"></Chat>
    </div>
  </div>
</template>

<script>
import Chat from "./Chat";
export default {
  name: 'Conversation',
  components: {
    Chat
  },
  data() {
    return {
      pendingConversations: [],
      conversations : [],
      actionPopup: {
        conversation: null,
        visible: false,
      },
    }
  },
  created() {
    this.listenConversationUpdate(); //监听会话列表变化
    this.loadConversations(); //加载会话列表
  },
  beforeDestroy(){
    this.goEasy.im.off(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.renderLatestConversations);
    this.goEasy.im.off(this.GoEasy.IM_EVENT.PENDING_CONVERSATIONS_UPDATED, this.renderPendingConversations);
  },
  methods: {
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
    goChatPage (id) {
      this.$router.push({
        name: 'Chat',
        params: { id: id },
      });
    },
    showAction(conversation) {
      this.actionPopup.conversation = conversation;
      this.actionPopup.visible = true;
    },
    topConversation () {
      this.actionPopup.visible = false;
      let conversation = this.actionPopup.conversation;
      let description = conversation.top ? '取消置顶' : '置顶';
      this.goEasy.im.topConversation({
        conversation: this.actionPopup.conversation,
        onSuccess: function () {
          console.log(description,'成功');
        },
        onFailed: function (error) {
          console.log(description,'失败：',error);
        },
      });
    },
    deleteConversation () {
      this.actionPopup.visible = false;
      this.goEasy.im.removeConversation({
        conversation: this.actionPopup.conversation,
        onSuccess: function () {
          console.log('删除会话成功');
        },
        onFailed: function (error) {
          console.log(error);
        },
      });
    },
    renderLastMessageContent (conversation) {
      let content = '[未识别内容]';
      switch (conversation.lastMessage.type) {
        case 'text' :
          content = conversation.lastMessage.payload.text;
          break
        case 'image' :
          content = '[图片消息]';
          break
        case 'video' :
          content = '[视频消息]';
          break
        case 'audio' :
          content = '[语音消息]';
          break
        case 'goods' :
          content = '[自定义消息:商品]';
          break
        case 'CLOSED' :
          content = '会话已结束';
          break
        case 'ACCEPTED' :
          content = `${conversation.lastMessage.senderData.name}已接入`;
          break
        default: {
          content = '[未识别内容]';
          break
        }
      }
      return content;
    }
  }
}
</script>

<style lang="scss" scoped>
.conversation-container {
  width: 100%;
  height: 100%;
  display: flex;
  background: #FFFFFF;
  .conversation-list {
    width: 240px;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    padding: 10px;
    position: relative;
    .conversation-list-item {
      .conversation-list-title {
        font-size: 16px;
        margin: 10px;
        color: #666666;
      }
      .conversation-list-body {
        overflow-y: auto;
        max-height: 200px;
        &::-webkit-scrollbar { // Chrome Safari
          display: none;
        }
        scrollbar-width: none; // firefox
        -ms-overflow-style: none; // IE 10+
        .conversation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 5px;
          .more-action {
            margin: 8px;
            font-size: 18px;
            cursor: pointer;
          }
        }
      }
    }
    .layer {
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(51, 51, 51, 0.5);
      width: 260px;
      height: 100%;
      z-index: 99;
    }
    .action-box {
      width: 150px;
      height: 80px;
      background: #ffffff;
      position: absolute;
      top: 310px;
      left: 55px;
      z-index: 100;
      border-radius: 10px;
      overflow: hidden;
    }
    .action-item {
      text-align: center;
      line-height: 40px;
      font-size: 15px;
      color: #262628;
      border-bottom: 1px solid #efefef;
      cursor: pointer;
    }
    .consult-user {
      display: flex;
      padding: 5px;
      margin-top: 5px;
      .user-avatar {
        width: 45px;
        height: 45px;
        margin-right: 5px;
      }
      .consult-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .consult-name {
          font-size: 15px;
          line-height: 25px;
          color: #333333;
        }
        .consult-msg {
          font-size: 12px;
          line-height: 20px;
          color: #606266;
        }
      }
    }
    .checked {
      background: #eeeeee;
    }
  }
  .conversation-main {
    flex: 1;
    background: #FFFFFF;
  }
}

</style>
