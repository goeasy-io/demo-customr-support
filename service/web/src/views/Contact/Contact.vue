<template>
  <div class="contact">
    <div class="contact-left">
      <div class="contact-tab">客户列表</div>
      <div class="contact-list">
        <div
          class="user-items"
          v-for="(user, key) in clients || []"
          :key="key"
          @click="handleListItem(user)"
        >
          <div class="user-avatar">
            <img :src="user.avatar" />
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-mail">{{ user.email }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="contact-main">
      <div class="profile-card" v-if="currentContact">
        <div class="card-title">
          <div class="user-name">
            <i class="iconfont icon-zhanghu"></i>
            <div>{{ currentContact.name }}</div>
          </div>
          <div class="user-avatar">
            <img :src="currentContact.avatar" />
          </div>
        </div>
        <div class="info-item">
          <div class="info-name">邮 箱</div>
          <div class="info-text">{{ currentContact.email }}</div>
        </div>
        <div class="info-item">
          <div class="info-name">手 机</div>
          <div class="info-text">{{ currentContact.phone }}</div>
        </div>
        <div class="button-box">
          <button class="card-button" @click="goChatPage()">发消息</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import restApi from "../../api/restapi";
export default {
  name: "Contacts",
  data() {
    return {
      clients: [],
      currentTab: "friend",
      currentContact: null,
      groupMembers: [],
      currentUser: {}
    };
  },
  mounted() {
    this.currentStaff = JSON.parse(localStorage.getItem("currentStaff"));
    this.clients = restApi.findFriends(this.currentStaff);
  },
  methods: {
    toggleTab(tab) {
      this.currentTab = tab;
    },
    handleListItem(contact) {
      this.currentContact = contact;
    },
    goChatPage() {
      const id = this.currentContact.uuid;
      this.$router.push({ name: 'Chat', params: { id: id } });
    },
  },
};
</script>

<style lang="scss" scoped>
.contact {
  width: 100%;
  height: 100%;
  display: flex;
  background: #F7F7F7;
  .contact-left {
    height: 100%;
    border-right: #dbd6d6 1px solid;
    width: 270px;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    .contact-title {
      padding: 20px;
      margin-bottom: 15px;
      .input {
        background-color: #fff;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        padding: 0 15px;
        height: 32px;
      }
    }
    .contact-tab {
      padding: 20px;
      margin-bottom: 20px;
      font-size: 18px;
      border-bottom: 1px solid #eeeeee;
    }
    .contact-list {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      //scrollbar-color: transparent transparent;
      //scrollbar-track-color: transparent;
      //-ms-scrollbar-track-color: transparent;
    }
    .user-items {
      display: flex;
      padding: 5px 10px;
      .user-avatar {
        width: 60px;
        img {
          width: 50px;
          height: 50px;
          border-radius: 10%;
          margin-left: 10px;
        }
      }
      .user-info {
        width: 65%;
        margin: 0;
        display: flex;
        flex-direction: column;
        text-align: left;
        padding-left: 10px;
        .user-name {
          margin: 0;
          font-size: 16px;
          font-weight: 400;
        }
        .user-mail {
          line-height: 30px;
          color: #888888;
        }
      }
    }
    .group-items {
      display: flex;
      padding: 5px 10px;
      .group-avatar {
        width: 50px;
        height: 50px;
        margin-left: 10px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
        flex-wrap: wrap-reverse;
      }
      .avatarItem--1 > img {
        width: 98%;
        height: 98%;
      }
      .avatarItem--2 > img {
        width: 47%;
        height: 47%;
        margin: 1%;
      }
      .avatarItem--3 > img {
        width: 31%;
        height: 30%;
        margin: 1%;
      }
      .group {
        width: 65%;
        margin-left: 10px;
        .group-name {
          width: 180px;
          text-align: left;
          font-size: 15px;
          line-height: 40px;
        }
      }
    }
  }
  .contact-main {
    flex: 1;
    background: #F0F0F0;
  }
}

.profile-card {
  padding: 20px 0;
  .card-title {
    padding: 60px;
    border-bottom: 1px solid #cccccc;
    display: flex;
    justify-content: space-around;
    .user-name {
      width: 300px;
      font-size: 18px;
      display: flex;
      align-items: center;
      .icon-zhanghu {
        font-size: 26px;
        color: #606164;
        margin-right: 10px;
      }
    }
    .user-avatar {
      width: 60px;
      img {
        width: 80px;
        height: 80px;
        border-radius: 10%;
        margin-left: 10px;
      }
    }
  }
  .info-item {
    padding: 10px 30px;
    display: flex;
    justify-content: space-around;
    text-align: left;
    font-size: 14px;
    line-height: 45px;
    .info-name {
      width: 100px;
    }
    .info-text {
      width: 200px;
    }
  }
}
.button-box {
  padding: 40px 0;
  .card-button {
    background: #606164;
    color: white;
    border: none;
    display: flex;
    width: 120px;
    height: 35px;
    cursor: pointer;
    border-radius: 5px;
    margin: 0 auto;
    align-items: center;
    justify-content: center;
  }
}
</style>
