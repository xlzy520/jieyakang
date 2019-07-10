const WXAPI = require('../../wxapi/main')
//获取应用实例
var app = getApp()
Page({
  data: {
    addressData: {
      addressType: 'restaurant',//school, restaurant
      consignee: '',
      mobile: '',
      address: '安乡县',
      isDefault: false
    },
    tipText: '',
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
    const code = '000000';
    
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
    if (!this.data.pObject || !this.data.cObject){
      this.setData({
        tipText: '请选择地区'
      })
      return
    }
    if (address === ""){
      this.setData({
        tipText: '请填写详细地址'
      })
      return
    }
    let apiResult
    if (this.data.id) {
      apiResult = WXAPI.updateAddress({
        token: wx.getStorageSync('token'),
        id: that.data.id,
        provinceId: this.data.pObject.id,
        cityId: this.data.cObject.id,
        districtId: this.data.dObject ? this.data.dObject.id : '',
        linkMan: linkMan,
        address: address,
        mobile: mobile,
        code: code,
        isDefault: this.data.isDefault.toString()
      })
    } else {
      apiResult = WXAPI.addAddress({
        token: wx.getStorageSync('token'),
        provinceId: this.data.pObject.id,
        cityId: this.data.cObject.id,
        districtId: this.data.dObject ? this.data.dObject.id : '',
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
        wx.showToast({
          title: '成功',
          showCancel: false
        })
        wx.navigateBack({})
      }
    })
  },
  close(){
    this.setData({
      tipText: ''
    })
  },
  onLoad(e) {
    this.initRegionPicker(e.id) // 初始化省市区选择器
    if (e.id) { // 修改初始化数据库数据
      wx.setNavigationBarTitle({
        title: '编辑收货地址'
      })
      WXAPI.addressDetail(e.id, wx.getStorageSync('token')).then((res)=> {
        if (res.code === 0) {
          this.setData({
            id: e.id,
            addressData: res.data,
            showRegionStr: res.data.provinceStr + res.data.cityStr + res.data.areaStr
          });
          this.initRegionDB(res.data.provinceStr, res.data.cityStr, res.data.areaStr)
        } else {
          wx.showModal({
            title: '提示',
            content: '无法获取快递地址数据',
            showCancel: false
          })
        }
      })
    }
  },
  deleteAddress: function (e) {
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
