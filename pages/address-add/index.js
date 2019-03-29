const commonCityData = require('../../utils/city.js')
const WXAPI = require('../../wxapi/main')
//获取应用实例
var app = getApp()
Page({
  data: {
  
  },
  bindCancel:function () {
    wx.navigateBack({})
  },
  bindSave(e) {
    const linkMan = e.detail.value.linkMan;
    const address = e.detail.value.address;
    const mobile = e.detail.value.mobile;
    const code = e.detail.value.code;

    if (linkMan === ""){
      wx.showModal({
        title: '提示',
        content: '请填写收货人姓名',
        showCancel:false
      })
      return
    }
    if (mobile === ""){
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel:false
      })
      return
    }
    if (address === ""){
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel:false
      })
      return
    }
    let apiResult
    if (this.data.id) {
      apiResult = WXAPI.updateAddress({
        token: wx.getStorageSync('token'),
        id: this.data.id,
        linkMan: linkMan,
        address: address,
        mobile: mobile,
        code: code,
        isDefault: 'true'
      })
    } else {
      apiResult = WXAPI.addAddress({
        token: wx.getStorageSync('token'),
        linkMan: linkMan,
        address: address,
        mobile: mobile,
        code: code,
        isDefault: 'true'
      })
    }
    apiResult.then( (res)=> {
      if (res.code !== 0) {
        // 登录错误
        wx.hideLoading();
        wx.showModal({
          title: '失败',
          content: res.msg,
          showCancel: false
        })
        return;
      }
      // 跳转到结算页面
      wx.navigateBack({})
    })
  },
  onLoad(e) {
    const id = e.id;
    if (id) {
      // 初始化原数据
      WXAPI.addressDetail(id, wx.getStorageSync('token')).then( (res)=> {
        if (res.code === 0) {
          this.setData({
            id: id,
            addressData: res.data,
          });
          return;
        } else {
          wx.showModal({
            title: '提示',
            content: '无法获取用户地址数据',
            showCancel: false
          })
        }
      })
    }
  },
  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          WXAPI.deleteAddress(id, wx.getStorageSync('token')).then(function () {
            wx.navigateBack({})
          })
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
})
