const WXAPI = require('../../wxapi/main')
//获取应用实例
var app = getApp()
Page({
  data: {
    addressData: {
      addressType: 1,//school, restaurant
      consignee: '',
      mobile: '',
      address: '',
      schoolId: '',
      isDefault: true
    },
    schoolList: [],
    tipText: '',
    dialogType: '',
    schoolName: '',
    classNumber: '',
    referer: ''
  },
  selectIdentity(id){
    if (id === '-9999') {
      this.setData({
        'addressData.addressType': 1,
      })
    } else {
      const school = this.data.schoolList.find(f=> f.schoolId == id)
      this.setData({
        'addressData.addressType': 0,
        'addressData.schoolId': id,
        'addressData.schoolName': school.schoolName,
      })
    }
  },
  getSchoolList(){
    return WXAPI.getSchoolList({
      pageIndex: 1,
      pageSize: 20
    }).then((res) => {
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
    console.log(e);
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
    wx.showLoading({
      title: '正在保存...',
    })
    let schoolId;
    let consignee = e.detail.value.consignee;
    let address = e.detail.value.address;
    if (consignee.trim().length < 2 || consignee.trim().length > 25) {
      if (this.data.addressData.addressType) {
        this.setData({
          tipText: '收货人姓名长度需要在2-25个字符之间'
        })
      } else {
        this.setData({
          tipText: '班级长度需要在2-25个字符之间'
        })
      }
      wx.hideLoading();
      return
    }
    const mobile = e.detail.value.mobile;
    if (!this.checkPhone(mobile)) {
      this.setTipText('请填写正确的手机号码')
      wx.hideLoading();
      return
    }
    let apiResult
    let params = {
      mobile: mobile,
      isDefault: this.data.addressData.isDefault,
      consignee: consignee,
      schoolId: this.data.addressData.schoolId,
    }
    if (!this.data.addressData.addressType) { //学校
      // schoolId = this.data.schoolList[this.data.schoolIndex].schoolId
      // params = Object.assign(params,{
      //   schoolId: schoolId
      // })
    } else {
      if (address.trim() === ""){
        this.setTipText('请填写详细地址')
        return
      }
      params = Object.assign(params,{
        address: address
      })
    }
    if (this.data.id) {
      apiResult = WXAPI.updateAddress({
        addressId: this.data.id,
        ...params
      })
    } else {
      apiResult = WXAPI.addAddress(params)
    }
    apiResult.then((res) => {
      wx.hideLoading();
      wx.showToast({
        title: '请求成功',
        showCancel: false
      })
      if (this.data.referer === 'qr') {
        wx.switchTab({
          url: "/pages/index/index"
        })
      } else {
        wx.navigateBack({})
      }
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
    if (e.schoolId) {
      wx.setStorageSync('scanSchoolId', e.schoolId)
      this.getSchoolList().then(()=>{
        this.selectIdentity(e.schoolId)
        this.setData({
          referer: 'qr'
        })
      })
    } else if (e.addressType&&e.id){
      wx.setNavigationBarTitle({
        title: '编辑收货地址'
      })
      WXAPI.addressDetail({
        addressId: e.id
      }).then((res)=> {
        this.setData({
          addressData: res.data,
        });
      }).catch(err=>{
        this.setTipText('无法获取快递地址数据')
        setTimeout(function(){
          wx.navigateBack()
        }, 1000)
      })
      this.setData({
        'addressData.addressType': e.addressType,
        identityHidden: true,
        id: e.id
      })
    } else {
      wx.showToast({
        title: '请联系管理员扫描二维码',
        icon: 'none'
      })
      wx.navigateBack({})
    }
  },
  deleteAddress() {
    this.setData({
      tipText: '确定要删除该收货地址吗？删除之后需要扫描二维码才可以添加地址',
      dialogType: 'delete'
    })
  },
  confirmDelete(e){
    const id = e.currentTarget.dataset.id;
    WXAPI.deleteAddress({
      addressId: id
    }).then(()=> {
      wx.showToast({
        title: '删除地址成功',
        icon: 'success'
      })
      wx.navigateBack({})
    })
  }
})
