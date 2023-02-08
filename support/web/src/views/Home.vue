<template>
  <div class="home">
    <div class="home-container">
      <div class="home-menu">
        <div class="menu-header">
          <img :src="shop.avatar" class="shop-avatar"/>
          <div class="team-info">
            {{ shop.name }}
          </div>
        </div>
        <div class="menu-box">
          <div class="menu-list">
            <router-link tag="div" class="menu-item" to="/conversations" replace>
              <i class="iconfont icon-zaixiankefu"></i>
              <span v-if="unreadAmount + pendingConversationAmount" class="menu-unread">{{ unreadAmount + pendingConversationAmount}}</span>
            </router-link>
            <router-link tag="div" class="menu-item" to="/customers" replace>
              <i class="iconfont icon-haoyou"></i>
            </router-link>
          </div>
          <div class="agent-info">
            <img :src="currentAgent.avatar" class="agent-avatar"
                 @click="onlineConfig.visible = !onlineConfig.visible"/>
            <span :class="onlineConfig.online ?'spot online':'spot offline'"></span>
            <div class="agent-name">{{ currentAgent.name }}</div>
          </div>
          <div v-if="onlineConfig.visible" class="action-wrap" @click.prevent="closeOnlinePopup()">
            <div v-if="onlineConfig.visible" class="action-box">
              <div class="action-item" @click="online">
                <div :class="onlineConfig.online ? 'checked': 'action-title'">客服在线</div>
                <div class="action-detail">接收客服消息通知</div>
              </div>
              <div class="action-item" @click="offline">
                <div :class="!onlineConfig.online ? 'checked': 'action-title'">客服离线</div>
                <div class="action-detail">不接收客服消息通知</div>
              </div>
              <div class="action-item" @click="logout">
                <div class="action-title">退出登录</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="home-main">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
  import RestApi from '../api/restapi'

  export default {
    name: 'Home',
    data() {
      return {
        csteam: null,
        currentAgent: null,
        shop: null,
        unreadAmount: 0,
        pendingConversationAmount: 0,

        onlineConfig: {
          visible: false,
          online: false
        }
      };
    },
    created() {
      this.currentAgent = this.globalData.currentAgent;
      this.shop = RestApi.findShopById(this.currentAgent.shopId);

      this.csteam = this.goEasy.im.csteam(this.currentAgent.shopId);

      if (this.goEasy.getConnectionStatus() === 'disconnected') {
        this.connectGoEasy();  //连接goeasy
      }
      this.initialOnlineStatus();
      this.goEasy.im.on(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.setUnreadAmount);
      this.goEasy.im.on(this.GoEasy.IM_EVENT.PENDING_CONVERSATIONS_UPDATED, this.setPendingConversationAmount);
    },
    methods: {
      connectGoEasy() {
        let currentAgent = this.currentAgent;
        this.goEasy.connect({
          id: currentAgent.id,
          data: {name: currentAgent.name, avatar: currentAgent.avatar},
          onSuccess: function () {  //连接成功
            console.log("GoEasy connect successfully.") //连接成功
          },
          onFailed: function (error) { //连接失败
            console.log("Failed to connect GoEasy, code:" + error.code + ",error:" + error.content);
          },
          onProgress: function (attempts) { //连接或自动重连中
            console.log("GoEasy is connecting", attempts);
          }
        });
      },
      setUnreadAmount(content) {
        this.unreadAmount = content.unreadTotal;
      },
      setPendingConversationAmount(content) {
        this.pendingConversationAmount = content.conversations.length;
      },
      initialOnlineStatus() {
        this.csteam.isOnline({
          onSuccess: (result) => {
            this.onlineConfig.online = result;
          },
          onFailed: (error) => {
            console.log('获取在线状态失败，error:', error)
          }
        })
      },
      offline() {
        if (this.onlineConfig.online === false) {
          return
        }
        this.csteam.offline({
          onSuccess: () => {
            this.onlineConfig.online = false;
            console.log('已下线',this.currentAgent);
          },
          onFailed: (error) => {
            console.log('下线失败,error:', error);
            if (error.content === 'Please end your accepted conversations first') {
              alert('下线失败，请先结束已接入的会话！');
            }
          }
        })
      },
      online() {
        if (this.onlineConfig.online === true) {
          return
        }
        this.csteam.online({
          teamData: {name: this.shop.name, avatar: this.shop.avatar},
          agentData: {name: this.currentAgent.name, avatar: this.currentAgent.avatar},
          onSuccess: () => {
            this.onlineConfig.online = true;
            console.log('已上线',this.currentAgent);
          },
          onFailed: (error) => {
            console.log('上线失败,error:', error);
          }
        })
      },
      logout() {
        if (confirm('确认要退出登录吗？')) {
          this.goEasy.disconnect({
            onSuccess: () => {
              this.globalData.currentAgent = null;
              this.$router.replace({path: './login'});
            },
            onFailed: (error) => {
              console.log("Failed to disconnect GoEasy, code:" + error.code + ",error:" + error.content);
            }
          });
        }
      },
      closeOnlinePopup() {
        this.onlineConfig.visible = false;
      }
    },
  };
