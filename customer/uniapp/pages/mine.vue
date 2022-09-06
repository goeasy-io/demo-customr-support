<template>
    <div class="mine">
        <div class="top">
            <image :src="currentCustomer && currentCustomer.avatar"></image>
            <view class="name">{{currentCustomer && currentCustomer.name}}</view>
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
            this.currentCustomer = uni.getStorageSync('currentCustomer');
        },
        methods: {
            logout() {
                uni.showLoading({
                    title: '注销中',
                    mask: true,
                });
                this.goEasy.disconnect({
                    onSuccess: function () {
                        uni.hideLoading();
                        uni.removeStorageSync('currentCustomer');
                        uni.navigateTo({url: './login'});
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
        height: 400 rpx;
        background: #F3F4F7;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .top image {
        width: 156 rpx;
        height: 156 rpx;
        border-radius: 156 rpx;
    }

    .top .name {
        line-height: 80 rpx;
    }

    .bottom {
        text-align: center;
        line-height: 200 rpx;
    }

    .logout {
        width: 266 rpx;
        height: 76 rpx;
        line-height: 76 rpx;
        margin: 0 auto;
        background-color: #d02129;
        border-radius: 10 rpx;
        color: #FFFFFF;
        font-size: 32 rpx;
    }
</style>
