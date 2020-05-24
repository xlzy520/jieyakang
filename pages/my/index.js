const app = getApp()
const WXAPI = require('../../wxapi/main')
Page({
	data: {
    userType: 0,
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
    badge: [0,0,0,0],
    hasProduceAuth: false
  },
	onLoad() {
	
	},
  onShow() {
    const hasProduceAuth = wx.getStorageSync('hasProduceAuth')
    this.setData({
      hasProduceAuth
    })
    // this.getProduceList()
    this.getOrderStatistics()
    this.getUserTypeByDefaultAddress();
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
  getProduceList() {
    WXAPI.getProduceList({
      pageIndex: 1,
      pageSize: 20,
      hasProduceAuth: true
    }).then(res => {
      console.log(res);
      wx.getUserInfo({
        success: (userInfo_res) => {
          console.log(userInfo_res);
          if (res.list.find(value => value.openId === userInfo_res.openId)) {
            this.setData({
              hasProduceAuth: true
            })
          }
        }
      })
    })
  },
  goRecord(e){
    wx.navigateTo({
      url: "/pages/jinxiaocun/index?type=" + e.currentTarget.dataset.type
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
