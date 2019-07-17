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
      wx.navigateBack({})
    })
  },
  addAddress() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  editAddress(e) {
    const {id,type}=e.currentTarget.dataset
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + id+'&addressType='+type
    })
  },
  onLoad(e) {

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
