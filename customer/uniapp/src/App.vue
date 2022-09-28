<script>
  export default {
    onLaunch: function () {
      console.log('App onLaunch');
    },
    onShow: function () {
      console.log('App Show');
    },
    onHide: function () {
      console.log('App Hide');
    }
  }
</script>

<style>
  .text-content {
    padding: 16rpx;
    border-radius: 20rpx;
    color: #000000;
    background: #EFEFEF;
    word-break: break-all;
    text-align: left;
    vertical-align: center;
    display: flex;
    flex-direction: row;
    font-size: 28rpx;
  }

  /* 隐藏滚动条 */
  uni-scroll-view .uni-scroll-view::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
    -webkit-appearance: none;
    background: transparent;
    color: transparent;
  }
</style>
