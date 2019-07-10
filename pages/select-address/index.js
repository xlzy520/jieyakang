const WXAPI = require('../../wxapi/main')
Page({
  data: {
    addressList: []
  },

  selectTap(e) {
    const { id } = e.currentTarget.dataset;
    WXAPI.updateAddress({
      id: id,
      isDefault: 'true'
    }).then(() => {
      wx.showToast({
        title: '设置成功',
        duration: 1000
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
    WXAPI.queryAddress().then((res)=> {
      this.setData({
        addressList: res.data.list
      });
    })
  }
})
