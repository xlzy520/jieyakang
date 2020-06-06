const WXAPI = require('../../wxapi/main')
const utils = require('../../utils/index')
Page({
  data: {
    tabList: ['进销存记录', '生成二维码'],
    currentTab: 0,
    recordList: [],
    schoolList: [],
    start: '',
    end: '',
    endDate: utils.parseTime(new Date()),
    pageIndex: 1,
    noMore: false,
    show: false,
    typeOptions:['学生餐具','幼儿园餐具','餐馆餐具','宴席餐具'],
    typeIndex: '学生餐具',
    produceCount: '',
    sendCount: '',
    qrcodeUrl: '',
    shop: {
      schoolName: '商家',
      schoolId: -9999
    },
    inventoryType: [
      {name: '生产数据', value: 3},
      {name: '发货数据', value: 4},
      {name: '回收数据', value: 1},
    ],
    cars: [],
    inventoryTypeClass: {
      '生产': 'produce',
      '发货': 'send',
      '回收': 'recycle',
      '损耗': 'loss',
    },
    selectedName: '',
    popupShow: false,
    currentRecord: {},
    count: 0
  },
  onLoad(e) {
    // 路由来的参数会转为string
    this.setData({
      currentTab: Number(e.type)
    })
    this.getInventoryListAdmin({
      pageSize: 20,
      pageIndex: 1,
    })
    // if (e&&e.type) {
    //   if (Number(e.type)) {
    //     this.getSchoolList()
    //   } else {
    //     this.getProduceList({
    //       pageSize: 20,
    //       pageIndex: 1,
    //     })
    //   }
    //
    // }

  },
  onPopupClose(){
    this.setData({ popupShow: false });
  },
  viewRecordDetail(e){
    console.log(e);
    const item = e.currentTarget.dataset.item
    
    // this.setData({
    //   popupShow: true,
    //   currentRecord: item
    // });
  },
  getInventoryListAdmin(data){
    WXAPI.getInventoryListAdmin(data).then(res=>{
      let list = res.data.list
      if (list&&list.length>0) {
        list = list.map(v=>{
          if (v.saveDate&&v.saveDate.length>0) {
            v.saveDate = v.saveDate.substr(0,10)
          }
          v.produceTypeText = this.data.typeOptions[v.produceTypeId]
          return v
        })
      }
      this.setData({
        recordList: list,
        count: res.data.count
      })
    })
  },
  onChange(event) {
    this.setData({
      activeName: event.detail,
    });
  },
  showAddProduce(){
    wx.navigateTo({
      url: "/pages/addRecord/index"
    })
  },
  onClose(){
    this.setData({ show: false });
  },
  onTypeChange(name){
    this.setData({
      typeIndex: name
    })
  },
  onProduceCountChange(event){
    this.setData({
      produceCount: event.detail
    })
  },
  onSendCountChange(event){
    this.setData({
      sendCount: event.detail
    })
  },
  onTypeClick(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({
      typeIndex: name
    });
  },
  addProduce(){
    WXAPI.addProduce({
      produceCount: this.data.produceCount,
      sendCount: this.data.sendCount,
      produceTypeId: this.data.typeOptions.findIndex(value => value === this.data.typeIndex),
    }).then(res=>{
      this.onClose()
  
      wx.showToast({
        title: '提交成功',
      })
      this.setData({
        produceCount: '',
        sendCount: '',
        produceTypeId: '学生餐具'
      })
      this.getProduceList({
        pageSize: 20,
        pageIndex: 1,
      })
    }).catch(err=>{
      wx.showToast({
        title: '提交失败',
        type: 'error'
      })
    })
  },
  bindDateChange(e){
    if (e.target.dataset.type === 'start') {
      this.setData({
        start: e.detail.value
      })
    } else {
      this.setData({
        end: e.detail.value
      })
    }

  },
  submitProduce(){
  
  },
  submit(){
    const { start, end }  = this.data
    if (start > end) {
      wx.showToast({
        title: '初始时间大于结束时间',
        icon: 'none'
      })
      return false
    }
    this.getInventoryListAdmin({
      pageSize: 100,
      pageIndex: 1,
      startDate: start,
      endDate: end
    })
  },
  changeCurrentTab(e){
    this.setData({
      currentTab: e.detail,
      noMore: false
    })
    if (e.detail){
      this.getSchoolList()
    } else {
      this.getInventoryListAdmin({
        pageSize: 20,
        pageIndex: 1,
      })
    }
  },
  getSchoolList(){
    wx.showLoading({
      title: '努力加载中...'
    })
    WXAPI.getSchoolList({
      pageSize: 200,
      pageIndex: 1,
    }).then(res=>{
      const baseSchoolList = res.data.list
      this.setData({
        schoolList: baseSchoolList
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  
  selectSchool(event){
    wx.showLoading({
      title: '生成二维码中...'
    })
    const school = event.target.dataset.name
    WXAPI.getSchoolQRCode({
      address: `pages/address-add/index?schoolId=${school.schoolId}&salt=${school.salt}`,
      width: 360
    }).then(res=>{
      this.setData({
        show: true,
        qrcodeUrl: 'data:image/png;base64,'+res.data,
        selectedName: school.schoolName
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  onReachBottom() {
    if (!this.data.currentTab) {
      if (this.data.count < this.data.pageIndex * 20) {
        console.log(333);
        return false
      }
      wx.showLoading({
        title: '获取数据中...'
      })
      const pageIndex = this.data.pageIndex + 1
      WXAPI.getInventoryListAdmin({
        pageSize: 20,
        pageIndex,
        startDate: this.data.start,
        endDate: this.data.end
      }).then(res=>{
        const data =res.data.list.map(v=>{
          if (v.saveDate&&v.saveDate.length>0) {
            v.saveDate = v.saveDate.substr(0,10)
          }
          v.produceTypeText = this.data.typeOptions[v.produceTypeId]
          return v
        })
        if (data.length<20) {
          this.setData({
            noMore: true
          })
        }
        this.setData({
          recordList: this.data.recordList.concat(data),
          count: res.data.count,
          pageIndex
        })
      }).finally(()=>{
        wx.hideLoading()
      })
    }
  },
})
