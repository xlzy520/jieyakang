// const WXAPI = require('wxapi/main')
App({
  navigateToLogin: false,
  onLaunch() {
    // 检测新版本
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success:(res)=> {
        const networkType = res.networkType
        if (networkType === 'none') {
          this.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange((res)=> {
      if (!res.isConnected) {
        this.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000
        })
      } else {
        this.globalData.isConnected = true
        wx.hideToast()
      }
    });
    let token = wx.getStorageSync('token');
    if (token === '') {
      this.navigateToLogin = true
      if (this.navigateToLogin === true) {
        this.goLoginPageTimeOut()
      }
    }
  },
  goLoginPageTimeOut() {
    setTimeout(()=> {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    }, 500)
  },
  globalData: {
    isConnected: true
  }
})
