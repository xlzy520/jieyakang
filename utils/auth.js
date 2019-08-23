const WXAPI = require('../wxapi/main')
module.exports = {
  login() {
    wx.login({
      success: res=> {
        WXAPI.login(res.code).then(res=> {
          wx.setStorageSync('token', res.data.appToken)
          if (res.data.isFirst) {
            this.goLoginPageTimeOut();
            return;
          }
          // 回到原来的地方放
          // app.navigateToLogin = false
          // wx.navigateBack();
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
  goLoginPageTimeOut() {
    setTimeout(()=> {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    }, 500)
  },
}