</script>

<style scoped>
  @media screen and (max-width:1000px) {
    .home-container {
      width: 850px;
      height: 450px;
    }
  }
  @media screen and (min-width:1000px) {
    .home-container {
      width: 850px;
      height: 650px;
    }
  }

  .home {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .home-container {
    background: #FFFFFF;
    display: flex;
    position: relative;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .home-menu {
    width: 60px;
    background-color: #F7F7F7;
    border-right: 1px solid #eeeeee;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .shop-avatar {
    width: 50px;
    height: 50px;
    border-radius: 10px;
  }

  .menu-header {
    position: relative;
    margin: 20px auto;
    cursor: pointer;
  }

  .menu-header:hover .team-info {
    display: block;
    text-decoration: none;
  }

  .team-info {
    display: none;
    position: absolute;
    bottom: -20px;
    left: 0;
    right: 0;
    z-index: 1;
    width: 100px;
    padding: 0 8px;
    border: 0.5px solid rgba(108, 90, 90, 0.15);
    border-radius: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.5);
  }

  .menu-box {
    padding: 40px 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  .menu-list {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .menu-list .iconfont {
    padding: 15px;
    font-size: 28px;
    color: #606266;
  }

  .menu-item {
    color: #303133;
    cursor: pointer;
    height: 56px;
    position: relative;
  }

  .menu-unread {
    position: absolute;
    top: -5px;
    right: 5px;
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    border-radius: 50%;
    background-color: #fa5151;
    color: #ffffff;
  }

  .router-link-active i {
    color: #d02129 !important;
  }

  .agent-info:hover .agent-name {
    visibility: visible;
    text-decoration: none;
  }

  .agent-info {
    position: relative;
  }

  .agent-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    position: relative;
    cursor: pointer;
  }

  .agent-info .spot {
    position: absolute;
    left: 34px;
    top: 34px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .agent-info .online {
    background-color: #56d547;
  }

  .agent-info .offline {
    background-color: #999999;
  }

  .agent-name {
    visibility: hidden;
    position: absolute;
    top: 32px;
    bottom: 0;
    left: 32px;
    right: 0;
    border: 0.5px solid rgba(108, 90, 90, 0.15);
    border-radius: 4px;
    width: fit-content;
    max-width: 120px;
    height: 24px;
    line-height: 24px;
    padding: 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: break-word;
    background: #fff;
    color: rgba(0, 0, 0, 0.5);
    font-size: 12px;
    font-weight: 400;
    transition: all 0.4s 0.4s;
  }

  .action-wrap {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
  }

  .action-box {
    position: absolute;
    left: 60px;
    bottom: 40px;
    width: 150px;
    padding: 10px;
    background: #fff;
    border-radius: 10px;
    font-size: 14px;
    z-index: 3;
    box-shadow: 2px 8px 20px #999999;
  }

  .action-item {
    display: flex;
    flex-direction: column;
  }

  .action-item:hover {
    cursor: pointer;
  }

  .action-title {
    margin: 5px 0;
  }

  .action-detail {
    color: #5c5a5a;
    font-size: 12px;
    padding: 5px 0;
    border-bottom: 1px solid #efeeee;
  }

  .action-item .checked {
    margin: 5px 0;
    background: url("../assets/images/tick.png") no-repeat center center;
    background-size: 15px;
  }

  .home-main {
    padding: 0;
    flex: 1;
  }

</style>
