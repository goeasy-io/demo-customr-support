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
        //整体顶部导航栏的高度
        navHeight: 0,
        //状态栏高度
        statusBarHeight: 0,
        config: {
            online: false,
            visible: false
        },
        navBarHeight: 0,
        menuTop: 0,
        menuRight: 0,
        menuHeight: 0,
    },
    methods: {
        initPageSize() {
            // 获取系统信息
            const systemInfo = wx.getSystemInfoSync();
            // 胶囊按钮位置信息
            const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
            // 导航栏高度 = 状态栏高度 + 44
            let navBarHeight = systemInfo.statusBarHeight + 44;
            let menuRight = systemInfo.screenWidth - menuButtonInfo.right;
            let menuTop = menuButtonInfo.top;
            let menuHeight = menuButtonInfo.height;
            this.setData({
                navBarHeight: navBarHeight,
                menuTop: menuTop,
                menuRight: menuRight,
                menuHeight: menuHeight
            })
        },
        switchPopup() {
            this.setData({
                config: {
                    visible: !this.data.config.visible
                }
            })
        },
        initialOnlineStatus() {
            wx.goEasy.im.csteam(this.data.shop.id).isOnline({
                onSuccess: (result) => {
                    this.setData({
                        config: {
                            online: result
                        }
                    })
                },
                onFailed: (error) => {
                    console.log('获取在线状态失败，error:', error)
                }
            })
        },
        online() {
            let currentAgent = wx.getStorageSync('currentAgent')
            wx.goEasy.im.csteam(this.data.shop.id).online({
                teamData: {name: this.data.shop.name, avatar: this.data.shop.avatar},
                agentData: {name: currentAgent.name, avatar: currentAgent.avatar},
                onSuccess: () => {
                    this.setData({
                        config: {
                            online: true
                        }
                    })
                    console.log('已上线', this.currentAgent);
                },
                onFailed: (error) => {
                    console.log('上线失败,error:', error);
                }
            })
        },
        offline() {
            wx.goEasy.im.csteam(this.data.shop.id).offline({
                onSuccess: () => {
                    this.setData({
                        config: {
                            online: false
                        }
                    })
                    console.log('已下线');
                },
                onFailed: (error) => {
                    console.log('下线失败,error:', error);
                }
            })
        }
    },
    attached() {
        this.initPageSize();
    },
    ready() {
        this.initialOnlineStatus();
    }
})
