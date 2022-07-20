<template>
  <div class="home">
    <div class="home-container">
      <div class="home-menu">
        <img class="user-avatar" :src="currentTeam.avatar"/>
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
                  class="iconfont icon-lianxiren1"
                  :class="{ selected: currentPage === 'Contact' }"
                ></i>
              </router-link>
            </div>
          </div>
          <div class="staff-info">
            <img class="user-avatar" :src="currentStaff.avatar" @click="showCountActionBox = !showCountActionBox"/>
            <span :class="isOnline ?'user-online':'user-offline'"></span>
            <div class="action-box" v-if="showCountActionBox">
              <div class="action-item" @click="switchOnlineStatus">
                <span>{{ isOnline ? '下线':'上线' }}</span>
              </div>
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
import RestApi from '../../api/restapi'
export default {
  name: 'Home',
  data() {
    return {
      isOnline: false,
      currentStaff: null,
      currentTeam: null,
      currentPage: this.$route.name,
      unreadTotal: null,
      showCountActionBox: false
    };
  },
  created() {
    this.currentStaff = JSON.parse(localStorage.getItem('currentStaff'));
    this.currentTeam = RestApi.findShopByStaff(this.currentStaff.uuid);
    console.log('this.currentTeam',this.currentTeam);
    if(this.goEasy.getConnectionStatus() === 'disconnected') {
      this.connectGoEasy();  //连接goeasy
    }
    this.getOnlineStatus();
  },
  watch: {
    $route() {
      this.currentPage = this.$route.name;
    },
  },
  methods: {
    connectGoEasy () {
      this.goEasy.connect({
        id: this.currentStaff.uuid,
        data: this.currentStaff,
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
    getOnlineStatus () {
      this.goEasy.im.csTeam(this.currentTeam.id).isOnline({
        onSuccess: (result) => {
          this.isOnline = result.content;
          console.log('getOnlineStatus --- ',result.content);
        },
        onFailed:(error) =>{
          console.log('获取在线状态失败，error:',error)
        }
      })
    },
    switchOnlineStatus () {
      this.showCountActionBox = false;
      if (this.isOnline) {
        this.goEasy.im.csTeam(this.currentTeam.id).offline({
          onSuccess: () => {
            this.getOnlineStatus();
          },
          onFailed:(error) => {
            console.log('下线失败,error:',error);
          }
        })
      } else {
        this.goEasy.im.csTeam(this.currentTeam.id).online({
          teamData: this.currentTeam,
          staffData: this.currentStaff, //userdata/staffdata/
          onSuccess: () => {
            this.getOnlineStatus();
          },
          onFailed: (error) => {
            console.log('上线失败,error:',error);
          }
        })
      }
    },
    logout() {
      localStorage.removeItem('currentStaff');
      this.$router.push('../login');
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
    border: 2px solid #eeeeee;
    width: 900px;
    height: 700px;
    background: #FFFFFF;
    display: flex;
    position: relative;
    .home-menu {
      width: 80px;
      background-color: #F7F7F7;
      border-right: 1px solid #eeeeee;
      display: flex;
      flex-direction: column;
      align-items: center;
      .user-avatar {
        width: 50px;
        height: 50px;
        margin: 20px auto;
        border-radius: 50%;
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
          color: #9fc8ff !important;
        }
      }
      .staff-info {
        position: relative;
        .user-online {
          position: absolute;
          left: 38px;
          top: 60px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #56d547;
        }
        .user-offline {
          position: absolute;
          left: 38px;
          top: 60px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #999999;
        }
        .action-box {
          position: absolute;
          left: 60px;
          top: -25px;
          width: 100px;
          height: 100px;
          background: #cccccc;
          border-radius: 10px;
          font-size: 15px;
          text-align: center;
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
