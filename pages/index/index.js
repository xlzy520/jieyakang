const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
Page({
  data: {
    // indicatorDots: true,
    // autoplay: true,
    // interval: 3000,
    // duration: 1000,
    // loadingHidden: false, // loading
    userInfo: {},
    // swiperCurrent: 0,
    // selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    partners: [],
    // scrollTop: 0,
    // loadingMoreHidden: true,
    
    // hasNoCoupons: true,
    // coupons: [],
    searchInput: '',
    
    curPage: 1,
    pageSize: 20
  },
  
  // tabClick: function(e) {
  //   this.setData({
  //     activeCategoryId: e.currentTarget.id,
  //     curPage: 1
  //   });
  //   this.getGoodsList(this.data.activeCategoryId);
  // },
  //事件处理函数
  // swiperchange: function(e) {
  //   //console.log(e.detail.current)
  //   this.setData({
  //     swiperCurrent: e.detail.current
  //   })
  // },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  // tapBanner: function(e) {
  //   if (e.currentTarget.dataset.id != 0) {
  //     wx.navigateTo({
  //       url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
  //     })
  //   }
  // },
  // bindTypeTap: function(e) {
  //   this.setData({
  //     selectCurrent: e.index
  //   })
  // },
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
    WXAPI.getPartner({
      type: 'index',
      token: wx.getStorageSync('token')
    }).then(function (res) {
      that.setData({
        partners: res.data
      })
    })
    WXAPI.goodsCategory().then(function (res) {
      var categories = [{
        id: 0,
        name: "全部"
      }];
      if (res.code == 0) {
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
    // that.getCoupons();
    that.getNotice();
  },
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
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
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '——' + CONFIG.shareProfile,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  getNotice: function () {
    var that = this;
    WXAPI.noticeList({pageSize: 5}).then(function (res) {
      if (res.code == 0) {
        that.setData({
          noticeList: res.data
        });
      }
    })
  },
  // onReachBottom: function () {
  //   this.setData({
  //     curPage: this.data.curPage + 1
  //   });
  //   this.getGoodsList(this.data.activeCategoryId, true)
  // }
})
