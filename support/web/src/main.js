import Vue from 'vue'
import App from './App.vue'
import router from './router'
import GoEasy from 'goeasy';

Vue.config.productionTip = false

Vue.prototype.globalData = {
    currentAgent: null
};

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

const goEasy = GoEasy.getInstance({
	host: 'hangzhou.goeasy.io',	//应用所在的区域地址: 【hangzhou.goeasy.io |singapore.goeasy.io】
	appkey: 'BC-xxxx', // common key,
	modules: ['im']
});

Vue.prototype.GoEasy = GoEasy;
Vue.prototype.goEasy = goEasy;

