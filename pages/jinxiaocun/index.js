const WXAPI = require('../../wxapi/main')
const utils = require('../../utils/index')
Page({
  data: {
    tabList: ['进销记录', '当前库存'],
    currentTab: 0,
    recordList: [],
    inventoryTypeMap: [],
    start: '',
    end: '',
    endDate: utils.parseTime(new Date())
  },
  onLoad() {
    WXAPI.getInventoryList().then(res=>{
      this.setData({
        recordList: res.data.list
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

  },
  changeCurrentTab(e){
    this.setData({
      currentTab: e.detail
    })
  }
})
