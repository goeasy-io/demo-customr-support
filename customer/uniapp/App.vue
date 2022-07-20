<script>
    export default {
		onLaunch: function() {
			console.log('App onLaunch');
		},
		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide')
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
	/* .self .text-content {
		color: #FFFFFF !important;
		background: #6896c1 !important;
		border-radius: 30rpx 0 30rpx 30rpx;
	} */
	.self .audio-facade{
		flex-direction: row-reverse;
		color: #FFFFFF !important;
		/* background: #618DFF !important; */
		background: #6896c1 !important;
	}
	.self .audio-facade-bg {
		background: url("/static/images/voice-self.png") no-repeat center !important;
	}
	.self .audio-facade-bg.play-icon {
		background: url("/static/images/play-self.gif") no-repeat center !important;
	}
</style>
