import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 引入阿里字体图标
import './assets/iconfont/iconfont.css';
import GoEasy from './utils/goeasy.dev'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

const goEasy = GoEasy.getInstance({
	host: 'hangzhou.goeasy.io', //应用所在的区域地址: 【hangzhou.goeasy.io |singapore.goeasy.io】
	appkey: 'BC-xxxx', // common key,
	modules: ['im'],
	// true表示支持通知栏提醒，false则表示不需要通知栏提醒
	allowNotification: true, //仅有效于app,小程序和H5将会被自动忽略
});

Vue.prototype.GoEasy = GoEasy;
Vue.prototype.goEasy = goEasy;

Vue.prototype.formatDate = function (t) {
	t = t || Date.now();
	let time = new Date(t);
	let str = time.getMonth() < 9 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1;
	str += '-';
	str += time.getDate() < 10 ? '0' + time.getDate() : time.getDate();
	str += ' ';
	str += time.getHours();
	str += ':';
	str += time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes();
	return str;
};