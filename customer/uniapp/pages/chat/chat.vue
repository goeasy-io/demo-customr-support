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
						<view v-if="message.type === 'CLOSED'" class="accept-message">
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
										mode="heightFix"
									></image>
									<view class="video-snapshot" v-if="message.type === 'video'" :data-url="message.payload.video.url" @click="playVideo">
										<image :src="message.payload.thumbnail.url" mode="heightFix"></image>
										<view class="video-play-icon"></view>
									</view>
									<GoEasyAudioPlayer v-if="message.type ==='audio'" :src="message.payload.url" :duration="message.payload.duration" />
									<view v-if="message.type === 'goods'" class="goods-content">
										<view class="goods-description">为你推荐：</view>
										<view style="display: flex;background-color: #fffcfc;">
											<image :src="message.payload.url"></image>
											<view class="goods-info">
												<view class="goods-name">{{message.payload.name}}</view>
												<view style="color: #434343;">月销{{message.payload.sales}}</view>
												<view class="foods-price">{{message.payload.price}}</view>
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
					<image src="../../static/images/tupian.png"></image>
					<text>图片</text>
				</view>
				<view class="more-item" @click="sendVideoMessage">
					<image src="../../static/images/shipin.png"></image>
					<text>视频</text>
				</view>
			</view>
		</view>
		<view class="record-loading" v-if="audio.recording"></view>
		<video v-if="videoPlayer.visible" :src="videoPlayer.url" id="videoPlayer" @fullscreenchange="onVideoFullScreenChange"></video>
	</view>
</template>

