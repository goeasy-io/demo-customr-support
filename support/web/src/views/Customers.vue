<template>
  <div class="customer">
    <div class="customer-left">
      <div class="customer-tab">客户列表</div>
      <div class="customer-list">
        <div
          v-for="(customer, key) in customers || []"
          :key="key"
          :class="selectedCustomer && selectedCustomer.id === customer.id ?'customer-item checked' : 'customer-item'"
          @click="showCustomerProfile(customer)"
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
          <button class="card-button" @click="chat(selectedCustomer)">发消息</button>
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
      showCustomerProfile(customer) {
        this.selectedCustomer = customer;
      },
      chat(customer) {
        this.$router.replace({
          path: '/conversations/chat/'+customer.id,
          query: {
            name: customer.name,
            avatar: customer.avatar
          }
        });
      },
    },
  };
</script>

<style scoped>
  .customer {
    width: 100%;
    height: 100%;
    display: flex;
    background: #F7F7F7;
  }

  .customer-left {
    height: 100%;
    border-right: #dbd6d6 1px solid;
    width: 240px;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
  }

  .customer-tab {
    padding: 20px;
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
  }

  .user-avatar {
    width: 45px;
  }

  .user-avatar img {
    width: 45px;
    height: 45px;
    border-radius: 10%;
  }

  .user-info {
    display: flex;
    align-items: center;
    text-align: left;
    padding-left: 10px;
    font-size: 15px;
  }

  .customer-left .checked {
    background: #FFFFFF;
    border-radius: 10px;
    box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.1);
  }

  .customer .customer-main {
    flex: 1;
    background: #FFFFFF;
  }

  .card-title {
    padding: 60px;
    border-bottom: 1px solid #eeeeee;
    display: flex;
    justify-content: space-around;
  }

  .profile-name {
    width: 300px;
    font-size: 18px;
    display: flex;
    align-items: center;
  }

  .profile-name .icon-zhanghu {
    font-size: 26px;
    color: #eeeeee;
    margin-right: 10px;
  }

  .profile-avatar {
    width: 60px;
  }

  .profile-avatar img {
    width: 60px;
    height: 60px;
    border-radius: 10%;
  }

  .profile-card .info-item {
    padding: 10px 30px;
    display: flex;
    justify-content: space-around;
    text-align: left;
    font-size: 14px;
    line-height: 45px;
  }

  .profile-card .info-item .info-name {
    width: 100px;
  }

  .profile-card .info-item .info-text {
    width: 200px;
  }

  .button-box {
    padding: 40px 0;
  }

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

</style>
