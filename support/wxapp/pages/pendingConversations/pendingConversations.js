const app = getApp();
Page({
    data : {
        csteam: null,
        pendingConversationAmount: 0,
        pendingConversations: [],
    },
    onShow () {
        const currentAgent = app.globalData.currentAgent;
        const csteam = wx.goEasy.im.csteam(currentAgent.shopId);
		this.setData({
            csteam: csteam
		});
        this.listenConversationUpdate(); //监听会话列表变化
        this.loadConversations(); //加载会话列表
    },
    onHide(){
        wx.goEasy.im.off(wx.GoEasy.IM_EVENT.PENDING_CONVERSATIONS_UPDATED, this.renderPendingConversations);
    },
    // 加载最新的待接入会话列表
    loadConversations() {
        wx.goEasy.im.pendingConversations({
            onSuccess: (result) => {
                this.renderPendingConversations(result.content);
            },
            onFailed: (error) => {
                console.log('获取待接入列表失败, error:', error);
            }
        });
    },
    listenConversationUpdate() {
        // 监听会话列表变化
        wx.goEasy.im.on(wx.GoEasy.IM_EVENT.PENDING_CONVERSATIONS_UPDATED, this.renderPendingConversations);
    },
    renderPendingConversations(content) {
        this.setData({
            pendingConversations : content.conversations,
            pendingConversationAmount: content.conversations.length
        });
    },
    chat (e) {
        const conversation = e.currentTarget.dataset.conversation;
        const customer = {
            id: conversation.id,
            name: conversation.data.name,
            avatar: conversation.data.avatar,
        }
        wx.navigateTo({
            url : '../chat/chat?to='+ JSON.stringify(customer)
        });
    },
    acceptSession (e) {
        const conversation = e.currentTarget.dataset.conversation;
        const customer = {
            id: conversation.id,
            name: conversation.data.name,
            avatar: conversation.data.avatar,
        }
        this.data.csteam.accept({
            customer: {
                id: customer.id,
                data: {
                    name: customer.name,
                    avatar: customer.avatar
                }
            },
            onSuccess: () => {
                console.log('accept successfully.');
                wx.navigateTo({
                    url : '../chat/chat?to='+JSON.stringify(customer)
                })
            },
            onFailed: (error) => {
                console.log('accept failed', error);
            }
        })
    }
})
