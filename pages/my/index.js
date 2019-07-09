const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('../../wxapi/main')
Page({
	data: {
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
    this.getUserApiInfo();
    this.getUserAmount();
    this.getOrderStatistics()
  },
  getUserApiInfo: function () {
    var that = this;
    WXAPI.userDetail(wx.getStorageSync('token')).then(function (res) {
      if (res.code == 0) {
        let _data = {}
        _data.apiUserInfoMap = res.data
        if (res.data.base.mobile) {
          _data.userMobile = res.data.base.mobile
        }
        that.setData(_data);
      }
    })
  },
  getUserAmount: function () {
    var that = this;
    WXAPI.userAmount(wx.getStorageSync('token')).then(function (res) {
      if (res.code == 0) {
        that.setData({
          balance: res.data.balance.toFixed(2),
          freeze: res.data.freeze.toFixed(2),
          score: res.data.score
        });
      }
    })
  },
  goOrder: function (e) {
    wx.navigateTo({
      url: "/pages/order-my/index?type=" + e.currentTarget.dataset.type
    })
  },
  getOrderStatistics() {
    WXAPI.orderStatistics().then((res)=> {
      const { count_id_no_pay, count_id_no_transfer,count_id_no_confirm } = res.data
      let badge = [0, count_id_no_pay, count_id_no_transfer, count_id_no_confirm]
      // todo 测试如果WXAPI的success是不是请求成功就算
      this.setData({
        badge: badge
      })
    })
  }
})
