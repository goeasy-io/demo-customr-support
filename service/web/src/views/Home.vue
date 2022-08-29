<template>
  <div class="home">
    <div class="home-container">
      <div class="home-menu">
        <div class="menu-header">
			<img class="shop-avatar" :src="shop.avatar" />
			<div class="team-info">
				{{shop.name}}
			</div>
		</div>
        <div class="menu-box">
          <div class="menu-list">
            <div class="menu-item">
              <router-link to="/conversation">
                <i
                  class="iconfont icon-zaixiankefu"
                  :class="{ selected: selectedTab === 'Conversation' || selectedTab === 'Chat' }"
                ></i>
              </router-link>
              <span v-if="unreadTotal" class="menu-unread">{{ unreadTotal }}</span>
            </div>
            <div class="menu-item">
              <router-link to="/contact">
                <i
                  class="iconfont icon-haoyou"
                  :class="{ selected: selectedTab === 'Contact' }"
                ></i>
              </router-link>
            </div>
          </div>
          <div class="staff-info">
            <img class="staff-avatar" :src="currentUser.avatar" @click="onlineConfigVisible = !onlineConfigVisible"/>
            <span :class="isOnline ?'spot online':'spot offline'"></span>
			<div class="staff-name">{{currentUser.name}}</div>
          </div>
		  <div @click.prevent="closeOnlinePopup()" class="action-wrap" v-if="onlineConfigVisible">
		  	<div class="action-box" v-if="onlineConfigVisible">
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
       csTeam:null,
      currentUser: null,
      shop: null,
      selectedTab: this.$route.name,
      unreadTotal: 0,
      onlineConfigVisible: false,
    };
  },
  created() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!this.currentUser) {
      this.$router.push({ name: 'Login'});
    }
    this.shop = RestApi.findShopById(this.currentUser.shopId);

    this.csTeam = this.goEasy.im.csTeam(this.currentUser.shopId);

    if(this.goEasy.getConnectionStatus() === 'disconnected') {
      this.connectGoEasy();  //连接goeasy
    }
    this.initialOnlineStatus();
    this.goEasy.im.on(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.setUnreadTotal);
  },
  watch: {
    $route() {
		this.selectedTab = this.$route.name;
    },
  },
  methods: {
    connectGoEasy () {
      this.goEasy.connect({
        id: this.currentUser.uuid,
        data: {name:this.currentUser.name, avatar:this.currentUser.avatar},
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
	setUnreadTotal(content) {
		this.unreadTotal = content.unreadTotal;
	},
    initialOnlineStatus () {
        this.csTeam.isOnline({
            onSuccess: (result) => {
              this.isOnline = result.content;
            },
            onFailed:(error) =>{
              console.log('获取在线状态失败，error:',error)
            }
        })
    },
    switchOnlineStatus () {
      this.onlineConfigVisible = false;
      if (this.isOnline) {
        this.csTeam.offline({
          onSuccess: () => {
            this.isOnline = false;
          },
          onFailed:(error) => {
            console.log('下线失败,error:',error);
          }
        })
      } else {
        this.csTeam.online({
          teamData: {name: this.shop.name, avatar: this.shop.avatar},
          staffData: {name: this.currentUser.name, avatar: this.currentUser.avatar},
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
          localStorage.removeItem('currentUser');
          this.$router.push({ name: 'Login'});
        },
        onFailed: (error) => {
          console.log("Failed to disconnect GoEasy, code:"+error.code+ ",error:"+error.content);
        }
      });
    },
	closeOnlinePopup() {
		this.onlineConfigVisible = false;
	}
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
		  
		  border: 0.5px solid hsla(0,9%,39%,.15);
		  border-radius: 4px;
		  box-sizing: border-box;
		  
		  overflow: hidden;
		  text-overflow: ellipsis;
		  white-space: nowrap;
		  font-size: 12px;
		  color: rgba(0,0,0,.5);
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
          background-color: #fa5151;
          color: #ffffff;
        }
        .selected {
          color: #d02129 !important;
        }
      }
	  
	  .staff-info:hover .staff-name {
		  visibility: visible;
		  text-decoration: none;
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
		
		.staff-name {
			visibility: hidden;
			position: absolute;
			top: 32px;
			bottom: 0px;
			left: 32px;
			right: 0;
			border: .5px solid hsla(0,9%,39%,.15);
			border-radius: 4px;
			width: fit-content;
			max-width: 120px;
			height: 24px;
			line-height: 24px;
			padding: 0 8px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			box-sizing: border-box;
			word-wrap: break-word;
			background: #fff;
			color: rgba(0,0,0,.5);
			font-size: 12px;
			font-weight: 400;
			transition: all 0.4s 0.4s;
		}
		
        .action-box {
          position: absolute;
          left: 78px;
		  bottom: 40px;
          width: 100px;
          height: 100px;
          background: #fff;
          border-radius: 10px;
          font-size: 14px;
          text-align: center;
          z-index: 3;
		  box-shadow: 2px 8px 20px #999999;
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
	  
	  .action-wrap {
	  	position: absolute;
	  	top: 0;
	  	left: 0;
	  	right: 0;
	  	bottom: 0;
	  	z-index: 2;
		
		.action-box {
		  position: absolute;
		  left: 80px;
		  bottom: 40px;
		  width: 100px;
		  height: 100px;
		  background: #fff;
		  border-radius: 10px;
		  font-size: 14px;
		  text-align: center;
		  z-index: 3;
		  box-shadow: 2px 8px 20px #999999;
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
