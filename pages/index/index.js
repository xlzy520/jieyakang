const WXAPI = require('../../wxapi/main.js')
const CONFIG = require('../../config.js')
Page({
  data: {
    partners: []
  },
  toDetailsTap(e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  toBannerDetail(){
    wx.navigateTo({
      url: "/pages/banner-detail/index"
    })
  },
  onShow() {
    wx.showLoading({
      title: '努力加载中...'
    })
    const token = wx.getStorageSync('token')
    if (token){
      this.getPartner()
      this.getGoodsList()
      wx.hideLoading()
    }
  },
  getGoodsList(){
    return this.selectComponent("#goods-list").getGoodsList()
  },
  getPartner(){
    WXAPI.getPartner({
      pageIndex: 1,
      pageSize: 20
    }).then((res) =>{
      this.setData({
        partners: res.data.list
      })
    })
  },
  onShareAppMessage () {
    return {
      // title: wx.getStorageSync('mallName') + '——' + CONFIG.shareProfile,
      title: '洁雅康餐具' + '——' + CONFIG.shareProfile,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading()
    this.getGoodsList().then(()=>{
      wx.stopPullDownRefresh()
      wx.hideLoading()
      wx.hideNavigationBarLoading()
    })
  }
})
