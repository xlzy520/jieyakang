const WXAPI = require('../../wxapi/main')
const app = getApp()
Page({
  data: {
    isEditing: false,
    totalPrice: 0,
    allSelect: false,
    noSelect: false,
    shopList: []
  },

  onLoad() {

  },
  onShow() {
    const shopCarInfo = wx.getStorageSync('shopCarInfo');
    if (shopCarInfo&&shopCarInfo.shopList) {
      this.setData({
        shopList: shopCarInfo.shopList
      })
    }
  },
  shopCarEdit(e){
    const active = e.target.dataset.type
    const { shopList } = this.data;
    for (let i = 0; i < shopList.length; i++) {
      shopList[i].active = active;
    }
    if (active) {
      this.setData({
        isEditing: false
      })
    } else {
      this.setData({
        isEditing: true
      })
    }
    this.updatePageData()
    // this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  toIndexPage() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  delItem(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.shopList;
    list.splice(index, 1);
    this.updatePageData()
  },
  selectTap(e) {
    const index = e.currentTarget.dataset.index;
    const { shopList } = this.data;
    if (index !== "" && index !== null) {
      shopList[parseInt(index)].active = !shopList[parseInt(index)].active;
      this.updatePageData()
    }
  },
  setShopList(){
    const { shopList } = this.data
    this.setData({
      shopList: shopList
    })
    wx.setStorage({
      key: "shopCarInfo",
      data: {
        shopList: shopList
      }
    })
  },
  setTotalPrice() {
    const { shopList } = this.data;
    let total = 0;
    for (let i = 0; i < shopList.length; i++) {
      let curItem = shopList[i];
      if (curItem.active) {
        total += parseFloat(curItem.priceStr) * curItem.quantity;
      }
    }
    total = parseFloat(total.toFixed(2)); //js浮点计算bug，取两位小数精度
    this.setData({
      totalPrice: total
    })
  },
  setSelectStatus() {
    const { shopList } = this.data;
    let allSelect=shopList.every(v=>v.active)
    let noSelect=shopList.every(v=>!v.active)
    this.setData({
      allSelect: allSelect,
      noSelect: noSelect
    })
  },
  updatePageData(){
    this.setShopList()
    this.setTotalPrice()
    this.setSelectStatus()
  },
  bindAllSelect() {
    let { allSelect, shopList } = this.data
    shopList.map(v=>v.active=!allSelect)
    this.updatePageData()
  },
  jiaJianBtnTap(e) {
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;
    let list = this.data.shopList;
    if (index !== "" && index != null) {
      if (type === 'decrease'){
        if (list[parseInt(index)].quantity > 1) {
          list[parseInt(index)].quantity--;
        }
      } else {
        if (list[parseInt(index)].quantity < 9999) {
          list[parseInt(index)].quantity++;
        }
      }
      this.updatePageData()
    }
  },
  editSubmit(e){
    const isEditing = e.target.dataset.type
    isEditing? this.deleteSelected(): this.toPayOrder()
  },
  deleteSelected() {
    let list = this.data.shopList;
    list = list.filter(v=> !v.active)
    this.setData({
      shopList: list
    })
    this.setShopList()
    this.setTotalPrice()
    this.setSelectStatus()
  },
  toPayOrder() {
    wx.showLoading();
    var that = this;
    if (this.data.goodsList.noSelect) {
      wx.hideLoading();
      return;
    }
    // 重新计算价格，判断库存
    var shopList = [];
    var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
    if (shopCarInfoMem && shopCarInfoMem.shopList) {
      // shopList = shopCarInfoMem.shopList
      shopList = shopCarInfoMem.shopList.filter(entity => {
        return entity.active;
      });
    }
    if (shopList.length == 0) {
      wx.hideLoading();
      return;
    }
    var isFail = false;
    var doneNumber = 0;
    var needDoneNUmber = shopList.length;
    for (let i = 0; i < shopList.length; i++) {
      if (isFail) {
        wx.hideLoading();
        return;
      }
      let carShopBean = shopList[i];
      // 获取价格和库存
      if (!carShopBean.propertyChildIds || carShopBean.propertyChildIds == "") {
        WXAPI.goodsDetail(carShopBean.goodsId).then(function(res) {
          doneNumber++;
          if (res.data.properties) {
            wx.showModal({
              title: '提示',
              content: res.data.basicInfo.name + ' 商品已失效，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (res.data.basicInfo.stores < carShopBean.number) {
            wx.showModal({
              title: '提示',
              content: res.data.basicInfo.name + ' 库存不足，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (res.data.basicInfo.minPrice != carShopBean.price) {
            wx.showModal({
              title: '提示',
              content: res.data.basicInfo.name + ' 价格有调整，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (needDoneNUmber == doneNumber) {
            that.navigateToPayOrder();
          }
        })
      } else {
        WXAPI.goodsPrice({
          goodsId: carShopBean.goodsId,
          propertyChildIds: carShopBean.propertyChildIds
        }).then(function(res) {
          doneNumber++;
          if (res.data.stores < carShopBean.number) {
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 库存不足，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (res.data.price != carShopBean.price) {
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 价格有调整，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (needDoneNUmber == doneNumber) {
            that.navigateToPayOrder();
          }
        })
      }

    }
  },
  navigateToPayOrder() {
    wx.hideLoading();
    wx.navigateTo({
      url: "/pages/to-pay-order/index"
    })
  },
  onHide() {
    console.log('onHide监听页面隐藏');
  },
})
