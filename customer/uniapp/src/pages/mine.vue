<template>
  <div class="mine">
    <div class="top">
      <image :src="currentCustomer && currentCustomer.avatar"></image>
      <view class="name">{{ currentCustomer && currentCustomer.name }}</view>
    </div>
    <div class="bottom">
      <text>欢迎体验GoEasy客服</text>
      <view @click="logout" class="logout">注销</view>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        currentCustomer: null
      }
    },
    onShow() {
      this.currentCustomer = getApp().globalData.currentCustomer;
    },
    methods: {
      logout() {
        if(this.goEasy.getConnectionStatus() === 'disconnected') {
          return
        }
        uni.showLoading({
          title: '注销中',
          mask: true,
        });
        this.goEasy.disconnect({
          onSuccess: function () {
            uni.hideLoading();
            getApp().globalData.currentCustomer = null;
            uni.redirectTo({
              url: './login'
            });
          },
          onFailed: function (error) {
            uni.hideLoading();
            uni.showToast({
              icon: 'none',
              title: '注销超时，请检查网络！（务必确保注销成功才允许客户退出应用，否则有可能会收到上个用户的消息。）',
              duration: 6000
            });
            console.log('注销失败', error);
          }
        });
      }
    }
  }
</script>

<style>
  .mine {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .top {
    height: 400rpx;
    background: #F3F4F7;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .top image {
    width: 156rpx;
    height: 156rpx;
    border-radius: 156rpx;
  }

  .top .name {
    line-height: 80rpx;
  }

  .bottom {
    text-align: center;
    line-height: 200rpx;
  }

  .logout {
    width: 266rpx;
    height: 76rpx;
    line-height: 76rpx;
    margin: 0 auto;
    background-color: #d02129;
    border-radius: 10rpx;
    color: #FFFFFF;
    font-size: 34rpx;
  }
</style>
