<template>
  <view class="login">
    <view class="title">GoEasy Customer</view>
    <input v-model="username" class="input-box" placeholder="请输入账号" type="text">
    <input v-model="password" class="input-box" placeholder="请输入密码" type="password">
    <div v-show="showError" class="alert-box">
      <image src="/static/images/login-alert-icon.png"></image>
      <span>请输入正确的用户名和密码</span>
    </div>
    <button class="login-btn" @click="login">登录</button>
    <div class="login-tips">登录所需用户名和密码见 restapi.js</div>
  </view>
</template>

<script>
  import restApi from '../lib/restapi';

  export default {
    name: 'Login',
    data() {
      return {
        username: '',
        password: '',
        showError: false
      }
    },
    methods: {
      login() {
        if (this.username.trim() !== '' && this.password.trim() !== '') {
          let user = restApi.findCustomer(this.username, this.password);
          if (user) {
            uni.setStorageSync('currentCustomer', user);
            uni.switchTab({
              url: './home'
            });
            return
          }
        }
        this.showError = true;
      }
    }
  }
</script>

<style>
  .login {
    padding-top: 160 rpx;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .title {
    height: 100 rpx;
    font-size: 70 rpx;
    text-align: center;
    font-family: Source Han Sans CN;
    font-style: normal;
    font-weight: bold;
    color: #d02129;
    margin-bottom: 80 rpx;
  }

  .input-box {
    width: 600 rpx;
    height: 50 rpx;
    margin-bottom: 40 rpx;
    padding: 26 rpx;
    font-size: 32 rpx;
  }

  input {
    border: 1px solid #E0E0E0;
  }

  input::-webkit-input-placeholder {
    color: #999999;
  }

  input::-moz-placeholder {
    color: #999999;
  }

  input::-ms-input-placeholder {
    color: #999999;
  }

  .alert-box {
    width: 640 rpx;
    height: 60 rpx;
    margin-bottom: 60 rpx;
    padding: 0 rpx 20 rpx;
    font-size: 32 rpx;
    line-height: 48 rpx;
    display: flex;
    align-content: center;
    overflow: hidden;
    color: #EE593C;
    align-items: center;
  }

  .alert-box image {
    width: 30 rpx;
    height: 30 rpx;
    margin-right: 20 rpx;
  }

  .login-btn {
    width: 680 rpx;
    height: 100 rpx;
    line-height: 100 rpx;
    font-size: 36 rpx;
    text-align: center;
    color: #ffffff;
    background: #d02129;
    outline: none;
    border: 0;
  }

  .login-tips {
    color: #999999;
    font-size: 30 rpx;
    text-align: center;
    margin-top: 30 rpx;
  }
</style>
