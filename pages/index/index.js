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
  goLoginPageTimeOut() {
    setTimeout(() => {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    }, 500)
  },
  login() {
    wx.login({
      success: res=> {
        WXAPI.login(res.code).then(res=> {
          console.log(9999);
          wx.setStorageSync('token', res.data.appToken)
          if (res.data.isFirst) {
            this.goLoginPageTimeOut();
          } else {
            this.getUserInfo()
            this.getPartner()
          }
        }).catch(err=>{
          wx.showModal({
            title: '提示',
            content: err.msg||'无法登录，请重试',
            showCancel: false
          })
        }).finally(()=>{
          wx.hideLoading();
        })
      }
    })
  },
  onShow(){
    wx.showLoading({
      title: '努力加载中...'
    })
    const token = wx.getStorageSync('token')
    console.log(token);
    if (token){
      this.getPartner()
      this.getGoodsList()
      wx.hideLoading()
    } else {
      this.login()
    }
  },
  onLoad() {
  
  },
  getGoodsList(){
    return this.selectComponent("#goods-list").getGoodsList()
  },
  getUserInfo(){
    WXAPI.getUserInfo().then(res=>{
      wx.setStorageSync('schoolId', res.data.schoolId)
      wx.setStorageSync('hasProduceAuth', res.data.hasProduceAuth)
      this.getGoodsList()
    })
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
