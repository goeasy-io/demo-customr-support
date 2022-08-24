<template>
  <div class="conversation-container">
    <div class="conversation-list">
      <div class="conversation-list-item">
        <div class="conversation-list-title">待接入 {{ pendingConversations.length }}</div>
        <div class="conversation-list-body">
          <div
            class="conversation-item"
            v-for="(conversation, key) in pendingConversations" :key="key"
            @click="goChatPage(conversation.id)"
            :class="{checked:conversation.id === $route.params.id}"
          >
            <div class="item-head">
              <img class="item-avatar" :src="conversation.data.avatar" />
            </div>
            <div class="item-info">
              <div class="item-info-name">{{ conversation.data.name }}</div>
              <div class="item-info-message" v-if="conversation.lastMessage.type === 'text'">{{ conversation.lastMessage.payload.text }}</div>
              <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'image'">[图片消息]</div>
              <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'video'">[视频消息]</div>
              <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'audio'">[语音消息]</div>
              <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'goods'">[自定义消息:商品]</div>
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
            @contextmenu.prevent.stop="e => showAction(e,conversation)"
          >
            <div class="item-head">
              <img class="item-avatar" :src="conversation.data.avatar" />
              <span class="item-unread-num" v-if="conversation.unread">{{conversation.unread}}</span>
            </div>
            <div class="item-info">
              <div class="item-info-top">
                <div class="item-info-name">{{ conversation.data.name }}</div>
                <div class="item-info-time">{{ formatDate(conversation.lastMessage.timestamp) }}</div>
              </div>
              <div class="item-info-bottom">
                <div class="item-info-sending" v-if="conversation.lastMessage.status === 'sending'"></div>
                <div class="item-info-failed" v-if="conversation.lastMessage.status === 'fail'"></div>
                <div class="item-info-message" v-if="conversation.lastMessage.type === 'text'">{{ conversation.lastMessage.payload.text }}</div>
                <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'image'">[图片消息]</div>
                <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'video'">[视频消息]</div>
                <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'audio'">[语音消息]</div>
                <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'order'">[自定义消息:订单]</div>
                <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'CS_END'">会话已结束</div>
                <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'CS_ACCEPT'">接入成功</div>
                <div class="item-info-message" v-else-if="conversation.lastMessage.type === 'CS_TRANSFER'">
                {{conversation.lastMessage.senderId === staffData.uuid ? `已转接给` + conversation.lastMessage.payload.transferTo.data.name: '已接入来自' + conversation.lastMessage.senderData.name +'的转接'}}
              </div>
              <div class="item-info-message" v-else>[未识别内容]</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="actionPopup.visible" class="action-box" :style="{'left': actionPopup.left + 'px', 'top': actionPopup.top + 'px'}">
        <div class="action-item" @click="topConversation">{{ actionPopup.conversation.top ? '取消置顶' : '置顶' }}</div>
        <div class="action-item" @click="deleteConversation">删除聊天</div>
      </div>
    </div>
    <div class="conversation-main">
      <Chat v-if="$route.name === 'Chat' && isRouterAlive" :key="$route.params.id" @refresh="refresh"></Chat>
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
        left: null,
        right: null,
      },
	  isRouterAlive: true,
	  staffData: null
    }
  },
  watch: {
    $route() {
		this.currentPage = this.$route.name;
    },
  },
  created() {
    document.addEventListener('click', () => {
      this.actionPopup.visible = false
    })
	  this.staffData = JSON.parse(localStorage.getItem("staffData"));
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
    showAction(e,conversation) {
      this.actionPopup.conversation = conversation;
      this.actionPopup.visible = true;
      this.actionPopup.left = e.pageX;
      this.actionPopup.top = e.pageY;
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
	refresh(id) {
		this.isRouterAlive = false;
		this.$nextTick(function () {
			this.isRouterAlive = true;
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
		color: rgba(0,0,0,.9);
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
      &:hover {
        background: #dddddd;
      }
    }
    .conversation-item {
      display: flex;
      padding: 12px;
	  cursor: pointer;

	  .item-head {
		position: relative;
		margin-right: 14px;
	  }

	  .item-avatar {
	    width: 45px;
	    height: 45px;
		border-radius: 4px;
	  }

	  .item-unread-num {
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

      .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .item-info-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .item-info-name {
          font-size: 16px;
          line-height: 25px;
          color: #333333;
        }
        .item-info-bottom {
          display: flex;
		  align-items: center;
          .more-action {
            font-size: 18px;
            cursor: pointer;
          }
        }
        .item-info-message {
          font-size: 12px;
          line-height: 20px;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
		  width: 80px;
          color: #606266;
        }

		.item-info-failed {
			background: url("/static/images/failed.png") no-repeat center;
			background-size: 12px;
			width: 12px;
			height: 12px;
			margin-right: 2px;
		}

		.item-info-sending {
			background: url("/static/images/pending.gif") no-repeat center;
			background-size: 12px;
			width: 12px;
			height: 12px;
			margin-right: 2px;
		}
      }
    }

    .checked {
      background: #eeeeee;
	  border-radius: 5px;
    }
  }
  .conversation-main {
    flex: 1;
    background: #FFFFFF;
  }
}

</style>
