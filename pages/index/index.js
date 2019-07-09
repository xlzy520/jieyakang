const WXAPI = require('../../wxapi/main.js')
const CONFIG = require('../../config.js')
Page({
  data: {
    goods: [],
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
  onLoad() {
    this.getGoodsList();
    WXAPI.getPartner({
      type: 'index',
      pageIndex: 1,
      pageSize: 20
    }).then((res) =>{
      this.setData({
        partners: res.data.list
      })
    })
  },
  getGoodsList () {
    wx.showLoading({
      "mask": true
    })
    WXAPI.goods({
      pageIndex: 1,
      pageSize: 20
    }).then((res)=> {
      this.setData({
        goods: res.data.list,
      });
    }).finally(()=>{
      wx.hideLoading()
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
    this.getGoodsList()
    wx.stopPullDownRefresh()
    wx.hideLoading()
    wx.hideNavigationBarLoading()
  }
})
