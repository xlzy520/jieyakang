const WXAPI = require('../../wxapi/main')
const wxpay = require('../../utils/pay.js')
Page({
  data: {
    goodsList: [],
    allGoodsPrice: '0.00',
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    curAddressData: null,
    totalNum: 0, //共几份
    eatNumTag: ['一餐','二餐', '三餐', '四餐'],
    orderId: '',
    dialogText: '',
    dialogType: 'add-address'
  },
  onShow () {
    const address = wx.getStorageSync('select-address')
    if (address) {
      this.setData({
        curAddressData: address
      })
      wx.removeStorageSync('select-address')
    } else {
      this.initShippingAddress();
    }
    let shopList = [];
    if ("buyNow" === this.data.orderType) {
      let buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      let {quantity,selectSizePrice} = buyNowInfoMem.shopList[0]
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        this.setData({
          totalNum: quantity,
          allGoodsPrice: (quantity * Number(selectSizePrice)).toFixed(2)
        })
        shopList = buyNowInfoMem.shopList
      }
    } else {
      //购物车下单
      let shopCarInfoMem = wx.getStorageSync('shopCarInfo');
    
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        shopList = shopCarInfoMem.shopList.filter(entity => entity.active);
        let totalNum = 0;
        let allGoodsPrice = 0;
        for (let i = 0; i < shopList.length; i++) {
          totalNum += shopList[i].quantity
          allGoodsPrice += shopList[i].quantity * Number(shopList[i].selectSizePrice)
        }
        this.setData({
          totalNum: totalNum,
          allGoodsPrice: allGoodsPrice.toFixed(2)
        })
      }
    }
    this.setData({
      goodsList: shopList,
    });
  },
  onLoad(e) {
    this.setData({
      orderType: e.orderType || ""
    });
  },
  toPay(e){
    if (this.matchGoodsAddress()) {
      if (this.data.orderId) {
        this.createOrder()
      }
    }
  },
  createOrder() {
    wx.showLoading({
      title: '创建订单中...'
    })
    WXAPI.orderCreate({
      addressId: this.data.curAddressData.addressId,
      orderDetails: this.data.goodsList,
    }).then( (res)=> {
      this.setData({
        allGoodsPrice: res.data.amount,
        orderId: res.data.orderId
      });
      if ("buyNow" !== this.data.orderType) {
        // 清空购物车数据
        wx.removeStorageSync('shopCarInfo');
      }
      wxpay.wxpay('order', this.data.allGoodsPrice, this.data.orderId,
        "/pages/pay-success/index?orderId="+this.data.orderId);
    }).catch(err=>{
      wx.showModal({
        title: '错误',
        content: '获取信息失败！',
        showCancel: false
      })
    }).finally(()=>{
      wx.hideLoading()
    })
  },
  matchGoodsAddress(){
    if (!this.data.curAddressData) {
      wx.showModal({
        title: '错误',
        content: '请先设置您的收货地址！',
        showCancel: false
      })
      return;
    }
    if (Boolean(this.data.curAddressData.addressType) ===
      Boolean(['宴席餐具','餐馆餐具'].includes(this.data.goodsList[0].useType))) {
      this.createOrder()
      return true
    } else {
      this.setData({
        dialogText: '请选择商品相对应的地址',
        dialogType: ''
      })
      return false
    }
  },
  initShippingAddress() {
    wx.showLoading({
      mask: true,
      title: '正在获取数据...'
    })
    WXAPI.defaultAddress().then( (res)=> {
      this.setData({
        curAddressData: res.data
      });
      if (!this.matchGoodsAddress()) {
        wx.hideLoading()
      }
    }).finally(() => {
      wx.hideLoading()
    })
  },
  close(){
    this.setData({
      dialogText: '',
      dialogType: 'add-address'
    })
  },
  addAddress() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  selectAddress() {
    wx.navigateTo({
      url: "/pages/select-address/index?from=pay"
    })
  }
})
