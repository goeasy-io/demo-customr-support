<template>
  <scroll-view class="conversations" scroll-y="true">
    <view v-if="conversations.length">
      <view v-for="(conversation, key) in conversations" :key="key" class="scroll-item">
        <view class="item-head">
          <image :src="conversation.data.avatar" class="head-icon"></image>
          <view v-if="conversation.unread" class="item-head_unread">{{ conversation.unread }}</view>
        </view>
        <view class="scroll-item_info" @click="chat(conversation)">
          <view class="item-info-top">
            <text class="item-info-top_name">{{ conversation.data.name }}</text>
            <view class="item-info-top_time">{{ formatDate(conversation.lastMessage.timestamp) }}</view>
          </view>
          <view class="item-info-bottom">
            <view class="item-info-bottom-item">
              <view class="item-info-top_content">
                <text v-if="conversation.lastMessage.type === 'CS_TRANSFER'">
                  {{ conversation.lastMessage.payload.transferTo.data.name }}已接入
                </text>
                <view v-else>
                  <text>{{
                      conversation.lastMessage.senderId === currentCustomer.id ? '我' :
                        conversation.lastMessage.senderData.name
                    }}:
                  </text>
                  <text v-if="conversation.lastMessage.type === 'text'">
                    {{ conversation.lastMessage.payload.text }}
                  </text>
                  <text v-else-if="conversation.lastMessage.type === 'video'">[视频消息]</text>
                  <text v-else-if="conversation.lastMessage.type === 'audio'">[语音消息]</text>
                  <text v-else-if="conversation.lastMessage.type === 'image'">[图片消息]</text>
                  <text v-else-if="conversation.lastMessage.type === 'order'">[自定义消息:订单]</text>
                  <text v-else-if="conversation.lastMessage.type === 'CS_END'">会话已结束</text>
                  <text v-else-if="conversation.lastMessage.type === 'CS_ACCEPT'">已接入</text>
                  <text v-else>[[未识别内容]]</text>
                </view>
              </view>
              <view class="item-info-bottom_action" @click.stop="showAction(conversation)"></view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="no-conversation">当前没有会话</view>
    <view v-if="actionPopup.visible" class="action-container">
      <view class="layer" @click="actionPopup.visible = false"></view>
      <view class="action-box">
        <view class="action-item" @click="topConversation">{{ actionPopup.conversation.top ? '取消置顶' : '置顶聊天' }}
        </view>
        <view class="action-item" @click="deleteConversation">删除聊天</view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
  import { formatDate } from '../lib/utils';
  export default {
    name: 'conversation',
    data() {
      return {
        conversations: [],
        actionPopup: {
          conversation: null,
          visible: false
        },
        currentCustomer: null
      }
    },
    onShow() {
      this.currentCustomer = uni.getStorageSync('currentCustomer');
      this.loadConversations(); //加载会话列表
      this.goEasy.im.on(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.renderConversations);
    },
    beforeDestroy() {
      this.goEasy.im.off(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.renderConversations);
    },
    methods: {
      formatDate,
      // 加载最新的会话列表
      loadConversations() {
        this.goEasy.im.latestConversations({
          onSuccess: (result) => {
            let content = result.content;
            if(content.unreadTotal > 0) {
              uni.setTabBarBadge({
                index: 1,
                text: content.unreadTotal.toString()
              });
            }else{
              uni.removeTabBarBadge({index: 1});
            }
            this.renderConversations(content);
          },
          onFailed: (error) => {
            console.log('获取最新会话列表失败, error:', error);
          }
        });
      },
      renderConversations(content) {
        this.conversations = content.conversations;
      },
      showAction(conversation) {
        this.actionPopup.conversation = conversation;
        this.actionPopup.visible = true;
      },
      topConversation() {
        this.actionPopup.visible = false;
        let conversation = this.actionPopup.conversation;
        let description = conversation.top ? '取消置顶' : '置顶';
        this.goEasy.im.topConversation({
          top: !conversation.top,
          conversation: conversation,
          onSuccess: () => {
            uni.showToast({
              title: description + '成功',
              icon: 'none'
            });
          },
          onFailed: (error) => {
            console.log(description, '失败：', error);
          },
        });
      },
      deleteConversation() {
        uni.showModal({
          content: '确认删除这条会话吗？',
          success: (res) => {
            if (res.confirm) {
              this.actionPopup.visible = false;
              let conversation = this.actionPopup.conversation;
              this.goEasy.im.removeConversation({
                conversation: conversation,
                onSuccess: () => {
                  uni.showToast({
                    title: '删除成功',
                    icon: 'none'
                  });
                },
                onFailed: function (error) {
                  console.log('删除失败，error:', error);
                },
              });
            } else {
              this.actionPopup.visible = false;
            }
          },
        })
      },
      chat(conversation) {
        const shop = {
          id:conversation.id,
          name:conversation.data.name,
          avatar:conversation.data.avatar
        }
        uni.navigateTo({
          url: './chat?to=' + JSON.stringify(shop)
        });
      }
    }
  }
