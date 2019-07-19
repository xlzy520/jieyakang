const WXAPI = require('../../wxapi/main')
Page({
  data: {
    tabList: ['进销记录', '当前库存'],
    currentTab: 0
  },
  onLoad: function () {
  
  },
  changeCurrentTab(e){
    this.setData({
      currentTab: e.detail
    })
  }
})
