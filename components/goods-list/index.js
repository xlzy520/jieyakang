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
    this.getGoodsList()
  },
  methods: {
    getGoodsList () {
      wx.showLoading({
        "mask": true,
        title: '正在获取商品列表...'
      })
      return WXAPI.goods({
        pageIndex: 1,
        pageSize: 20
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
