import Vue from 'vue';
import App from './App';
import GoEasy from './lib/goeasy-2.5.3.min'

Vue.config.productionTip = false;

const goEasy = GoEasy.getInstance({
	host: 'hangzhou.goeasy.io', //应用所在的区域地址: 【hangzhou.goeasy.io |singapore.goeasy.io】
	appkey: process.env.VUE_APP_APPKEY, // common key,
	modules: ['im'],
	// true表示支持通知栏提醒，false则表示不需要通知栏提醒
	allowNotification: true, //仅有效于app,小程序和H5将会被自动忽略
});

goEasy.im.on(GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, setUnreadNumber);
function setUnreadNumber (content) {
	let unreadTotal = content.unreadTotal;
	if(unreadTotal > 0) {
		uni.setTabBarBadge({
			index: 1,
			text: unreadTotal.toString()
		});
	}else{
		uni.removeTabBarBadge({index: 1});
	}
}

Vue.prototype.GoEasy = GoEasy;
Vue.prototype.goEasy = goEasy;

App.mpType = 'app';
const app = new Vue({
    ...App
});
app.$mount();
