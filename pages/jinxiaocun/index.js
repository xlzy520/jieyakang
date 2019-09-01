const WXAPI = require('../../wxapi/main')
const utils = require('../../utils/index')
Page({
  data: {
    tabList: ['进销记录', '当前留存'],
    currentTab: 0,
    recordList: [],
    inventoryTypeMap: [],
    storeMap: [],
    start: '',
    end: '',
    endDate: utils.parseTime(new Date()),
    pageIndex: 1,
    noMore: false
  },
  onLoad(e) {
    // 路由来的参数会转为string
    if (e&&e.type) {
      if (Number(e.type)) {
        this.getCurrentStore()
      } else {
        this.getInventoryList({
          pageSize: 20,
          pageIndex: 1,
        })
      }
      this.setData({
        currentTab: Number(e.type)
      })
    }

  },
  getInventoryList(data){
    WXAPI.getInventoryList(data).then(res=>{
      let list = res.data.list
      if (list&&list.length>0) {
        list = list.map(v=>{
          if (v.saveDate&&v.saveDate.length>0) {
            v.saveDate = v.saveDate.substr(0,10)
          }
          return v
        })
      }
      this.setData({
        recordList: list
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
  submit(){
    const { start, end }  = this.data
    if (start > end) {
      wx.showToast({
        title: '初始时间大于结束时间',
        icon: 'none'
      })
      return false
    }
    this.getInventoryList({
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
      this.getCurrentStore()
    } else {
      this.getInventoryList({
        pageSize: 20,
        pageIndex: 1,
      })
    }
  },
  getCurrentStore(){
    wx.showLoading({
      title: '努力加载中...'
    })
    WXAPI.getCurrentStore().then(res=>{
      this.setData({
        storeMap: res.data
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  onReachBottom() {
    wx.showLoading({
      title: '获取数据中...'
    })
    this.setData({
      pageIndex: this.data.pageIndex++
    })
    WXAPI.getInventoryList({
      pageSize: 20,
      pageIndex: this.data.pageIndex,
      startDate: this.data.start,
      endDate: this.data.end
    }).then(res=>{
      if (res.data.list.length<20) {
        this.setData({
          noMore: true
        })
      }
      this.setData({
        recordList: this.data.recordList.concat(res.data.list)
      })
    }).finally(()=>{
      wx.hideLoading()
    })
  },
})
