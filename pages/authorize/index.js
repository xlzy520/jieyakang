const WXAPI = require('../../wxapi/main')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  bindGetUserInfo(e) {
    if (!e.detail.userInfo) {
      return;
    }
    if (app.globalData.isConnected) {
      wx.setStorageSync('userInfo', e.detail.userInfo)
      this.login();
    } else {
      wx.showToast({
        title: '当前无网络',
        icon: 'none',
      })
    }
  },
  login() {
    wx.login({
      success: res=> {
        WXAPI.login(res.code).then(res=> {
          wx.setStorageSync('token', res.data.appToken)
          if (true) {
          // if (res.data.isFirst) {
            // 去注册
            this.registerUser();
            return;
          }
          // 回到原来的地方放
          app.navigateToLogin = false
          wx.navigateBack();
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
  registerUser() {
    wx.login({
      success: (login_res) =>{
        let code = login_res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: (userInfo_res)=> {
            const {iv,encryptedData } = userInfo_res
            // 下面开始调用注册接口
            WXAPI.register( {
              code: code,
              encryptedData: encryptedData,
              iv: iv,
            }).then(()=> {
              wx.hideLoading();
            })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
