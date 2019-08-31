const WXAPI = require('../../wxapi/main')

Page({
  data: {
    orderId: '',
    type: 0,
  },
  onLoad(e){
    if (e&&e.orderId) {
      this.setData({
        orderId: e.orderId,
        type: Number(e.type)
      })
    }
  },
  viewOrder(){
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + this.data.orderId
    })
  },
  back2Index(){
    wx.reLaunch({
      url: "/pages/index/index"
    })
  }
})
