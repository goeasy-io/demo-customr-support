<template>
  <div class="contact">
    <div class="contact-left">
      <div class="contact-tab">客户列表</div>
      <div class="contact-list">
        <div
          :class="currentContact && currentContact.uuid === user.uuid ?'user-item checked' : 'user-item'"
          v-for="(user, key) in customers || []"
          :key="key"
          @click="chat(user.uuid)"
        >
          <div class="user-avatar">
            <img :src="user.avatar" />
          </div>
          <div class="user-info">{{ user.name }}</div>
        </div>
      </div>
    </div>
    <div class="contact-main">
      <div class="profile-card" v-if="currentContact">
        <div class="card-title">
          <div class="profile-name">
            <i class="iconfont icon-zhanghu"></i>
            <div>{{ currentContact.name }}</div>
          </div>
          <div class="profile-avatar">
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
import restApi from "../api/restapi";
export default {
  name: "Contacts",
  data() {
    return {
      customers: [],
      currentContact: null,
    };
  },
  mounted() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.customers = restApi.findFriends(currentUser.uuid);
  },
  methods: {
    displayContact(contact) {
      this.currentContact = contact;
    },
    chat(contactId) {
      this.$router.push({ name: 'Chat', params: { id: contactId } });
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
    width: 260px;
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
    }
    .user-item {
      display: flex;
      padding: 5px 10px;
      cursor: pointer;
      .user-avatar {
        width: 45px;
        img {
          width: 45px;
          height: 45px;
          border-radius: 10%;
        }
      }
      .user-info {
        display: flex;
        align-items: center;
        text-align: left;
        padding-left: 10px;
        font-size: 15px;
      }
    }
    .checked {
      background: #FFFFFF;
      border-radius: 10px;
      box-shadow: 0 1px 6px 0 rgba(0,0,0,0.1);
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
    background: #FFFFFF;
  }
}

.profile-card {
  padding: 20px 0;
  .card-title {
    padding: 60px;
    border-bottom: 1px solid #eeeeee;
    display: flex;
    justify-content: space-around;
    .profile-name {
      width: 300px;
      font-size: 18px;
      display: flex;
      align-items: center;
      .icon-zhanghu {
        font-size: 26px;
        color: #eeeeee;
        margin-right: 10px;
      }
    }
    .profile-avatar {
      width: 80px;
      img {
        width: 80px;
        height: 80px;
        border-radius: 10%;
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
    background: #eeeeee;
    color: #000000;
    font-size: 14px;
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
