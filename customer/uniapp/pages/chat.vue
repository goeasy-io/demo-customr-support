<template>
	<view class="chatInterface">
		<view class="scroll-view">
			<view class="all-history-loaded">
				{{history.allLoaded ? '已经没有更多的历史消息' : '下拉获取历史消息'}}
			</view>
			<view class="message-list">
				<view v-for="(message,index) in history.messages" :key="message.messageId">
					<view class="time-lag">
						{{renderMessageDate(message, index)}}
					</view>
					<view class="message-item">
						<view v-if="message.type === 'ACCEPTED'" class="accept-message">
							{{message.senderData.name}}将为您服务
						</view>
						<view v-else-if="message.type === 'CLOSED'" class="accept-message">
							{{message.payload.text}}
						</view>
						<view v-else class="message-item-content" :class="{'self' : message.senderId ===  currentUser.uuid}">
							<view class="avatar">
								<image :src="message.senderId === currentUser.uuid? currentUser.avatar : shop.avatar"></image>
							</view>
							<view class="content">
								<view class="staff-name" v-if="message.senderId !== currentUser.uuid">{{message.senderData.name}}</view>
								<view class="message-payload">
									<b class="pending" v-if="message.status === 'sending'"></b>
									<b class="send-fail" v-if="message.status === 'fail'"></b>
									<view v-if="message.type === 'text'" v-html="renderTextMessage(message)"></view>
									<image class="image-content"
										v-if="message.type === 'image'"
										:src="message.payload.url"
										:data-url="message.payload.url"
										@click="showImageFullScreen"
										:class="[
											{'vertical-img': getImgClass(message.payload.width,message.payload.height) === 'vertical-img'},
											{'horizontal-img': getImgClass(message.payload.width,message.payload.height) === 'horizontal-img'},
											{'normal-img': getImgClass(message.payload.width,message.payload.height) === 'normal-img'},
										]"
										mode="heightFix"
									></image>
									<view class="video-snapshot" v-if="message.type === 'video'" :data-url="message.payload.video.url" @click="playVideo">
										<image :src="message.payload.thumbnail.url" mode="heightFix"></image>
										<view class="video-play-icon"></view>
									</view>
									<GoEasyAudioPlayer v-if="message.type ==='audio'" :src="message.payload.url" :duration="message.payload.duration" />
									<view v-if="message.type === 'order'" class="order-content">
										<view class="order-description">发送订单：</view>
										<view class="order-body">
											<image :src="message.payload.url"></image>
											<view class="order-info">
												<view class="order-name">{{message.payload.name}}</view>
												<view>月销{{message.payload.sales}}</view>
												<view>{{message.payload.price}}</view>
											</view>
										</view>
									</view>
								</view>
								<view v-if="message.senderId === currentUser.uuid" :class="message.read ?'message-read':'message-unread'">
									<view>{{message.read?'已读':'未读'}}</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="action-box">
			<view class="action-top">
				<view :class="[audio.visible ? 'record-icon record-open':'record-icon']" @click="switchAudioKeyboard"></view>
				<view class="record-input" @touchstart="onRecordStart" @touchend="onRecordEnd" v-if="audio.visible" >{{audio.recording ? '松开发送' : '按住录音'}}</view>
				<view class="message-input" v-else>
					<!-- GoEasyIM最大支持3k的文本消息，如需发送长文本，需调整输入框maxlength值 -->
					<input type="text" maxlength="700" placeholder="发送消息" v-model="text" @focus="messageInputFocusin">
					<view class="file-icon emoji-icon" @click="showEmoji"></view>
				</view>
				<view class="file-icon more-icon" @click="showOtherTypesMessagePanel"></view>
				<span class="send-message-btn" @click="sendTextMessage"></span>
			</view>
			<!--展示表情列表-->
			<view class="action-bottom action-bottom-emoji" v-if="emoji.visible">
				<image class="emoji-item" v-for="(emojiItem, emojiKey, index) in emoji.map" :key="index" :src="emoji.url + emojiItem" @click="chooseEmoji(emojiKey)"></image>
			</view>
			<!--其他类型消息面板-->
			<view class="action-bottom" v-if="otherTypesMessagePanelVisible">
				<view class="more-item" @click="sendImageMessage">
					<image src="/static/images/tupian.png"></image>
					<text>图片</text>
				</view>
				<view class="more-item" @click="sendVideoMessage">
					<image src="/static/images/shipin.png"></image>
					<text>视频</text>
				</view>
				<view class="more-item" @click="customMessage.visible = true">
					<image src="/static/images/zidingyi.png"></image>
					<text>自定义消息</text>
				</view>
			</view>
		</view>
		<view class="record-loading" v-if="audio.recording"></view>
		<video v-if="videoPlayer.visible" :src="videoPlayer.url" id="videoPlayer" @fullscreenchange="onVideoFullScreenChange"></video>
		<view class="order-list" v-if="customMessage.visible">
			<view class="orders-content">
				<view class="title">选择一个订单</view>
				<view class="orders">
					<view
						:class="customMessage.selectedOrder === order ? 'order-item order-item-checked':'order-item'"
						v-for="order in customMessage.orderList"
						@click="selectOrder(order)"
					>
						<image class="order-img" :src="order.url"></image>
						<view class="order-name">{{order.name}}</view>
						<view class="order-price">{{order.price}}</view>
					</view>
					<view class="action">
						<view class="cancel-btn" @click="closeCustomMessageForm">取消</view>
						<view class="send-btn" @click="sendCustomMessage">发送</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import GoEasyAudioPlayer from '../components/GoEasyAudioPlayer';
	import restApi from '../lib/restapi';
	import EmojiDecoder from '../lib/EmojiDecoder';
	const recorderManager = uni.getRecorderManager();
	export default {
		components : {
			GoEasyAudioPlayer
		},
		data() {
			const emojiUrl = 'https://imgcache.qq.com/open/qcloud/tim/assets/emoji/';
			const emojiMap = {
				'[么么哒]': 'emoji_3@2x.png',
				'[乒乓]': 'emoji_4@2x.png',
				'[便便]': 'emoji_5@2x.png',
				'[信封]': 'emoji_6@2x.png',
				'[偷笑]': 'emoji_7@2x.png',
				'[傲慢]': 'emoji_8@2x.png'
			};
			return {
				currentUser: {},
				shop: {},
				to: {},
				text: '',
				//定义表情列表
				emoji : {
					url : emojiUrl,
					map : emojiMap,
					visible: false,
					decoder:  new EmojiDecoder(emojiUrl, emojiMap),
				},
				//是否展示‘其他消息类型面板’
				otherTypesMessagePanelVisible: false,
				customMessage: {
					orderList:[],
					visible: false,
					selectedOrder: null
				},
				history: {
					messages: [],
					allLoaded: false,
					loading: true
				},
				audio : {
					startTime: null,
					//语音录音中
					recording : false,
					//录音按钮展示
					visible : false
				},
				videoPlayer : {
					visible : false,
					url : '',
					context : null
				},
			}
		},
		onReady () {
			this.videoPlayer.context = uni.createVideoContext('videoPlayer',this);
			uni.setNavigationBarTitle({
				title : this.shop.name
			});
		},
		onShow () {
			this.otherTypesMessagePanelVisible = false;
			this.emoji.visible = false;
		},
		onPullDownRefresh(e) {
			this.loadHistoryMessage(false);
		},
		onLoad(options) {
			let shopId = options.to;
			this.shop = restApi.findShopById(shopId);
			this.customMessage.orderList = restApi.getOrderList();
			this.to = {
				id : this.shop.id,
				type : this.GoEasy.IM_SCENE.CS,
				data : {
					name:this.shop.name,
					avatar:this.shop.avatar
				}
			}
			this.currentUser = uni.getStorageSync('currentUser');

			this.loadHistoryMessage(true);
			this.initRecorderListeners();
			this.goEasy.im.on(this.GoEasy.IM_EVENT.CS_MESSAGE_RECEIVED, this.onMessageReceived);
		},
		beforeDestroy() {
			this.goEasy.im.off(this.GoEasy.IM_EVENT.CS_MESSAGE_RECEIVED, this.onMessageReceived);
		},
		methods: {
			getImgClass (width,height) {
				if (height < 200) {
					return 'normal-img'
				} else if (width <= height) {
					return 'vertical-img'
				} else if (width > height) {
					return 'horizontal-img'
				}
			},
			renderMessageDate(message, index) {
				if (index === 0) {
					return this.formatDate(message.timestamp)
				} else {
					if (message.timestamp - this.history.messages[index - 1].timestamp > 5 * 60 * 1000) {
						return this.formatDate(message.timestamp)
					}
				}
				return '';
			},
			initRecorderListeners(){
				// 监听录音开始
				recorderManager.onStart(() => {
					this.audio.recording = true;
					this.audio.startTime = Date.now();
				});
				//录音结束后，发送
				recorderManager.onStop((res) => {
					let endTime = Date.now();
					this.audio.recording = false;
					let duration = endTime - this.audio.startTime;
					if (duration < 1000) {
						uni.showToast({
							icon: 'error',
							title: '录音时间太短',
							duration: 500
						});
						return;
					}
					res.duration = duration;
					this.sendAudioMessage (res);
				});
				// 监听录音报错
				recorderManager.onError((res) =>{
					this.audio.recording = false;
					recorderManager.stop();
					uni.showToast({
						icon: 'none',
						title: '录音失败,请检查麦克风权限',
						duration: 1000
					});
				})
			},
			renderTextMessage(message) {
				return '<span class="text-content">' + this.emoji.decoder.decode(message.payload.text) + '</span>'
			},
			onMessageReceived (message) {
				if (message.senderId !== this.currentUser.uuid) {
					this.history.messages.push(message);
					this.markMessageAsRead();
				}
				this.scrollToBottom();
			},
			messageInputFocusin () {
				this.otherTypesMessagePanelVisible = false;
				this.emoji.visible = false;
			},
			showEmoji () {
				this.emoji.visible = !this.emoji.visible;
				this.otherTypesMessagePanelVisible = false;
			},
			showOtherTypesMessagePanel () {
				this.otherTypesMessagePanelVisible = !this.otherTypesMessagePanelVisible;
				this.emoji.visible = false;
			},
			chooseEmoji (emojiKey) {
				this.text +=emojiKey;
			},
			sendAudioMessage (file) {
				this.goEasy.im.createAudioMessage({
					to : this.to,
					file: file,
					onProgress :function (progress) {
						console.log(progress)
					},
					onSuccess: (message) => {
						this.sendMessage(message);
					},
					onFailed: (e) => {
						console.log('error :',e);
					}
				});
			},
			sendTextMessage ()  {
				if (this.text.trim() !== '') {
					let textMessage = this.goEasy.im.createTextMessage({
						text: this.text,
						to : this.to
					});
					this.sendMessage(textMessage);
				}
				this.text = '';
			},
			sendMessage(message){
				this.history.messages.push(message);
				this.scrollToBottom();
				this.goEasy.im.sendMessage({
					message: message,
					onSuccess: function (message) {
						console.log('发送成功.', message);
					},
					onFailed: function (error) {
						if(error.code === 507){
							console.log('发送语音/图片/视频/文件失败，没有配置OSS存储，详情参考：https://www.goeasy.io/cn/docs/goeasy-2.x/im/message/media/send-media-message.html');
						}else{
							console.log('发送失败:',error);
						}
					}
				});
			},
			scrollToBottom () {
				this.$nextTick(function() {
					uni.pageScrollTo({
						scrollTop: 2000000,
						duration: 0
					})
				});
			},
			loadHistoryMessage(scrollToBottom) {//历史消息
				let lastMessageTimeStamp = null;
				let lastMessage = this.history.messages[0];
				if (lastMessage) {
					lastMessageTimeStamp = lastMessage.timestamp;
				}
				this.goEasy.im.history({
					type: this.GoEasy.IM_SCENE.CS,
					id: this.shop.id,
					lastTimestamp: lastMessageTimeStamp,
					limit: 10,
					onSuccess: (result) => {
						uni.stopPullDownRefresh();
						let messages = result.content;
						if (messages.length === 0) {
							this.history.allLoaded = true;
						} else {
							this.history.messages = messages.concat(this.history.messages);
							if (scrollToBottom) {
								this.scrollToBottom();
								//收到的消息设置为已读
								this.markMessageAsRead();
							}
						}
					},
					onFailed: (error) => {
						//获取失败
						console.log('获取历史消息失败:',error);
						uni.stopPullDownRefresh();
					}
				});
			},
			switchAudioKeyboard() {
				this.audio.visible = !this.audio.visible;
			},
			onRecordStart () {
				try{
					recorderManager.start();
				}catch(e){
					uni.showModal({
						title: '录音错误',
						content : '请在app和小程序端体验录音，Uni官方明确H5不支持getRecorderManager, 详情查看Uni官方文档'
					});
				}
			},
			onRecordEnd () {
				try{
					recorderManager.stop();
				}catch(e){
					console.log(e);
				}
			},
			sendVideoMessage () {
				uni.chooseVideo({
					success : (res) => {
						this.goEasy.im.createVideoMessage({
							to : this.to,
							file: res,
							onProgress :function (progress) {
								console.log(progress)
							},
							onSuccess: (message) => {
								this.sendMessage(message);
							},
							onFailed: (e) => {
								console.log('error :',e);
							}
						});
					}
				})
			},
			sendImageMessage() {
				uni.chooseImage({
					count : 9,
					success: (res) => {
						res.tempFiles.forEach(file => {
							this.goEasy.im.createImageMessage({
								to : this.to,
								file: file,
								onProgress :function (progress) {
									console.log(progress)
								},
								onSuccess: (message) => {
									this.sendMessage(message);
								},
								onFailed: (e) => {
									console.log('error :',e);
								}
							});
						})
					}
				});
			},
			selectOrder (order) {
				this.customMessage.selectedOrder = order;
			},
			closeCustomMessageForm () {
				this.customMessage.visible = false;
				this.customMessage.selectedOrder = null;
			},
			sendCustomMessage () {
				let customMessage = this.goEasy.im.createCustomMessage({
					type : 'order',
					payload : this.customMessage.selectedOrder,
					to : this.to,
				});
				this.sendMessage(customMessage);
				this.customMessage.selectedOrder = null;
				this.customMessage.visible = false;
			},
			showImageFullScreen (e) {
				let imagesUrl = [e.currentTarget.dataset.url];
				uni.previewImage({
					urls: imagesUrl
				});
			},
			playVideo (e) {
				this.videoPlayer.visible = true;
				this.videoPlayer.url = e.currentTarget.dataset.url;
				this.$nextTick(() => {
					this.videoPlayer.context.requestFullScreen({
						direction : 0
					});
					this.videoPlayer.context.play();
				});
			},
			onVideoFullScreenChange (e) {
				//当退出全屏播放时，隐藏播放器
				if(this.videoPlayer.visible && !e.detail.fullScreen){
					this.videoPlayer.visible = false;
					this.videoPlayer.context.stop();
				}
			},
			markMessageAsRead () {
				this.goEasy.im.markMessageAsRead({
					type: this.GoEasy.IM_SCENE.CS,
					id: this.shop.id,
					onSuccess: function () {
						console.log('标记已读成功');
					},
					onFailed: function (error) {
						console.log("标记已读失败",error);
					}
				});
			}
		}
	}
