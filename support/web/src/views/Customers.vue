<template>
  <div class="customer">
    <div class="customer-left">
      <div class="customer-tab">客户列表</div>
      <div class="customer-list">
        <div
          v-for="(customer, key) in customers || []"
          :key="key"
          :class="selectedCustomer && selectedCustomer.id === customer.id ?'customer-item checked' : 'customer-item'"
          @click="showCustomer(customer)"
        >
          <div class="user-avatar">
            <img :src="customer.avatar"/>
          </div>
          <div class="user-info">{{ customer.name }}</div>
        </div>
      </div>
    </div>
    <div class="customer-main">
      <div v-if="selectedCustomer" class="profile-card">
        <div class="card-title">
          <div class="profile-name">
            <i class="iconfont icon-zhanghu"></i>
            <div>{{ selectedCustomer.name }}</div>
          </div>
          <div class="profile-avatar">
            <img :src="selectedCustomer.avatar"/>
          </div>
        </div>
        <div class="info-item">
          <div class="info-name">邮 箱</div>
          <div class="info-text">{{ selectedCustomer.email }}</div>
        </div>
        <div class="info-item">
          <div class="info-name">手 机</div>
          <div class="info-text">{{ selectedCustomer.phone }}</div>
        </div>
        <div class="button-box">
          <button class="card-button" @click="chat(selectedCustomer.id)">发消息</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import restApi from "../api/restapi";

  export default {
    name: "Customers",
    data() {
      return {
        customers: [],
        selectedCustomer: null,
      };
    },
    mounted() {
      this.customers = restApi.findCustomers();
    },
    methods: {
      showCustomer(customer) {
        this.selectedCustomer = customer;
      },
      chat(customerId) {
        this.$router.push({
          path: `conversations/chat/${customerId}`
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .customer {
    width: 100%;
    height: 100%;
    display: flex;
    background: #F7F7F7;

    .customer-left {
      height: 100%;
      border-right: #dbd6d6 1px solid;
      width: 260px;
      border-right: 1px solid #eee;
      display: flex;
      flex-direction: column;

      .customer-title {
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

      .customer-tab {
        padding: 20px;
        margin-bottom: 20px;
        font-size: 18px;
        border-bottom: 1px solid #eeeeee;
      }

      .customer-list {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }

      .customer-item {
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
        box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.1);
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

    .customer-main {
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
