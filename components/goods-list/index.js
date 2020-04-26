const WXAPI = require('../../wxapi/main')
Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    header: {
      type: Boolean,
      value: true
    }
  },
  data: {
    goods: []
  },
  attached(){
    const token = wx.getStorageSync('token')
    if (token){
      this.getGoodsList()
      wx.hideLoading()
    }
  },
  methods: {
    getGoodsList () {
      const schoolId = wx.getStorageSync('schoolId')
      return WXAPI.goods({
        pageIndex: 1,
        pageSize: 100,
        schoolId
      }).then((res)=> {
        this.setData({
          goods: res.data.list,
        });
      }).finally(()=>{
        wx.hideLoading()
      })
    },
    toDetailsTap(e) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    },
  }
})
