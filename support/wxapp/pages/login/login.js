/* login.js */
import restApi from '../../static/lib/restapi';
Page({
	data: {
		username:'',
		password:'',
		showError:false,
	},
	login: function(e) {
		let username = e.detail.value.username;
		let password = e.detail.value.password;
		if (username.trim() !== '' && password.trim() !== '') {
			let agent = restApi.findAgent(username, password);
			if (agent) {
				wx.setStorageSync('currentAgent', agent);
				// 页面跳转
				wx.switchTab({
					url:'../conversations/conversations'
				});
				return;
			}
		}
		this.setData({
			showError:true
		});
	}
})
