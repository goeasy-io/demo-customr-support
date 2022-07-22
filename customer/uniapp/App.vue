<script>
    export default {
		globalData:{
		},
		onLaunch: function() {
			console.log('App onLaunch');
			let currentUser = uni.getStorageSync('currentUser');
			if(!currentUser){
				uni.navigateTo({url: './login/login'});
				return;
			}
			if(this.goEasy.getConnectionStatus() === 'disconnected') {
				this.connectGoEasy();  //连接goeasy
			}
			this.goEasy.im.on(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.setUnreadNumber);
		},
		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide');
		},
		beforeDestroy() {
			this.goEasy.im.off(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.setUnreadNumber);
		},
		methods : {
			connectGoEasy () {
				let currentUser = uni.getStorageSync('currentUser');
				this.goEasy.connect({
					id: currentUser.uuid,
					data: {
						name: currentUser.name,
						avatar: currentUser.avatar
					},
					onSuccess: () => {
						console.log('GoEasy connect successfully.')
					},
					onFailed: (error) => {
						console.log('Failed to connect GoEasy, code:'+error.code+ ',error:'+error.content);
					},
					onProgress: (attempts) => {
						console.log('GoEasy is connecting', attempts);
					}
				});
			},
			setUnreadNumber (content) {
				let unreadTotal = content.unreadTotal;
				if(unreadTotal > 0) {
					uni.setTabBarBadge({
						index: 1,
						text: unreadTotal.toString()
					});
				}else{
					uni.removeTabBarBadge({index: 1});
				}
			},
		}
	}
</script>

<style>
	.text-content{
		padding: 16rpx;
		border-radius: 20rpx;
		color: #000000;
		background: #ffffff;
		word-break: break-all;
		text-align: left;
		vertical-align: center;
		display: block;
		display: flex;
		flex-direction: row;
	}
</style>
