const WXAPI = require('../../wxapi/main')
Page({
  data: {
    categories: [],
    activeCategoryId: 0,
    goods: [],
    
    curPage: 1,
    pageSize: 20
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    /**
     * 示例：
     * 调用接口封装方法
     */
    // WXAPI.banners({type: 'index'}).then(function (res) {
    //   if (res.code == 700) {
    //     wx.showModal({
    //       title: '提示',
    //       content: '请在后台添加 banner 轮播图片，自定义类型填写 index',
    //       showCancel: false
    //     })
    //   }
    //   else {
    //     that.setData({
    //       banners: res.data
    //     });
    //   }
    // }).catch(function (e) {
    //   wx.showToast({
    //     title: res.msg,
    //     icon: 'none'
    //   })
    // })
    WXAPI.goodsCategory().then(function (res) {
      var categories = [{
        id: 0,
        name: "全部"
      }];
      if (res.code === 0) {
        for (var i = 0; i < res.data.length; i++) {
          categories.push(res.data[i]);
        }
      }
      that.setData({
        categories: categories,
        activeCategoryId: 0,
        curPage: 1
      });
      that.getGoodsList(0);
    })
  },
  getGoodsList: function (categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    // wx.showLoading({
    //   "mask": true
    // })
    WXAPI.goods({
      categoryId: categoryId,
      nameLike: that.data.searchInput,
      page: this.data.curPage,
      pageSize: this.data.pageSize
    }).then(function (res) {
      res.data.map(function (item) {
        item.minPrice = item.minPrice.toFixed(2)
      })
      wx.hideLoading()
      if (res.code == 404 || res.code == 700) {
        let newData = {
          // loadingMoreHidden: false
        }
        if (!append) {
          newData.goods = []
        }
        that.setData(newData);
        return
      }
      let goods = [];
      if (append) {
        goods = that.data.goods
      }
      for (var i = 0; i < res.data.length; i++) {
        goods.push(res.data[i]);
      }
      that.setData({
        // loadingMoreHidden: true,
        goods: goods,
      });
    })
  },
  // onReachBottom: function () {
  //   this.setData({
  //     curPage: this.data.curPage + 1
  //   });
  //   this.getGoodsList(this.data.activeCategoryId, true)
  // }
})
