/* login.js */
import restApi from '../../static/lib/restapi';
Page({
	data: {
		agentSelector: {
			agents: [],
			visible: false,
			index: 0,
			selectedAgent: null
		},

		username:'',
		password: {
			visible: false,
			value: '123'
		},
		errorVisible: false
	},
	onLoad () {
		let agents = restApi.findAgents();
		this.setData({
			['agentSelector.agents']: agents
		})
	},
	switchSelectorVisible() {
		this.setData({
			['agentSelector.visible']: !this.data.agentSelector.visible
		})
	},
	selectAgent(e) {
        let agent = e.currentTarget.dataset.agent;
		this.setData({
			['agentSelector.visible']: false,
			['agentSelector.selectedAgent']: agent,
			['username']: agent.name
        })
	},
	switchPasswordVisible() {
		this.setData({
			['password.visible']: !this.data.password.visible
        })
	},
	login: function(e) {
		if (this.data.username.trim() !== '' && this.data.password.value.trim() !== '') {
			let agent = restApi.findAgent(this.data.username, this.data.password.value);
			if (agent) {
				wx.setStorageSync('currentAgent', JSON.stringify(agent));
				// 页面跳转
				wx.switchTab({url:'../conversations/conversations'});
				return;
			}
		}
		this.setData({
			errorVisible:true
		});
	}
})
