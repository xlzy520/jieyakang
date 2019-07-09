const WXAPI = require('../../wxapi/main')
Page({
  data: {
    header: false
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function () {
  
  },
})
