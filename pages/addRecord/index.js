const WXAPI = require('../../wxapi/main')
Page({
  data: {
    active: '3',
    cars: [],
    show: false,
    showType: '',
    car: {},
    userType: '0',
    mobile: '',
    userList: [],
    school: {},
    schoolList: [],
    address: '达到哈师大黄蜡石大理石块几点啦空间的拉开十九大',
    tablewareList: [],
    useType: {},
    specs: {},
    specsList: [],
    tableware: [],
    allTablewareList: [],
    firstColName: ['', '回收', '', '生产', '发货'],
    tablewareData: {
      lossyDetail: [],
      recoveryDetail: []
    },
    initForm: {
      userId: '',
      specsId: '',
      schoolId: '',
      useTypeId: '',
      boxNum: 0,
      vehicle: ''
    },
    defaultAddress: {}
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad() {
    this.getCars();
    this.getSchoolList();
    this.getTablewareList();
  },
  openPopup(e){
    const type = e.target.dataset.popup
    this.setData({
      show: true,
      showType: type
    })
  },
  onConfirm(event){
    const type = event.target.dataset.type
    const { picker, value, index } = event.detail;
    switch (type) {
      case 'useType':
        this.setData({
          'initForm.useTypeId': value.useTypeId
        })
        this.setSpecsList(value)
        break;
      case 'specs':
        this.setData({
          'initForm.specsId': value.specsId
        })
        this.getSpecsDetail(value.specsId)
        break;
      case 'car':
        this.setData({
          'initForm.vehicle': value.carId
        })
        break;
      case 'school':
        this.setData({
          'initForm.schoolId': value.schoolId
        })
        break;
      default:
        break;
    }
    this.setData({
      [type]: value,
      show: false
    })
  },
  inputTablewareData(event){
    const {value} = event.detail
    const { type, index } = event.target.dataset;
    const tablewareData = JSON.parse(JSON.stringify(this.data.tablewareData))
    tablewareData[type][index] = value
    this.setData({
      tablewareData
    })
  },
  onSubmit(){
    if (this.data.active !== '3') {
      if (!this.data.mobile) {
        wx.showToast({
          title: '请输入用户手机号码',
          icon: 'none'
        })
        return
      } else if (this.data.mobile.length !== 11) {
        wx.showToast({
          title: '请输入正确的手机号码格式',
          icon: 'none'
        })
        return
      }
    }
    if (this.data.userType === '1' && !this.data.initForm.schoolId) {
      wx.showToast({
        title: '请选择学校',
        icon: 'none'
      })
      return
    }
    if (!this.data.initForm.useTypeId) {
      wx.showToast({
        title: '请选择餐具类型',
        icon: 'none'
      })
      return
    }
    const tablewareData = JSON.parse(JSON.stringify(this.data.tablewareData))
    if (this.data.active === '3') {
      this.data.tableware.forEach((v,index)=>{
        for (const item in this.data.tablewareData) {
          tablewareData[item][index] = {
            tablewareId: v.tablewareId,//餐具Id
            quantity:  this.data.tablewareData[item][index]||0//数量
          }
        }
      })
    } else {
      this.data.tableware.forEach((v,index)=>{
        for (const item in this.data.tablewareData) {
          tablewareData[item][index] = {
            tablewareId: v.tablewareId,//餐具Id
            quantity:  this.data.tablewareData[item][index]||0//数量
          }
        }
      })
    }
    
    const param = {
      ...this.data.initForm,
      ...tablewareData,
      inventoryType: this.data.active
    }
    WXAPI.addInventory(param).then(res => {
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      })
      wx.navigateTo({
        url: "/pages/staff-action/index"
      })
    })
  },
  onClose(){
    this.setData({
      show: false
    })
  },
  onCancel(){
    this.setData({
      carShow: false
    })
  },
  onBoxNumChange(event){
    const value = event.detail
    this.setData({
      'initForm.boxNum': value
    })
  },
  
  onMobileChange(event){
    const value = event.detail
    this.setData({
      mobile: value
    })
    if (value.length === 11) {
      WXAPI.defaultAddressByMobile({
        mobile: value
      }).then(res=>{
        this.setData({
          defaultAddress: res.data,
          'initForm.userId': res.data.operatorId,
        })
      })
    }
  },
  
  onTabChange(event){
    const { picker, name, index } = event.detail;
    console.log(event);
    if (name === '3') {
      this.setData({
        tablewareList: this.data.allTablewareList
      })
    } else {
      let arr = ['餐馆餐具','宴席餐具']
      let allTableware = this.data.allTablewareList.filter(v=>arr.includes(v.useType))
      this.setData({
        tablewareList: allTableware
      })
    }
    this.setData({
      active: name
    })
  },
  onUserChange(event){
    console.log(event);
    this.setData({
      username: event.detail
    })
    this.getUsers()
  },
  setSpecsList(val){
    if (val.useType === '幼儿园餐具') {
      this.setData({
        specsList: val.specsList.map(v => {
          v.text = v.specsName + ':' + v.specsStr
          return v
        })
      })
    } else {
      const specsId = val.specsList.find(v=>v.specsStr.includes('*1')).specsId
      this.setData({
        'initForm.specsId': specsId
      })
      this.getSpecsDetail(specsId)
    }
  },
  getSpecsDetail(specsId){
    WXAPI.getTablewareDetail({
      specsId
    }).then(res => {
      const arr = new Array(res.data.length).fill('')
      this.setData({
        tableware: res.data,
        tablewareData: {
          lossyDetail: arr,
          recoveryDetail: arr
        }
      })
    })
  },
  
  
  getCars(){
    WXAPI.getCars().then(res=>{
      const newCars = res.data.map(v=> {
        v.text = v.carNum+ '——' + v.mark
        return v
      })
      this.setData({
        cars: newCars,
        car: newCars[0]
      })
      
    })
  },
  getUsers(){
    WXAPI.getWXUsers().then(res=>{
      this.setData({
        userList: res.data.map(v=> {
          v.text = v.carNum
          return v
        })
      })
      
    })
  },
  getSchoolList(){
    return WXAPI.getSchoolList({
      pageIndex: 1,
      pageSize: 200
    }).then((res) => {
      this.setData({
        schoolList: res.data.list.map(v=> {
          v.text = v.schoolName
          return v
        })
      })
    })
  },
  getTablewareList(){
    WXAPI.getTablewareList().then(res => {
      const allTablewareList = res.data.map(v=> {
        v.text = v.useType
        return v
      })
      this.setData({
        tablewareList: allTablewareList,
        allTablewareList
      })
    })
  },
  onUserTypeChange(event){
    console.log(event);
    let allTableware = this.data.allTablewareList
    let arr = ['餐馆餐具','宴席餐具']
  
    if (event.detail === '1') {
      allTableware = allTableware.filter(v=>!arr.includes(v.useType))
      console.log(allTableware);
    } else {
      allTableware = allTableware.filter(v=>arr.includes(v.useType))
    }
    this.setData({
      'initForm.specsId': '',
      'initForm.userId': '',
      'initForm.useTypeId': '',
      'initForm.schoolId': '',
      specs: {},
      school: {},
      useType: {},
      tableware: [],
      userType: event.detail,
      tablewareList: allTableware
    })
  },
  back(){
    wx.navigateTo({
      url: "/pages/staff-action/index"
    })
  }
})
