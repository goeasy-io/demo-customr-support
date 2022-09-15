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
			['agentSelector.selectedAgent']: agent
        })
	},
	switchPasswordVisible() {
		this.setData({
			['password.visible']: !this.data.password.visible
        })
	},
	login: function(e) {
		const selectedAgent = this.data.agentSelector.selectedAgent;
		const password = this.data.password.value
		if (selectedAgent !== null && password.trim() !== '') {
			let agent = restApi.findAgent(selectedAgent.name, password);
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
