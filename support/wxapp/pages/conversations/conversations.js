const app = getApp();
import restApi from '../../static/lib/restapi';
import {formatDate} from '../../static/lib/utils';
Page({
	data : {
        csteam: null,
        currentAgent: null,
        shop: null,
        unreadAmount: 0,
        pendingConversationAmount: 0,
		pendingConversations: [],
		conversations : [],
		actionPopup : {
			visible : false,
			conversation : null
		},
		onlineConfig: {
			visible: false,
			online: false
		}
	},
	onShow () {
		if(!wx.getStorageSync('currentAgent')){
			wx.redirectTo({
				url : '../login/login'
			});
			return;
        }
        const currentAgent = JSON.parse(wx.getStorageSync('currentAgent'));
        const csteam = wx.goEasy.im.csteam(currentAgent.shopId);
        const shop = restApi.findShopById(currentAgent.shopId);
		this.setData({
            csteam: csteam,
            currentAgent : currentAgent,
            shop: shop
		});
		if (wx.goEasy.getConnectionStatus() === 'disconnected'|| wx.goEasy.getConnectionStatus() === 'connect_failed') {
			this.connectGoEasy();  //连接goeasy
		}
		this.initialOnlineStatus();
		this.listenConversationUpdate(); //监听会话列表变化
		this.loadConversations(); //加载会话列表
    },
	onHide(){
		// 销毁conversation监听器
		wx.goEasy.im.off(wx.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.renderLatestConversations);
		wx.goEasy.im.off(wx.GoEasy.IM_EVENT.PENDING_CONVERSATIONS_UPDATED, this.renderPendingConversations);
    },
	connectGoEasy() {
		let currentAgent = this.data.currentAgent;
		wx.goEasy.connect({
			id: currentAgent.id,
			data: {name: currentAgent.name, avatar: currentAgent.avatar},
			onSuccess: function () {  //连接成功
				console.log("GoEasy connect successfully.")
			},
			onFailed: function (error) { //连接失败
				console.log("Failed to connect GoEasy, code:" + error.code + ",error:" + error.content);
			},
			onProgress: function (attempts) { //连接或自动重连中
				console.log("GoEasy is connecting", attempts);
			}
		});
	},
	initialOnlineStatus() {
		this.data.csteam.isOnline({
			onSuccess: (result) => {
				this.setData({
					onlineConfig :{
						online: result
					}
				})
			},
			onFailed: (error) => {
				console.log('获取在线状态失败，error:', error)
			}
		})
	},
	offline() {
		this.data.csteam.offline({
			onSuccess: () => {
				this.setData({
					onlineConfig :{
						online: false
					}
				})
				console.log('已下线');
			},
			onFailed: (error) => {
				console.log('下线失败,error:', error);
			}
		})
	},
	online() {
		this.data.csteam.online({
			teamData: {name: this.data.shop.name, avatar: this.data.shop.avatar},
			agentData: {name: this.data.currentAgent.name, avatar: this.data.currentAgent.avatar},
			onSuccess: () => {
				this.setData({
					onlineConfig :{
						online: true
					}
				})
				console.log('已上线',this.currentAgent);
			},
			onFailed: (error) => {
				console.log('上线失败,error:', error);
			}
		})
	},
	// 加载最新的会话列表
	loadConversations() {
		wx.goEasy.im.latestConversations({
			onSuccess: (result) => {
				this.renderLatestConversations(result.content);
			},
			onFailed: (error) => {
				console.log('获取最新会话列表失败, error:', error);
			}
		});
		wx.goEasy.im.pendingConversations({
			onSuccess: (result) => {
				this.renderPendingConversations(result.content);
			},
			onFailed: (error) => {
				console.log('获取待接入列表失败, code:' + error.code + 'content:' + error.content);
			},
		});
	},
	listenConversationUpdate() {
		// 监听会话列表变化
		wx.goEasy.im.on(wx.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.renderLatestConversations);
		wx.goEasy.im.on(wx.GoEasy.IM_EVENT.PENDING_CONVERSATIONS_UPDATED, this.renderPendingConversations);
	},
	renderLatestConversations(content) {
		let conversations = content.conversations;
		conversations && conversations.map((item) => {
			// 格式化时间格式
			item.lastMessage.date = formatDate(item.lastMessage.timestamp)
		});
		this.setData({
			conversations : conversations,
			unreadAmount: content.unreadTotal
		});
		this.refreshUnreadAmount();
	},
	renderPendingConversations(content) {
		this.setData({
			pendingConversationAmount: content.conversations.length
        });
        this.refreshUnreadAmount();
    },
	refreshUnreadAmount() {
		let unreadTotal = this.data.unreadAmount + this.data.pendingConversationAmount;
		if(unreadTotal >0){
			wx.setTabBarBadge({
				index: 0,
				text: unreadTotal.toString()
			});
		}else{
			wx.hideTabBarRedDot({index :0});
		}
	},
	setPendingConversationAmount(content) {
		this.setData({
			pendingConversationAmount: content.conversations.length
		})
	},
	topConversation(){
        let conversation = this.data.actionPopup.conversation;
		let description = conversation.top ? '取消置顶' : '置顶';
		wx.showLoading({title: '加载中...',mask: true});
		wx.goEasy.im.topConversation({
			top: !conversation.top,
			conversation: conversation,
			onSuccess: function () {
                wx.hideLoading();
				console.log(description, '成功');
			},
			onFailed: function (error) {
                wx.hideLoading();
				console.log(description, '失败：', error);
			},
		});
		this.closeMask();
	},
	removeConversation(){
        wx.showModal({
            content: '确定要删除这条会话吗？',
            success: (res) => {
              if (res.confirm) {
                wx.showLoading({title: '加载中...',mask: true});
                let conversation = this.data.actionPopup.conversation;
                wx.goEasy.im.removeConversation({
                    conversation: conversation,
                    onSuccess: function () {
                        wx.hideLoading();
                        console.log('删除会话成功');
                    },
                    onFailed: function (error) {
                        wx.hideLoading();
                        wx.showToast({
                            title: '删除失败',
                            duration: 3000,
                            icon: 'none'
                        });
                    },
                });
              }
            }
        })
        this.closeMask();
	},
	chat (e) {
        const conversation = e.currentTarget.dataset.conversation;
        const customer = {
            id: conversation.id,
            name: conversation.data.name,
            avatar: conversation.data.avatar,
        }
		wx.navigateTo({
			url : '../chat/chat?to='+JSON.stringify(customer)
        });
    },
    navigateToPendingConversation () {
        wx.navigateTo({
			url : '../pendingConversations/pendingConversations'
        });
    },
	showAction(e){
        let conversation;
        this.data.conversations.forEach((conversationItem) => {
            if (conversationItem.id === e.currentTarget.dataset.conversation.id) {
                conversation = conversationItem;
            }
        })
		this.setData({
			['actionPopup.conversation']: conversation,
			['actionPopup.visible']: true
		});
	},
	showNoPendingConversations () {
        wx.hideLoading();
		wx.showToast({
			title: '暂无待接入用户',
			duration: 2000,
			icon: 'none'
		});
	},
	closeMask(){
		// 关闭弹窗
		this.setData({
			['actionPopup.visible']: false
		})
	},
})
