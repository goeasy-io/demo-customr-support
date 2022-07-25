<template>
  <div class="home">
    <div class="home-container">
      <div class="home-menu">
        <img class="shop-avatar" :src="teamData.avatar"/>
        <div class="menu-box">
          <div class="menu-list">
            <div class="menu-item">
              <router-link to="/conversation">
                <i
                  class="iconfont icon-zaixiankefu"
                  :class="{ selected: currentPage === 'Conversation' || currentPage === 'Chat' }"
                ></i>
              </router-link>
              <span v-if="unreadTotal" class="menu-unread">{{ unreadTotal }}</span>
            </div>
            <div class="menu-item">
              <router-link to="/contact">
                <i
                  class="iconfont icon-haoyou"
                  :class="{ selected: currentPage === 'Contact' }"
                ></i>
              </router-link>
            </div>
          </div>
          <div class="staff-info">
            <img class="staff-avatar" :src="staffData.avatar" @click="showOnlineConfig = !showOnlineConfig"/>
            <span :class="isOnline ?'spot online':'spot offline'"></span>
            <div class="action-box" v-if="showOnlineConfig">
              <div class="action-item" @click="switchOnlineStatus">{{ isOnline ? '下线':'上线' }}</div>
              <div class="action-item" @click="logout">退出登录</div>
            </div>
          </div>
        </div>
      </div>
      <div class="home-main">
        <router-view />
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
      isOnline: false,
      staffData: null,
      teamData: null,
      currentPage: this.$route.name,
      unreadTotal: null,
      showOnlineConfig: false
    };
  },
  created() {
    this.staffData = JSON.parse(localStorage.getItem('staffData'));
    if (!this.staffData) {
      this.$router.push({ name: 'Login'});
    }
    this.teamData = RestApi.findShopByStaff(this.staffData.uuid);
    if(this.goEasy.getConnectionStatus() === 'disconnected') {
      this.connectGoEasy();  //连接goeasy
    }
    this.initialOnlineStatus();
  },
  watch: {
    $route() {
      this.currentPage = this.$route.name;
    },
  },
  methods: {
    connectGoEasy () {
      this.goEasy.connect({
        id: this.staffData.uuid,
        data: this.staffData,
        onSuccess: function () {  //连接成功
          console.log("GoEasy connect successfully.") //连接成功
        },
        onFailed: function (error) { //连接失败
          console.log("Failed to connect GoEasy, code:"+error.code+ ",error:"+error.content);
        },
        onProgress: function(attempts) { //连接或自动重连中
          console.log("GoEasy is connecting", attempts);
        }
      });
    },
    initialOnlineStatus () {
      this.goEasy.im.csTeam(this.teamData.id).isOnline({
        onSuccess: (result) => {
          this.isOnline = result.content;
        },
        onFailed:(error) =>{
          console.log('获取在线状态失败，error:',error)
        }
      })
    },
    switchOnlineStatus () {
      this.showOnlineConfig = false;
      if (this.isOnline) {
        this.goEasy.im.csTeam(this.teamData.id).offline({
          onSuccess: () => {
            this.isOnline = false;
          },
          onFailed:(error) => {
            console.log('下线失败,error:',error);
          }
        })
      } else {
        this.goEasy.im.csTeam(this.teamData.id).online({
          teamData: this.teamData,
          staffData: this.staffData,
          onSuccess: () => {
            this.isOnline = true;
          },
          onFailed: (error) => {
            console.log('上线失败,error:',error);
          }
        })
      }
    },
    logout() {
      this.goEasy.disconnect({
        onSuccess: () => {
          localStorage.removeItem('staffData');
          this.$router.push({ name: 'Login'});
        },
        onFailed: (error) => {
          console.log("Failed to disconnect GoEasy, code:"+error.code+ ",error:"+error.content);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .home-container {
    width: 900px;
    height: 700px;
    background: #FFFFFF;
    display: flex;
    position: relative;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    .home-menu {
      width: 80px;
      background-color: #F7F7F7;
      border-right: 1px solid #eeeeee;
      display: flex;
      flex-direction: column;
      align-items: center;
      .shop-avatar {
        width: 50px;
        height: 50px;
        margin: 20px auto;
        border-radius: 10px;
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
        .iconfont {
          padding: 15px;
          font-size: 28px;
          color: #606266;
        }
        .menu-item {
          color: #303133;
          cursor: pointer;
          box-sizing: border-box;
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
          background-color: #AF4E4E;
          color: #ffffff;
        }
        .selected {
          color: #af4e4e !important;
        }
      }
      .staff-info {
        position: relative;
        .staff-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          position: relative;
          cursor: pointer;
        }
        .spot {
          position: absolute;
          left: 34px;
          top: 34px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .online {
          background-color: #56d547;
        }
        .offline {
          background-color: #999999;
        }
        .action-box {
          position: absolute;
          left: 60px;
          top: -25px;
          width: 100px;
          height: 100px;
          background: #dddddd;
          border-radius: 10px;
          font-size: 14px;
          text-align: center;
          z-index: 99;
          .action-item {
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            &:hover {
              cursor: pointer;
            }
          }
        }
      }
    }

    .home-main {
      padding: 0;
      flex: 1;
    }
  }
}
</style>
