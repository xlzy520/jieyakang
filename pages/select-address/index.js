const WXAPI = require('../../wxapi/main')
Page({
  data: {
    addressList: []
  },

  selectTap(e) {
    const id = e.currentTarget.dataset.id;
    WXAPI.updateAddress({
      token: wx.getStorageSync('token'),
      id: id,
      isDefault: 'true'
    }).then(() => {
      wx.showToast({
        title: '设置默认地址成功'
      })
      this.initShippingAddress()
    })
  },
  addAddress() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  editAddress(e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad() {
  
  },
  onShow() {
    this.initShippingAddress();
  },
  initShippingAddress() {
    WXAPI.queryAddress(wx.getStorageSync('token')).then((res)=> {
      if (res.code === 0) {
        this.setData({
          addressList: res.data
        });
      } else if (res.code === 700) {
        this.setData({
          addressList: null
        });
      }
    })
  }
})
