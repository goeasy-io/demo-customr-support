import restApi from '../../static/lib/restapi';
const app = getApp();

Page({
	data: {
		customers: [],
	},
	onShow () {
        let customers = restApi.findCustomers();
		this.setData({
			customers: customers,
		});
	},
	chat (e) {//进入私聊
		const customer = e.currentTarget.dataset.customer;
		wx.navigateTo({
			url : '../chat/chat?to='+JSON.stringify(customer)
		});
	}
})
