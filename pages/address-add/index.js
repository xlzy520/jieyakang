const commonCityData = require('../../utils/city.js')
const WXAPI = require('../../wxapi/main')
//获取应用实例
var app = getApp()
Page({
  data: {
    tipText: '',
    isDefault: false
  },
  bindCancel: function () {
    wx.navigateBack({})
  },
  changeSwitch(){
    this.setData({
      isDefault: !this.data.isDefault
    })
  },
  checkPhone(phone) {
    return /^1[34578]\d{9}$/.test(phone)
  },
  bindSave(e) {
    const linkMan = e.detail.value.linkMan;
    const address = e.detail.value.address;
    const mobile = e.detail.value.mobile;
    const code = '415600';
    
    if (linkMan.length < 2 || linkMan.length > 20) {
      this.setData({
        tipText: '收货人姓名长度需要在2-20个字符之间'
      })
      return
    }
    if (!this.checkPhone(mobile)) {
      this.setData({
        tipText: '请填写正确的手机号码'
      })
      return
    }
    if (address.length < 5 || address.length > 120) {
      this.setData({
        tipText: '详细地址长度需要在5-120字符之间'
      })
      return
    }
    let apiResult
    if (this.data.id) {
      apiResult = WXAPI.updateAddress({
        token: wx.getStorageSync('token'), // todo 增加选择省市县，默认安乡县
        id: this.data.id,
        provinceId: 430000,
        cityId: 430700,
        districtId: 430721,
        linkMan: linkMan,
        address: address,
        mobile: mobile,
        code: code,
        isDefault: this.data.isDefault.toString()
      })
    } else {
      apiResult = WXAPI.addAddress({
        token: wx.getStorageSync('token'),
        provinceId: 430000,
        cityId: 430700,
        districtId: 430721,
        linkMan: linkMan,
        address: address,
        mobile: mobile,
        code: code,
        isDefault: this.data.isDefault.toString()
      })
    }
    apiResult.then((res) => {
      wx.showLoading({
        title: '正在保存...',
      })
      if (res.code !== 0) {
        // 登录错误
        wx.hideLoading();
        wx.showModal({
          title: '失败',
          content: res.msg,
          showCancel: false
        })
      } else {
        wx.hideLoading();
        wx.showModal({
          title: '成功',
          showCancel: false
        })
        wx.navigateBack({})
      }
    })
  },
  close() {
    this.setData({
      tipText: ''
    })
  },
  onLoad(e) {
    const id = e.id;
    if (id) {
      // 初始化原数据
      WXAPI.addressDetail(id, wx.getStorageSync('token')).then((res) => {
        if (res.code === 0) {
          this.setData({
            id: id,
            addressData: res.data,
          });
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
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: res=> {
        if (res.confirm) {
          WXAPI.deleteAddress(id, wx.getStorageSync('token')).then(()=> {
            wx.navigateBack({})
          })
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
})
