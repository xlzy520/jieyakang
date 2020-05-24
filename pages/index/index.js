const WXAPI = require('../../wxapi/main.js')
const CONFIG = require('../../config.js')
Page({
  data: {
    partners: [],
    shoufeiData: {
      payProcessContent: '暂无收费流程',
      payNotifyContent: '暂无收费公告'
    }
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
    const schoolId = wx.getStorageSync('schoolId')
    console.log(token);
    if (token){
      this.getPartner()
      this.getGoodsList()
      this.getShoufeiData(schoolId)
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
      this.getShoufeiData(res.data.schoolId)
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
  getShoufeiData(schoolId){
    WXAPI.getShoufeiData({
      pageIndex: 1,
      pageSize: 20,
      schoolId,
      show: true
    }).then((res) =>{
      if (res.data.schoolId === schoolId) {
        this.setData({
          shoufeiData: res.data
        })
      }
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
