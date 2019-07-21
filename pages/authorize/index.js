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
          if (res.code === 10000) {
            // 去注册
            this.registerUser();
            return;
          }
          wx.setStorageSync('token', res.data)
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
    let that = this;
    wx.login({
      success: function(res) {
        let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: function(res) {
            let iv = res.iv;
            let encryptedData = res.encryptedData;
            // 下面开始调用注册接口
            WXAPI.register( {
              code: code,
              encryptedData: encryptedData,
              iv: iv,
            }).then(function(res) {
              wx.hideLoading();
              that.login();
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
