<template>
  <view class="home-main">
    <view class="shop-list">
      <view v-for="shop in shopList" :key="shop.id" class="shop-item">
        <view class="item-head">
          <view class="shop-info">
            <image :src="shop.avatar"></image>
            <view>{{ shop.name }}</view>
          </view>
          <view class="consult-buton" @click="chat(shop)">咨询</view>
        </view>
        <view class="item-body">
          <image v-for="(good, index) in shop.goods" :key="index" :src="good"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import restApi from '../lib/restapi.js'

  export default {
    data() {
      return {
        shopList: restApi.findShops()
      }
    },
    onShow() {
      let currentCustomer = getApp().globalData.currentCustomer;
      if (!currentCustomer) {
        uni.redirectTo({url: './login'});
        return;
      }
      if (this.goEasy.getConnectionStatus() === 'disconnected') {
        this.connectGoEasy();  //连接goeasy
      }
    },
    methods: {
      connectGoEasy() {
        let currentCustomer = getApp().globalData.currentCustomer;
        this.goEasy.connect({
          id: currentCustomer.id,
          data: {
            name: currentCustomer.name,
            avatar: currentCustomer.avatar
          },
          onSuccess: () => {
            console.log('GoEasy connect successfully.')
          },
          onFailed: (error) => {
            console.log('Failed to connect GoEasy, code:' + error.code + ',error:' + error.content);
          },
          onProgress: (attempts) => {
            console.log('GoEasy is connecting', attempts);
          }
        });
      },
      chat(shop) {
        uni.navigateTo({
          url: './chat?to=' + JSON.stringify(shop)
        });
      }
    }
  }
</script>

<style>
  .shop-list {
    display: flex;
    flex-direction: column;
  }

  .shop-item {
    display: flex;
    flex-direction: column;
  }

  .item-head {
    display: flex;
    justify-content: space-between;
    padding: 0 20rpx;
    margin: 16rpx 0;
    align-items: center;
  }

  .item-head image {
    border-radius: 50%;
    width: 80rpx;
    height: 80rpx;
    margin-right: 20rpx;
  }

  .shop-info {
    display: flex;
    align-items: center;
    flex: 1;
    font-size: 34rpx;
  }

  .consult-buton {
    width: 100rpx;
    height: 50rpx;
    border-radius: 20px;
    color: #d02129;
    border: 2rpx solid #d02129;
    text-align: center;
    font-size: 34rpx;
    line-height: 50rpx;
  }

  .item-body {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .item-body image {
    width: 180rpx;
    height: 180rpx;
  }

</style>
