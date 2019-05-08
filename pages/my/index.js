const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('../../wxapi/main')
Page({
	data: {
	  order: []
	  orderCount: []
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
      if (res.code == 0) {
        let tabClass = this.data.tabClass;
        for (let i = 0; i < res.data.length; i++) {
          if (i < 4) {
            tabClass[i + 1] = res.data[i]>0? 'red-dot': ''
          } else {
            tabClass[i] = res.data[i]>0? 'red-dot': ''
          }
        }
        this.setData({
          tabClass: tabClass,
        });
      }
    })
  }
})