<script>
	import GoEasyAudioPlayer from '../../components/GoEasyAudioPlayer/GoEasyAudioPlayer';
	import restApi from '../../lib/restapi';
	import EmojiDecoder from '../../lib/EmojiDecoder';
	const recorderManager = uni.getRecorderManager();
	export default {
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
		onLoad(options) {
			let shopId = options.to;
			shopId = shopId.split('#')[1] || shopId; //todo：为啥这么复杂？
			this.shop = restApi.findShopById(shopId);
			this.currentUser = uni.getStorageSync('currentCustomer'); //todo:不能自己把自己叫customer

			this.loadHistoryMessage(true,0);  //todo：这个0是啥意思？
			this.initRecorderListeners();
			this.goEasy.im.on(this.GoEasy.IM_EVENT.CS_MESSAGE_RECEIVED, this.onCSMessageReceived);
		},
		beforeDestroy() {
			this.goEasy.im.off(this.GoEasy.IM_EVENT.CS_MESSAGE_RECEIVED, this.onCSMessageReceived);
		},
		methods: {
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
					//todo:踢出去一个单独的方法
					let audioMessage = this.goEasy.im.createAudioMessage({
						to : {
							id : this.shop.id,
							type : this.GoEasy.IM_SCENE.CS,
							data : {
								name:this.shop.name,
								avatar:this.shop.avatar
							}
						},
						file: res,
						onProgress :function (progress) {
							console.log(progress)
						},
						notification : {
							title : this.currentUser.name + '发来一段语音',
							body : '[语音消息]'		// 字段最长 50 字符
						}
					});
					this.sendMessage(audioMessage);
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
				return '<view class="text-content">' + this.emoji.decoder.decode(message.payload.text) + '</view>'
			},

			//todo：实际不需要cs开头对吧？
			onCSMessageReceived (message) {
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
			sendTextMessage ()  {
				if (this.text.trim() !== '') {
					let textMessage = this.goEasy.im.createTextMessage({
						text: this.text,
						//todo： 这个to是不是可以共享？
						to : {
							id : this.shop.id,
							type : this.GoEasy.IM_SCENE.CS,
							data : {
								name:this.shop.name,
								avatar:this.shop.avatar
							}
						}
					});
					console.log('text:',textMessage);
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
							console.log('this.history.messages:',this.history.messages);
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
						let videoMessage = this.goEasy.im.createVideoMessage({
							to : {
								id : this.shop.id,
								type : this.GoEasy.IM_SCENE.CS,
								data : {
									name:this.shop.name,
									avatar:this.shop.avatar
								}
							},
							file: res,
							onProgress :function (progress) {
								console.log(progress)
							},
							notification : {
								title : this.currentUser.name + '发来一个视频',
								body : '[视频消息]'		// 字段最长 50 字符
							}
						});
						videoMessage.buildOptions.complete.then(() => {
							this.sendMessage(videoMessage);
						}).catch((error) => {
							console.log(error);
						});
					}
				})
			},
			sendImageMessage() {
				uni.chooseImage({
					count : 9,
					success: (res) => {
						res.tempFiles.forEach(file => {
							let imageMessage = this.goEasy.im.createImageMessage({
								to : {
									id : this.shop.id,
									type : this.GoEasy.IM_SCENE.CS,
									data : {
										name:this.shop.name,
										avatar:this.shop.avatar
									}
								},
								file: file,
								onProgress :function (progress) {
									console.log(progress)
								},
								notification : {
									title : this.currentUser.name + '发来一张图片',
									body : '[图片消息]'		// 字段最长 50 字符
								}
							});
							imageMessage.buildOptions.complete.then(() => {
								this.sendMessage(imageMessage);
							}).catch((error) => {
								console.log(error);
							});
						})
					}
				});
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
					scene: this.GoEasy.IM_SCENE.CS,
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
		background-color: #EFEFEF;
	}
	.scroll-view{
		padding-left: 20rpx;
		padding-right: 20rpx;
		box-sizing: border-box;
		-webkit-overflow-scrolling: touch;
		padding-bottom: 140rpx;
		background-color: #EFEFEF;
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
		width: 300rpx;
		height: 300rpx;
	}
	.scroll-view .content .text-content img{
		width: 50rpx;
		height: 50rpx;
	}
	.scroll-view .content .goods-content {
		border-radius: 20rpx;
		background: #ffffff;
		padding: 16rpx;
		display: flex;
		flex-direction: column;
	}
	.scroll-view .content .goods-content .goods-description {
		font-weight: bold;
		margin-bottom: 10rpx;
	}
	.scroll-view .content .goods-content .goods-info {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		font-size: 28rpx;
		padding: 25rpx 10rpx;
	}
	.scroll-view .content .goods-content .goods-info .goods-name{
		font-size: 30rpx;
	}
	.scroll-view .content .goods-content .goods-info .foods-price{
		color: #d02129;
	}
	.scroll-view .content .goods-content image{
		width: 200rpx;
		height: 200rpx;
	}

	.rtc-message {
		display: flex;
		flex-direction: row;
	}

	.rtc-icon {
		width: 44rpx;
		height: 44rpx;
		margin-right: 10rpx;
	}

	.rtc-duration {
		margin-left: 10rpx;
	}

    .scroll-view .content .message-payload .file-content {
        width: 560rpx;
        height: 152rpx;
        font-size: 28rpx;
        background: white;
        display: flex;
		align-items: center;
        border-radius: 10rpx;
		padding: 0 20rpx;
    }

    .scroll-view .content .file-content .file-info {
		width: 424rpx;
		height: 132rpx;
		padding: 12rpx 0;
    }

    .scroll-view .content .file-content .file-info .file-name {
        width: 420rpxrpx;
		font-size: 13px;
		text-overflow: ellipsis;
		overflow: hidden;
		display: -webkit-box;
		word-break: break-all;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
    }
    .scroll-view .content .file-content .file-info .file-size {
        width: 200rpx;
        font-size: 24rpx;
        color: #ccc;
    }
    .scroll-view .content .file-content .file-img {
        width: 50rpx;
        height: 50rpx;
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
		border-radius: 50%;
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
		background: url("/static/images/jianpan.png") no-repeat center;
		background-size: 70%;
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
		background-size: 56%;
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

	.messageSelector-box .messageSelector-btn {
		width: 80rpx;
		height: 80rpx;
	}

	uni-checkbox:not([disabled]) .uni-checkbox-input:hover {
	    border-color: #d1d1d1 !important;
	}

	uni-checkbox .uni-checkbox-input {
		border-radius: 50% !important;
	}

	/* #ifdef MP-WEIXIN */
	checkbox .wx-checkbox-input {
		border-radius: 50% !important;
	}
	checkbox .wx-checkbox-input.wx-checkbox-input-checked {
		color: #007aff !important;
	}
	/* #endif */

	.action-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.action-popup .layer {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(51, 51, 51, 0.5);
		z-index: 999;
	}
	.action-popup .action-box {
		width: 350rpx;
		background: #434343;
		position: relative;
		z-index: 1000;
		border-radius: 20rpx;
		overflow: hidden;
	}
	.action-popup .action-item {
		text-align: center;
		height: 100rpx;
		line-height: 100rpx;
		font-size: 34rpx;
		color: #ffffff;
		border-bottom: 1px solid #EFEFEF;
	}
	.action-popup .action-item:last-child {
		border: none;
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

	.group-icon{
		right: 20rpx;
		width: 60rpx;
		height: 60rpx;
		top:14rpx;
		position: fixed;
		right: 20rpx;
		top:120rpx;
		background-color: #C4C4C4;
		z-index: 2;
		border-radius: 60rpx;
	}
	.uni-toast{
		background-color: #ffffff!important;
	}
	.time-lag{
		font-size: 20rpx;
		text-align: center;
	}
	.custom-message{
		width: 400rpx;
		height: 260rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: flex-start;
		box-sizing: border-box;
		padding: 10rpx 30rpx;
		border: 1px solid rgba(0, 0, 0, 0.05);
		box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.1);
		/* background-color: #FFFFFF; */
		background-color: #EEF4F9;
		border-radius: 20rpx;
	}
	.custom-message .title{
		width: 100%;
		display: flex;
		align-items: center;
		font-size: 30rpx;
	}
	.custom-message .title image{
		width: 40rpx;
		height: 40rpx;
	}
	.custom-message .custom-message-item{
		text-align: left;
		font-size: 28rpx;
		overflow: hidden;
		width: 100%;
		text-overflow:ellipsis;
		white-space: nowrap;
	}

	.message-read {
		color: grey;
		font-size: 24rpx;
		text-align: end;
		height: 36rpx;
	}

	.message-unread {
		/* color: #618DFF; */
		color: #6896c1;
		font-size: 24rpx;
		text-align: end;
		height: 36rpx;
	}

	.message-recalled {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 56rpx;
		font-size: 26rpx;
		text-align: center;
		color: grey;
	}

	.message-recalled .message-recalled-self {
		display: flex;
	}

	.message-recalled .message-recalled-self span {
		margin-left: 10rpx;
		/* color: #618DFF; */
		color: #6896c1;
	}

	.memberSelector-box {
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 600rpx;
		background-color: #fffadd;
		display: flex;
		flex-direction: column;
	}

	.memberSelector-box .box-title {
		height: 120rpx;
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.memberSelector-box .box-body {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: 0 30rpx;
		z-index: 999;
	}

	.memberSelector-box .user-item {
		width: 100%;
		display: flex;
		align-items: center;
	}

	.memberSelector-box .user-item-avatar {
		margin-left: 20rpx;
	}

	.memberSelector-box .user-item-avatar image{
		width: 100rpx;
		height: 100rpx;
	}

	.memberSelector-box .user-item-info {
		margin-left: 20rpx;
	}

</style>
