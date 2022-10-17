let app = getApp();
Component({
    options: {
        multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    },
    properties: {
        title: String,
        shop: Object
    },
    data: {
        csteam: null,
        onlineConfig: {
            online: false,
            visible: false
        },
        navBarHeight: 0,
        menuConfig: {
            top: 0,
            left: 0,
            height: 0,
        },
    },
    attached() {
        this.initPageSize();
    },
    ready() {
        const csteam = wx.goEasy.im.csteam(this.data.shop.id);
        this.setData({
            csteam: csteam,
        });
        this.initialOnlineStatus();
    },
    methods: {
        initPageSize() {
            // 获取系统信息
            const systemInfo = wx.getSystemInfoSync();
            // 胶囊按钮位置信息
            const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
            // 导航栏高度 = 状态栏高度 + 44
            const navBarHeight = systemInfo.statusBarHeight + 44;
            const left = systemInfo.screenWidth - menuButtonInfo.right;
            const top = menuButtonInfo.top;
            const height = menuButtonInfo.height;
            this.setData({
                navBarHeight: navBarHeight,
                menuConfig: {
                    top: top,
                    left: left,
                    height: height,
                }
            })
        },
        switchPopup() {
            this.setData({
                ['onlineConfig.visible']: !this.data.onlineConfig.visible
            })
        },
        initialOnlineStatus() {
            this.data.csteam.isOnline({
                onSuccess: (result) => {
                    this.setData({
                        ['onlineConfig.online']: result
                    })
                    console.log('获取在线状态成功',this.data.onlineConfig.online)
                },
                onFailed: (error) => {
                    console.log('获取在线状态失败，error:', error)
                }
            })
        },
        online() {
            let currentAgent = app.globalData.currentAgent;
            this.data.csteam.online({
                teamData: {name: this.data.shop.name, avatar: this.data.shop.avatar},
                agentData: {name: currentAgent.name, avatar: currentAgent.avatar},
                onSuccess: () => {
                    this.setData({
                        ['onlineConfig.online']: true,
                        ['onlineConfig.visible']: false,
                    })
                    console.log('已上线', currentAgent);
                },
                onFailed: (error) => {
                    console.log('上线失败,error:', error);
                }
            })
        },
        offline() {
            this.data.csteam.offline({
                onSuccess: () => {
                    this.setData({
                        ['onlineConfig.online']: false,
                        ['onlineConfig.visible']: false
                    })
                    console.log('已下线');
                },
                onFailed: (error) => {
                    console.log('下线失败,error:', error);
                }
            })
        }
    },
})
