const WXAPI = require('../../wxapi/main')
Page({
  data: {
    addressList: []
  },

  selectTap(e) {
    const { id } = e.currentTarget.dataset;
    WXAPI.updateAddress({
      addressId: id,
      isDefault: 'true'
    }).then(() => {
      wx.showToast({
        title: '更新默认地址成功',
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
    wx.showLoading({
      title: '正在获取地址列表...'
    })
    WXAPI.getAddressList({
      pageIndex: 1,
      pageSize: 20
    }).then((res)=> {
      this.setData({
        addressList: res.data.list
      });
    }).finally(()=>{
      wx.hideLoading()
    })
  }
})
