const WXAPI = require('../../wxapi/main')
//获取应用实例
var app = getApp()
Page({
  data: {
    addressData: {
      addressType: '1',//school, restaurant
      consignee: '',
      mobile: '',
      address: '',
      isDefault: true
    },
    schoolList: [],
    tipText: '',
    identityHidden: false,
    dialogType: '',
    schoolIndex: 0,
    classNumber: ''
  },
  selectIdentity(e){
    this.setData({
      identityHidden: true,
      'addressData.addressType': e.currentTarget.dataset.type
    })
  },
  getSchoolList(){
    WXAPI.getSchoolList().then((res) => {
      this.setData({
        schoolList: res.data.list
      })
    })
  },
  reSelectIdentity(){
    this.setData({
      identityHidden: false
    })
  },
  changeDefaultStatus() {
    this.setData({
      'addressData.isDefault': !this.data.addressData.isDefault
    })
  },
  bindPickerChange(e) {
    this.setData({
      schoolIndex: e.detail.value
    })
  },
  checkPhone(phone) {
    return /^1[34578]\d{9}$/.test(phone)
  },
  setTipText(text){
    this.setData({
      tipText: text
    })
  },
  bindSave(e) {
    let consignee,classNumber;
    let address = e.detail.value.address;
    if (this.data.addressData.addressType === 'school') {
      classNumber = e.detail.value.classNumber;
      if (classNumber.trim().length < 2 || classNumber.trim().length > 15) {
        this.setData({
          tipText: '班级号长度需要在2-16个字符之间'
        })
        return
      }
      address = this.data.schoolList[this.data.schoolIndex].schoolName + '  '+classNumber
    } else {
      consignee = e.detail.value.consignee;
      if (consignee.trim().length < 2 || consignee.trim().length > 25) {
        this.setData({
          tipText: '收货人姓名长度需要在2-25个字符之间'
        })
        return
      }
    }
    const mobile = e.detail.value.mobile;
    if (!this.checkPhone(mobile)) {
      this.setTipText('请填写正确的手机号码')
      return
    }
    if (address.trim() === ""){
      this.setTipText('请填写详细地址')
      return
    }
    let apiResult
    let params = {
      token: wx.getStorageSync('token'),
      address: address,
      mobile: mobile,
      isDefault: this.data.addressData.isDefault,
      consignee: consignee||'',
    }
    if (this.data.id) {
      apiResult = WXAPI.updateAddress({
        id: this.data.id,
        ...params
      })
    } else {
      apiResult = WXAPI.addAddress(params)
    }
    wx.showLoading({
      title: '正在保存...',
    })
    apiResult.then((res) => {
      wx.hideLoading();
      wx.showToast({
        title: '请求成功',
        showCancel: false
      })
      wx.navigateBack({})
    }).catch(err=>{
      wx.hideLoading();
      wx.showModal({
        title: '失败',
        content: err.msg,
        showCancel: false
      })
    })
  },
  close(){
    this.setData({
      tipText: '',
      dialogType: ''
    })
  },
  onLoad(e) {
    if (e.addressType){
      this.setData({
        'addressData.addressType': e.addressType,
        identityHidden: true
      })
    }
    this.getSchoolList()
    if (e.id) { // 修改初始化数据库数据
      wx.setNavigationOBarTitle({
        title: '编辑收货地址'
      })
      WXAPI.addressDetail(e.id).then((res)=> {
        this.setData({
          id: e.id,
          addressData: res.data,
        });
      }).catch(err=>{
        this.setTipText('无法获取快递地址数据')
      })
    }
  },
  deleteAddress() {
    this.setData({
      tipText: '确定要删除该收货地址吗？',
      dialogType: 'delete'
    })
  },
  confirmDelete(e){
    const id = e.currentTarget.dataset.id;
    WXAPI.deleteAddress(id).then(()=> {
      wx.navigateBack({})
    })
  }
})