</script>

<style>
	page {
		height: 100%;
	}
	.chatInterface{
		height: 100%;
		background-color: #FFFFFF;
	}
	.scroll-view{
		padding-left: 20rpx;
		padding-right: 20rpx;
		box-sizing: border-box;
		-webkit-overflow-scrolling: touch;
		padding-bottom: 140rpx;
		background-color: #FFFFFF;
	}
	.scroll-view .all-history-loaded{
		font-size: 24rpx;
		height: 90rpx;
		line-height: 90rpx;
		width: 100%;
		text-align: center;
		color: grey;
	}

	.scroll-view .message-item{
		display: flex;
		margin: 20rpx 0;
	}
	.scroll-view .message-item .message-item-checkbox {
		height: 80rpx;
		display: flex;
		align-items: center;
	}
	.scroll-view .message-item .message-item-content {
		flex: 1;
		overflow: hidden;
		display: flex;
	}
	.scroll-view .message-item .message-item-content.self{
		overflow: hidden;
		display: flex;
		justify-content: flex-start;
		flex-direction: row-reverse;
	}
	.scroll-view .message-item .avatar{
		width: 80rpx;
		height: 80rpx;
		flex-shrink: 0;
		flex-grow: 0;
	}

	.scroll-view .message-item .avatar image{
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.scroll-view .message-item .accept-message {
		width: 100%;
		text-align: center;
		color: #333333;
		font-size: 28rpx;
	}

	.scroll-view .content{
		font-size: 34rpx;
		line-height: 44rpx;
		margin: 0 20rpx;
		max-width: 520rpx;
		display: flex;
		flex-direction: column;
	}
	.scroll-view .content .staff-name {
		font-size: 28rpx;
		color: #888888;
	}
	.scroll-view .content .message-payload{
		display: flex;
		align-items: center;
	}
	.scroll-view .content .image-content{
		border-radius: 12rpx;
	}
	.vertical-img {
		height: 400rpx;
	}
	.horizontal-img {
		height: 300rpx;
	}
	.normal-img {
		height: 200rpx;
	}
	.scroll-view .content .text-content img{
		width: 50rpx;
		height: 50rpx;
	}
	.scroll-view .content .order-content {
		border-radius: 20rpx;
		background: #EFEFEF;
		padding: 16rpx;
		display: flex;
		flex-direction: column;
	}
	.scroll-view .content .order-content .order-description {
		font-weight: bold;
		margin-bottom: 10rpx;
	}
	.scroll-view .content .order-content .order-body {
		display: flex;
		background-color: #fffcfc;
	}
	.scroll-view .content .order-content .order-info {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		font-size: 28rpx;
		padding: 25rpx 10rpx;
	}
	.scroll-view .content .order-content .order-info .order-name{
		font-size: 30rpx;
	}
	.scroll-view .content .order-content .order-info .foods-price{
		color: #d02129;
	}
	.scroll-view .content .order-content image{
		width: 200rpx;
		height: 200rpx;
	}

    .scroll-view .content .pending{
		background: url("/static/images/pending.gif") no-repeat center;
		background-size: 30rpx;
		width: 30rpx;
		height: 30rpx;
		margin-right: 10rpx;
	}

	.scroll-view .content .send-fail{
		background: url("/static/images/failed.png") no-repeat center;
		background-size: 30rpx;
		width: 30rpx;
		height: 30rpx;
		margin-right: 10rpx;
	}

	.action-box{
		display: flex;
		backdrop-filter: blur(0.27rpx);
		width: 100%;
		position: fixed;
		bottom: 0;
		left: 0;
		flex-direction: column;
		background-color: #F6F6F6;
	}
	.action-box .action-top{
		display: flex;
		padding-top: 20rpx;
		backdrop-filter: blur(0.27rem);
		height: 100rpx;
		width: 100%;
	}
	.action-box .action-top .record-icon{
		border-radius: 55%;
		font-size: 32rpx;
		margin: 0 10rpx;
		width: 80rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background: url("/static/images/record-appearance-icon.png") no-repeat center #FFFFFF;
		background-size: 50%;
		-webkit-tap-highlight-color:rgba(0,0,0,0);
	}
	.action-box .action-top .file-icon{
		background: url("/static/images/video.png") no-repeat center;
		background-size: 70%;
		color: #9D9D9D;
		position: relative;
		width:80rpx;
		height: 80rpx;
		line-height: 80rpx;
		-webkit-tap-highlight-color:rgba(0,0,0,0);
	}
	.action-box .record-icon.record-open{
		background: url("/static/images/jianpan.png") no-repeat center #ffffff;
		background-size: 60%;
		-webkit-tap-highlight-color:rgba(0,0,0,0);
	}
	.action-box .action-top .img-video{
		background: url("/static/images/file.png") no-repeat center;
		background-size: 73%;
	}
	.action-box .action-top .emoji-icon{
		background: url("/static/images/emoji.png") no-repeat center;
		background-size: 50%;
	}
	.action-box .action-top .more-icon{
		background: url("/static/images/more.png") no-repeat center;
		background-size: 70%;
	}
	.action-box .action-bottom .more-item{
		display: flex;
		flex-direction: column;
		width: 150rpx;
		height: 150rpx;
		margin-right: 20rpx;
		align-items: center;
	}
	.action-box .action-bottom .more-item image{
		height: 100rpx;
		width: 100rpx;
	}
	.action-box .action-bottom .more-item text{
		font-size: 20rpx;
		text-align: center;
		line-height: 50rpx;
	}
	.action-box .action-top .record-input{
		width: 480rpx;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		font-size: 28rpx;
		background: #cccccc;
		color: #ffffff;
		text-align: center;
	}
	.action-box .action-top .message-input{
		border-radius: 40rpx;
		background: #FFFFFF;
		height: 80rpx;
		display: flex;
	}
	.action-box .action-top .message-input input{
		width: 380rpx;
		height: 80rpx;
		line-height: 80rpx;
		padding-left: 20rpx;
		font-size: 28rpx;
	}
	.action-box .action-top .send-message-btn{
		width: 80rpx;
		height: 80rpx;
		background: url("/static/images/send.png") no-repeat center;
		background-size: 55%;
	}
	.action-bottom{
		height: 300rpx;
		width:100%;
		padding: 20rpx;
		box-sizing: border-box;
		display: flex;
	}

	.action-bottom-emoji{
		justify-content: space-around;
	}

	.action-bottom image{
		width:100rpx;
		height: 100rpx;
	}

	.messageSelector-box{
		display: flex;
		justify-content: center;
		align-items: center;
		backdrop-filter: blur(0.27rpx);
		width: 100%;
		position: fixed;
		bottom: 0;
		left: 0;
		border-radius: 12rpx;
		background: #EFEFEF;
		height: 80rpx;
		padding: 20rpx 0;
		font-size: 32rpx;
	}

	.record-loading{
		position: fixed;
		top:50%;
		left: 50%;
		width: 300rpx;
		height: 300rpx;
		margin: -150rpx -150rpx;
		background: #262628;
		background: url("/static/images/recording-loading.gif") no-repeat center;
		background-size: 100%;
		border-radius: 40rpx;
	}
	.img-layer{
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #000000;
		z-index: 9999;
		padding: 6rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.img-layer uni-image {
		height: 100%!important;
	}
	.img-layer {
		height: 100%!important;
		width: 100%!important;
	}
	
	.order-list {
		position: fixed;
		top: 0;
		bottom: 0;
		z-index: 10;
		width: 100vw;
		height: 100vh;
		background: rgba(0,0,0,0.5);
	}

	.orders-content {
		position: absolute;
		width: 100%;
		height: 600rpx;
		bottom: 0;
		background: #F4F5F9;
		z-index: 200;
	}

	.title{
		text-align: center;
		font-weight: 600;
		font-size: 34rpx;
		color: #000000;
		line-height: 80rpx;
	}

	.orders {
		display: flex;
		flex-direction: column;
	}

	.order-item{
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding: 10px 0;
	}
	
	.order-item-checked {
		background-color: #e9dddd;
	}
	
	.order-img {
		width: 80rpx;
		height: 80rpx;
	}

	.order-name {
		width: 280rpx;
	}

	.action{
		display: flex;
		justify-content: space-around;
		height: 80rpx;
		margin-top: 40rpx;
	}

	.send-btn{
		width:200rpx;
		height: 80rpx;
		background: #d02129;
		line-height:80rpx;
		text-align: center;
		border-radius: 10rpx;
		color: #FFFFFF;
		font-size: 32rpx;
	}
	.cancel-btn{
		width:200rpx;
		height: 80rpx;
		background: #FFFFFF;
		line-height:80rpx;
		text-align: center;
		border-radius: 10rpx;
		color: #666666;
		font-size: 32rpx;
		border: 1px solid grey;
		box-sizing: border-box;
	}

	.video-snapshot{
		position: relative;
	}

	.video-snapshot video{
		max-height: 300rpx;
		max-width: 400rpx;
	}

	.video-snapshot .video-play-icon{
		position: absolute;
		width: 40rpx;
		height: 40rpx;
		border-radius: 20rpx;
		background:url("/static/images/play.png") no-repeat center;
		background-size: 100%;
		top:50%;
		left: 50%;
		margin:-20rpx;
	}

	.time-lag{
		font-size: 20rpx;
		text-align: center;
	}

	.message-read {
		color: grey;
		font-size: 24rpx;
		text-align: end;
		height: 36rpx;
	}

	.message-unread {
		color: #6896c1;
		font-size: 24rpx;
		text-align: end;
		height: 36rpx;
	}

</style>
