const WXAPI = require('../../wxapi/main')
const regeneratorRuntime = require('../../utils/runtime')
//获取应用实例
var app = getApp()
Page({
  data: {
    pickerRegionRange: [],
    pickerSelect:[0, 0, 0],
    showRegionStr: '湖南省',
    tipText: '',
    isDefault: false
  },
  initRegionPicker (id) {
    WXAPI.province().then(res => {
      if (res.code === 0) {
        let _pickerRegionRange = []
        _pickerRegionRange.push(res.data)
        _pickerRegionRange.push([{ name: '请选择' }])
        _pickerRegionRange.push([{ name: '请选择' }])
        this.data.pickerRegionRange = _pickerRegionRange
        this.bindcolumnchange({ detail: { column: 0, value: 2 } })
        if (!id) {
          this.initRegionDB('湖南省', '常德市', '安乡县')
        }
      }
    })
  },
  async initRegionDB (pname, cname, dname) {
    this.data.showRegionStr = pname + cname + dname
    let pObject = undefined
    let cObject = undefined
    let dObject = undefined
    if (pname) {
      const index = this.data.pickerRegionRange[0].findIndex(ele=>{
        return ele.name == pname
      })
      console.log('pindex', index)
      if (index >= 0) {
        this.data.pickerSelect[0] = index
        pObject = this.data.pickerRegionRange[0][index]
      }
    }
    if (!pObject) {
      return
    }
    const _cRes = await WXAPI.nextRegion(pObject.id)
    if (_cRes.code === 0) {
      this.data.pickerRegionRange[1] = _cRes.data
      if (cname) {
        const index = this.data.pickerRegionRange[1].findIndex(ele => {
          return ele.name == cname
        })
        if (index >= 0) {
          this.data.pickerSelect[1] = index
          cObject = this.data.pickerRegionRange[1][index]
        }
      }
    }
    if (!cObject) {
      return
    }
    const _dRes = await WXAPI.nextRegion(cObject.id)
    if (_dRes.code === 0) {
      this.data.pickerRegionRange[2] = _dRes.data
      if (dname) {
        const index = this.data.pickerRegionRange[2].findIndex(ele => {
          return ele.name == dname
        })
        if (index >= 0) {
          this.data.pickerSelect[2] = index
          dObject = this.data.pickerRegionRange[2][index]
        }
      }
    }
    this.setData({
      pickerRegionRange: this.data.pickerRegionRange,
      pickerSelect: this.data.pickerSelect,
      showRegionStr: this.data.showRegionStr,
      pObject: pObject,
      cObject: cObject,
      dObject: dObject
    })
  },
  bindchange(e) {
    console.log(e)
    const pObject = this.data.pickerRegionRange[0][e.detail.value[0]]
    const cObject = this.data.pickerRegionRange[1][e.detail.value[1]]
    const dObject = this.data.pickerRegionRange[2][e.detail.value[2]]
    const showRegionStr = pObject.name + cObject.name + dObject.name
    console.log(showRegionStr);
    this.setData({
      pObject: pObject,
      cObject: cObject,
      dObject: dObject,
      showRegionStr: showRegionStr
    })
  },
  bindcolumnchange: function(e) {
    const column = e.detail.column
    const index = e.detail.value
    console.log('eeee:', e)
    const regionObject = this.data.pickerRegionRange[column][index]
    console.log('bindcolumnchange', regionObject)
    if (column === 2) {
      this.setData({
        pickerRegionRange: this.data.pickerRegionRange
      })
      return
    }
    if (column === 1) {
      this.data.pickerRegionRange[2] = [{ name: '请选择' }]
    }
    if (column === 0) {
      this.data.pickerRegionRange[1] = [{ name: '请选择' }]
      this.data.pickerRegionRange[2] = [{ name: '请选择' }]
    }
    // // 后面的数组全部清空
    // this.data.pickerRegionRange.splice(column+1)
    // 追加后面的一级数组
    WXAPI.nextRegion(regionObject.id).then(res => {
      if (res.code === 0) {
        this.data.pickerRegionRange[column + 1] = res.data
      }
      this.bindcolumnchange({ detail: { column: column + 1, value: 2 } })
    })
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
    const code = e.detail.value.code;
    
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
    if (this.data.selProvince === "请选择"){
      this.setData({
        tipText: '请选择地区'
      })
      return
    }
    if (this.data.selCity === "请选择"){
      this.setData({
        tipText: '请选择地区'
      })
      return
    }
    if (address === ""){
      this.setData({
        tipText: '请选择地区'
      })
      return
    }
    if (code === ""){
      this.setData({
        tipText: '请选择邮编'
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
        wx.showModal({
          title: '成功',
          showCancel: false
        })
        wx.navigateBack({})
      }
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
