const app = getApp()
const WXAPI = require('../../wxapi/main')
Page({
	data: {
    userType: '0',
	  orderNav: [
      {type: 0, label: '我的订单', img: 'order'},
      {type: 1, label: '待付款', img: 'pay'},
      {type: 2, label: '待发货', img: 'processed'},
      {type: 3, label: '待收货', img: 'dispatched'},
    ],
    recordNav: [
      {type: 0, label: '进销记录', img: 'jinxiaocun'},
      {type: 1, label: '当前留存', img: 'liucun'},
    ],
    badge: [0,0,0,0]
  },
	onLoad() {
    this.getUserTypeByDefaultAddress();
    this.getOrderStatistics()
	},
  onShow() {
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      app.goLoginPageTimeOut()
    } else {
      this.setData({
        userInfo: userInfo,
      })
    }
  },
  getUserTypeByDefaultAddress() {
    WXAPI.defaultAddress().then((res)=> {
      this.setData({
        userType: res.data.addressType
      })
    })
  },
  goOrder(e) {
    wx.navigateTo({
      url: "/pages/order-my/index?type=" + e.currentTarget.dataset.type
    })
  },
  getOrderStatistics() {
    WXAPI.orderStatistics().then((res)=> {
      const { unpaidCount, unshippedCount,unreceivedCount } = res.data
      let badge = [0, unpaidCount, unshippedCount, unreceivedCount]
      // todo 测试如果WXAPI的success是不是请求成功就算
      this.setData({
        badge: badge
      })
    })
  }
})
