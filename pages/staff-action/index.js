const WXAPI = require('../../wxapi/main')
const utils = require('../../utils/index')
Page({
  data: {
    tabList: ['生产数据', '生成二维码'],
    currentTab: 0,
    recordList: [],
    schoolList: [],
    start: '',
    end: '',
    endDate: utils.parseTime(new Date()),
    pageIndex: 1,
    noMore: false,
    show: false,
    typeOptions:['学生餐具','幼儿园餐具','餐馆餐具','宴请餐具'],
    typeIndex: '学生餐具',
    produceCount: '',
    sendCount: ''
  },
  onLoad(e) {
    // 路由来的参数会转为string
    this.setData({
      currentTab: Number(e.type)
    })
    this.getProduceList({
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
  
  getProduceList(data){
    WXAPI.getProduceList(data).then(res=>{
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
        recordList: list
      })
    })
  },
  showAddProduce(){
    this.setData({ show: true });
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
    this.getProduceList({
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
      this.getProduceList({
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
      this.setData({
        schoolList: res.data.list
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  
  selectSchool(event){
    console.log(event);
    this.setData({
      show: true
    })
  },

  onReachBottom() {
    wx.showLoading({
      title: '获取数据中...'
    })
    this.setData({
      pageIndex: this.data.pageIndex++
    })
    WXAPI.getProduceList({
      pageSize: 20,
      pageIndex: this.data.pageIndex,
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
      if (data.list.length<20) {
        this.setData({
          noMore: true
        })
      }
      this.setData({
        recordList: this.data.recordList.concat(data.list)
      })
    }).finally(()=>{
      wx.hideLoading()
    })
  },
})
