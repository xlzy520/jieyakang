const WXAPI = require('../../wxapi/main')

Page({
  data: {
    orderId: ''
  },
  onLoad(e){
    if (e&&e.orderId) {
      this.setData({
        orderId: e.orderId
      })
    }
  },
  viewOrder(){
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + this.data.orderId
    })
  },
  back2Index(){
    wx.navigateTo({
      url: "/pages/index/index"
    })
  }
})
