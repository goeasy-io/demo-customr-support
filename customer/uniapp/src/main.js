import Vue from 'vue';
import App from './App';
import GoEasy from '@/uni_modules/GoEasy-CS/js_sdk/goeasy-2.6.6.esm.min.js'

Vue.config.productionTip = false;

const goEasy = GoEasy.getInstance({
	host: 'hangzhou.goeasy.io',	//若是新加坡区域：singapore.goeasy.io
	appkey: 'BC-xxxxxx', // common key,
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