</script>

<style>
  page {
    height: 100%;
  }

  .conversations {
    width: 750rpx;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
  }

  .conversations .scroll-item {
    height: 152rpx;
    display: flex;
    align-items: center;
    padding-left: 32rpx;
  }

  .conversations .scroll-item .head-icon {
    width: 100rpx;
    height: 100rpx;
    margin-right: 28rpx;
  }

  .conversations .scroll-item_info {
    height: 151rpx;
    width: 590rpx;
    padding-right: 32rpx;
    box-sizing: border-box;
    border-bottom: 1px solid #EFEFEF;
  }

  .conversations .scroll-item_info .item-info-top {
    padding-top: 20rpx;
    height: 60rpx;
    line-height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

  }

  .conversations .item-info-top_name {
    font-size: 32rpx;
    color: #262628;
  }

  .conversations .item-info-top_time {
    font-size: 26rpx;
    color: rgba(179, 179, 179, 0.8);
    font-family: Source Han Sans CN;
  }

  .conversations .item-info-bottom {
    height: 40rpx;
    line-height: 40rpx;
    overflow: hidden;
  }

  .conversations .item-info-bottom-item {
    display: flex;
    justify-content: space-between;
  }

  .item-info-bottom .item-info-top_content {
    font-size: 28rpx;
    color: #b3b3b3;
    width: 520rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

  }

  .item-info-bottom .item-info-bottom_action {
    width: 50rpx;
    height: 50rpx;
    font-size: 20rpx;
    background: url("/static/images/action.png") no-repeat center;
    background-size: 28rpx 30rpx;
  }

  .no-conversation {
    width: 100%;
    text-align: center;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 28rpx;
    color: #9D9D9D;
  }

  .action-container {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .action-container .layer {
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(51, 51, 51, 0.5);
    width: 100%;
    height: 100%;
    z-index: 99;
  }

  .action-container .action-box {
    width: 400rpx;
    height: 240rpx;
    background: #ffffff;
    position: relative;
    z-index: 100;
    border-radius: 20rpx;
    overflow: hidden;
  }

  .action-container .action-item {
    text-align: center;
    line-height: 120rpx;
    font-size: 34rpx;
    color: #262628;
    border-bottom: 1px solid #EFEFEF;
  }

  .item-head {
    position: relative;
  }

  .item-head .item-head_unread {
    padding: 6rpx;
    background-color: #EE593C;
    color: #FFFFFF;
    font-size: 24rpx;
    line-height: 28rpx;
    border-radius: 24rpx;
    min-width: 24rpx;
    min-height: 24rpx;
    text-align: center;
    position: absolute;
    top: 0;
    right: 15rpx;
  }

  .unread-text {
    color: #d02129;
  }
</style>
