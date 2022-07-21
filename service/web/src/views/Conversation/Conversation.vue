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
              <div class="consult-msg">{{ conversation.lastMessage.payload.text }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="conversation-list-item">
        <div class="conversation-list-title">已接入 {{ conversations.length }}</div>
        <div class="conversation-list-body" v-if="conversations.length">
          <div
            class="consult-user"
            v-for="(conversation, key) in conversations" :key="key"
            @click="goChatPage(conversation.id)"
            :class="{checked:conversation.id === $route.params.id}"
          >
            <img class="user-avatar" :src="conversation.data.avatar" />
            <div class="consult-content">
              <div class="consult-name">{{ conversation.data.name }}</div>
              <div class="consult-msg">{{ conversation.lastMessage.payload.text }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="conversation-main">
      <Chat v-if="$route.name === 'Chat'" :key="$route.params.id"></Chat>
    </div>
  </div>
</template>

<script>
import Chat from "../Chat/Chat";
export default {
  name: 'Conversation',
  components: {
    Chat
  },
  data() {
    return {
      currentStaff: {},
      pendingConversations: [],
      conversations : [],
    }
  },
  created() {
    this.currentStaff = localStorage.getItem('currentStaff');
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
          let content = result.content;
          this.renderPendingConversations(content);
        },
        onFailed: (error) => {
          console.log('获取待接入列表失败, code:' + error.code + 'content:' + error.content);
        },
      });
      this.goEasy.im.latestConversations({
        onSuccess: (result) => {
          let content = result.content;
          this.renderLatestConversations(content);
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
      this.pendingConversations = content.conversations.filter((conversation) => {
        return conversation.type === 'cs'
      });
    },
    renderLatestConversations(content) {
      this.conversations = content.conversations.filter((conversation) => {
        return conversation.type === 'cs'
      });
    },
    goChatPage (id) {
      this.$router.push({
        name: 'Chat',
        params: { id: id },
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.conversation-container {
  width: 100%;
  height: 100%;
  display: flex;
  background: #F7F7F7;
  .conversation-list {
    width: 240px;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    padding: 10px;
    .conversation-list-item {
      .conversation-list-title {
        font-size: 18px;
        margin: 10px;
      }
      .conversation-list-body {
        overflow-y: auto;
        max-height: 200px;
        &::-webkit-scrollbar { // Chrome Safari
          display: none;
        }
        scrollbar-width: none; // firefox
        -ms-overflow-style: none; // IE 10+
      }

    }
    .consult-user {
      display: flex;
      padding: 5px;
      margin-top: 5px;
      //border: 1px solid #dae3ef;
      border-radius: 5px;
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
      //border: 1px solid #dae3ef;
      background: #dae3ef;
    }
  }
  .conversation-main {
    flex: 1;
    background: #F0F0F0;
  }
}

</style>
