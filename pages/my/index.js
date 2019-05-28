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
      {type: 0, label: '进货记录', img: 'order'},
      {type: 1, label: '回收记录', img: 'pay'},
      {type: 2, label: '库存记录', img: 'processed'},
    ],
    badge: [0,0,0,0]
  },
	onLoad() {

	},
  onShow() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      app.goLoginPageTimeOut()
    } else {
      that.setData({
        userInfo: userInfo,
        version: CONFIG.version
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
    WXAPI.orderStatistics(wx.getStorageSync('token')).then((res)=> {
      const { count_id_no_pay, count_id_no_transfer,count_id_no_confirm } = res.data
      if (res.code == 0) {
        let badge = [0, count_id_no_pay, count_id_no_transfer, count_id_no_confirm]
        this.setData({
          badge: badge
      })
      }
    })
  }
})
