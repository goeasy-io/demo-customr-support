import EmojiDecoder from '../../static/lib/EmojiDecoder';
import restApi from '../../static/lib/restapi';
import {formatDate, formateTime} from '../../static/lib/utils';

let emojiUrl = 'https://imgcache.qq.com/open/qcloud/tim/assets/emoji/';
let emojiMap = {
    '[么么哒]': 'emoji_3@2x.png',
    '[乒乓]': 'emoji_4@2x.png',
    '[便便]': 'emoji_5@2x.png',
    '[信封]': 'emoji_6@2x.png',
    '[偷笑]': 'emoji_7@2x.png',
    '[傲慢]': 'emoji_8@2x.png'
};
const app = getApp();
const IMAGE_MAX_WIDTH = 200;
const IMAGE_MAX_HEIGHT = 150;

Page({
    data: {
        currentAgent: null,
        csteam: null,
        customer: null,
        customerStatus: null,

        to: {},//用于创建消息时传入

        history: {
            messages: [],
            allLoaded: false,
            loading: true
        },

        text: '',
        //定义表情列表
        emoji: {
            url: emojiUrl,
            map: emojiMap,
            visible: false,
            decoder: new EmojiDecoder(emojiUrl, emojiMap),
        },

        //是否展示‘其他消息类型面板’
        otherTypesMessagePanelVisible: false,

        orderList: {
            orders: [],
            visible: false,
        },
        transferForm: {
            visible: false,
            agents: [],
            to: {}
        },
        pendingTime: {
            timer: null,
            duration: ''
        }
    },
    onPullDownRefresh() {
        this.loadHistoryMessage(false);
    },
    onLoad: function (options) {
        // 获取初始数据并加载
        const currentAgent = JSON.parse(wx.getStorageSync('currentAgent'));
        const csteam = wx.goEasy.im.csteam(currentAgent.shopId);
        const customer = JSON.parse(options.to);
        this.setData({
            currentAgent: currentAgent,
            csteam: csteam,
            customer: customer,
            to: {
                type: wx.GoEasy.IM_SCENE.CS,
                id: customer.id,
                data: {name: customer.name, avatar: customer.avatar},
            }
        });
        wx.setNavigationBarTitle({title: customer.name});

        this.liveSession();
        this.loadHistoryMessage(true);
    },
    onUnload() {
        this.data.csteam.quitLiveSession({
            onSuccess: () => {
                console.log('quit successfully ');
            },
            onFailed: (error) => {
                console.log('failed to quit:', error);
            },
        });
    },
    liveSession() {
        this.data.csteam.liveSession({
            customerId: this.data.customer.id,
            onSuccess: () => {
                console.log('live successfully');
                this.markMessageAsRead();
            },
            onFailed: (error) => {
                console.log('failed to live session:', error);
            },
            onStatusUpdated: (customerStatus) => {
                if (customerStatus.status==='PENDING') {
                    this.updatePendingTime(customerStatus.start);
                }
                this.setData({
                    customerStatus: customerStatus,
                    waitingTime: this.data.waitingTime,
                })
            },
            onNewMessage: (message) => {
                this.onReceivedMessage(message);
            },
        })
    },
    updatePendingTime (time) {
        clearInterval(this.data.pendingTime.timer);
        let timer = setInterval(() => {
            let duration = formateTime(time)
            this.setData({
                ['pendingTime.duration']: duration
            })
        },1800);
         this.setData({
            ['pendingTime.timer']: timer
         })
    },
    onReceivedMessage(newMessage) {
        //如果该消息已存在，跳过
        if (this.data.history.messages.findIndex((message) => newMessage.id === message.messageId) >= 0) {
            return;
        }
        this.data.history.messages.push(newMessage);
        this.renderMessages(this.data.history.messages);
        this.markMessageAsRead();
        this.scrollToBottom();
    },
    markMessageAsRead() {
        this.data.csteam.markMessageAsRead({
            type: wx.GoEasy.IM_SCENE.CS,
            id: this.data.customer.id,
            onSuccess: function () {
                console.log('标记已读成功');
            },
            onFailed: function (error) {
                console.log('标记已读失败', error);
            }
        });
    },
    /**
     * 核心就是设置高度，产生明确占位
     *
     * 小  (宽度和高度都小于预设尺寸)
     *    设高=原始高度
     * 宽 (宽度>高度)
     *    高度= 根据宽度等比缩放
     * 窄  (宽度<高度)或方(宽度=高度)
     *    设高=MAX height
     *
     * @param width,height
     * @returns number
     */
    getImageHeight(width, height) {
        if (width < IMAGE_MAX_WIDTH && height < IMAGE_MAX_HEIGHT) {
            return height*2;
        } else if (width > height) {
            return (IMAGE_MAX_WIDTH / width * height)*2;
        } else if (width === height || width < height) {
            return IMAGE_MAX_HEIGHT*2;
        }
    },
    loadHistoryMessage(scrollToBottom) {
        //历史消息
        let self = this;
        let lastMessageTimeStamp;
        let lastMessage = this.data.history.messages[0];
        if (lastMessage) {
            lastMessageTimeStamp = lastMessage.timestamp;
        }
        let limit = 10;
        this.data.csteam.history({
            id: this.data.customer.id,
            type: wx.GoEasy.IM_SCENE.CS,
            lastTimestamp: lastMessageTimeStamp,
            limit: limit,
            onSuccess: (result) => {
                wx.stopPullDownRefresh();
                let messages = result.content;
                if (messages.length === 0) {
                    self.setData({
                        ['history.allLoaded']: true
                    });
                } else {
                    let messageList
                    if (lastMessageTimeStamp) {
                        messageList = messages.concat(this.data.history.messages);
                    } else {
                        messageList = messages;
                    }
                    if (scrollToBottom) {
                        this.scrollToBottom();
                    }
                    this.renderMessages(messageList);
                }
            },
            onFailed: function (error) {
                //获取失败
                console.log('获取历史消息失败, code:' + error.code + ',错误信息:' + error.content);
                wx.stopPullDownRefresh();
            }
        });
    },
    isOnline() {
        return new Promise((resolve, reject) => {
            this.data.csteam.isOnline({
                onSuccess: (result) => {
                    resolve(result);
                },
                onFailed: (error) => {
                    console.log('获取在线状态失败，error:', error)
                    reject(error);
                }
            })
        })
    },
    async acceptSession() {
        if (await this.isOnline()) {
            this.data.csteam.accept({
                id: this.data.customer.id,
                onSuccess: () => {
                    console.log('accept successfully.');
                    clearInterval(this.data.pendingTime.timer);
                },
                onFailed: (error) => {
                    console.log('accept failed', error);
                }
            });
        } else {
            wx.showToast({
                title: '您还不是一名该团队的在线客服，请点击左下角头像进行上线操作',
                duration: 3000,
                icon: 'none'
            });
        }
    },
    endSession() {
        this.data.csteam.end({
            id: this.data.customer.id,
            onSuccess: () => {
                console.log('end successfully.');
            },
            onFailed: (error) => {
                console.log('end failed', error);
            }
        })
    },
    showTransferForm() {
        this.data.csteam.agents({
            onSuccess: (result) => {
                let agents = result.content.filter((agent) => {
                    return agent.id !== this.data.currentAgent.id;
                });
                if (agents.length === 0) {
                    wx.showToast({
                        title: '暂无可转接的客服',
                        duration: 2000,
                        icon: 'none'
                    });
                } else {
                    this.setData({
                        transferForm: {
                            visible: true,
                            agents: agents
                        },
                        otherTypesMessagePanelVisible: false
                    })
                }
            },
            onFailed: (error) => {
                console.log('query online agents failed', error);
            }
        });
    },
    transfer(e) {
        let agent = e.currentTarget.dataset.agent;
        this.setData({
            ['transferForm.to']: agent
        })
        this.data.csteam.transfer({
            customerId: this.data.customer.id,
            agentId: this.data.transferForm.to.id,
            onSuccess: () => {
                this.hideTransferForm();
                console.log('transfer successfully.');
            },
            onFailed: (error) => {
                console.log('transfer failed', error);
            }
        })
    },
    hideTransferForm() {
        this.setData({
            ['transferForm.visible']: false
        })
    },


    sendTextMessage() {
        // 发送文本与表情
        if (this.data.text.trim() !== '') {
            this.data.csteam.createTextMessage({
                text: this.data.text,
                to: this.data.to,
                onSuccess: (message) => {
                    this.sendMessage(message);
                },
                onFailed: (err) => {
                    console.log("创建消息err:", err);
                }
            });
        }
        this.setData({
            text: ''
        });
    },
    sendImageMessage() {
        // 发送图片
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                res.tempFiles.forEach((file) => {
                    this.data.csteam.createImageMessage({
                        file: file,
                        to: this.data.to,
                        onProgress: (progress) => {
                            console.log(progress)
                        },
                        onSuccess: (message) => {
                            this.sendMessage(message);
                        },
                        onFailed: (e) => {
                            console.log('error :', e);
                        }
                    });
                })
            }
        });
    },
    sendVideoMessage() {
        // 发送视频
        wx.chooseMedia({
            count: 9,
            mediaType: ['video'],
            sourceType: ['album', 'camera'],
            maxDuration: 30,
            camera: 'back',
            success: (res) => {
                res.tempFiles.forEach((file) => {
                    this.data.csteam.createVideoMessage({
                        file: file,
                        to: this.data.to,
                        onProgress: (progress) => {
                            console.log(progress)
                        },
                        onSuccess: (message) => {
                            this.sendMessage(message);
                        },
                        onFailed: (e) => {
                            console.log('error :', e);
                        }
                    });
                })
            }
        })
    },
    showOrderMessageList() {
        let orders = restApi.getOrderList();
        this.setData({
            otherTypesMessagePanelVisible: false,
            orderList: {
                orders: orders,
                visible: true
            }
        })
    },
    hideOrderMessageList() {
        this.setData({
            ['orderList.visible']: false,
        })
    },
    sendOrderMessage(e) {
        const order = e.currentTarget.dataset.order;
        this.hideOrderMessageList();
        this.data.csteam.createCustomMessage({
            type: 'order',
            payload: order,
            to: this.data.to,
            onSuccess: (message) => {
                this.sendMessage(message);
            },
            onFailed: (err) => {
                console.log("创建消息err:", err);
            }
        });
    },
    sendMessage(message) {
        let self = this;
        let messages = this.data.history.messages;
        messages.push(message);
        this.renderMessages(messages);
        this.scrollToBottom();
        wx.goEasy.im.sendMessage({
            message: message,
            onSuccess: function (message) {
                console.log('发送成功.', message);
                self.renderMessages(self.data.history.messages);
            },
            onFailed: function (error) {
                if (error.code === 507) {
                    console.log('发送语音/图片/视频/文件失败，没有配置OSS存储，详情参考：https://www.goeasy.io/cn/docs/goeasy-2.x/im/message/media/send-media-message.html');
                } else {
                    console.log('发送失败:', error);
                }
                self.renderMessages(self.data.history.messages);
            }
        });
    },
    scrollToBottom() { // 滑动到最底部
        setTimeout(() => {
            wx.pageScrollTo({
                scrollTop: 200000,
                duration: 10
            });
        }, 600)
    },
    showCustomMessageForm() {
        let self = this;
        let customMessage = this.selectComponent('#customMessage');
        customMessage.setData({
            show: true,
            to: self.data.friend,
            type: wx.GoEasy.IM_SCENE.PRIVATE
        });
    },
    createCustomMessage(event) {
        let customerMessage = event.detail;
        this.sendMessage(customerMessage);
        // 发送自定义消息关闭更多菜单栏
        this.setData({
            otherTypesMessagePanelVisible: false,
            ['emoji.visible']: false,
        });
    },
    renderMessages(messages) {
        messages.forEach((message, index) => {
            if (index === 0) {
                // 当页面只有一条消息时，显示发送时间
                message.showTime = formatDate(message.timestamp);
            } else {
                // 当前消息与上条消息的发送时间进行比对，超过5分钟则显示当前消息的发送时间
                if (message.timestamp - messages[index - 1].timestamp > 5 * 60 * 1000) {
                    message.showTime = formatDate(message.timestamp);
                }
            }
            if (message.type === 'text') {
                // 渲染表情与文本消息
                let text = this.data.emoji.decoder.decode(message.payload.text);
                message.node = text;
            }
            if (message.type === 'image') {
                message.imageHeight = this.getImageHeight(message.payload.width,message.payload.height)+'rpx';
            }
        });
        this.setData({
            ['history.messages']: messages
        });
    },
    setContent(e) {
        // 监听输入的消息
        let text = e.detail.value;
        this.setData({
            text: text
        });
    },
    playVideo(e) {
        //播放视频
        this.selectComponent('#videoPlayer').play({
            url: e.currentTarget.dataset.url,
            duration: e.currentTarget.dataset.duration
        });
    },
    previewImage(event) {
        // 预览图片
        let imagesUrl = [event.currentTarget.dataset.src];
        wx.previewImage({
            urls: imagesUrl // 需要预览的图片http链接列表
        });
    },
    selectEmoji(e) {
        // 选择表情
        let emojiKey = e.currentTarget.dataset.emojikey;
        emojiKey = this.data.text + emojiKey;
        this.setData({
            text: emojiKey
        });
    },
    messageInputFocusin() {
        this.setData({
            otherTypesMessagePanelVisible: false,
            ['emoji.visible']: false
        });
    },
    showEmoji() {
        this.setData({
            ['emoji.visible']: true,
            otherTypesMessagePanelVisible: false,
        });
        // 关闭手机键盘
        wx.hideKeyboard().then(console.log).catch(console.log);
    },
    showMore() {
        this.setData({
            otherTypesMessagePanelVisible: !this.data.otherTypesMessagePanelVisible,
            ['emoji.visible']: false
        });
        // 关闭手机键盘
        wx.hideKeyboard().then(console.log).catch(console.log);
    },
})
