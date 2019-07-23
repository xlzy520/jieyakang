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
   this.getInventoryList()
  },
  getInventoryList(){
    WXAPI.getInventoryList({
      pageSize: 20,
      pageIndex: 1,
      startDate: this.data.start,
      endDate: this.data.end
    }).then(res=>{
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
    this.getInventoryList()
  },
  changeCurrentTab(e){
    this.setData({
      currentTab: e.detail
    })
  }
})
