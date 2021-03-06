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
    dialogType: 'add-address',
    type: 0 //  0线上支付，1线下支付
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
        shopList.map(v=>{
          v.allGoodsPrice = (v.quantity * v.selectSizePrice).toFixed(2)
        })
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
    this.getAmount(shopList)
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
      this.createOrder()
    }
  },
  offlinePay(){
    if (this.matchGoodsAddress()) {
      this.setData({
        type: 1
      })
      this.createOrder()
    }
  },
  createOrder() {
    const { type, allGoodsPrice, orderType } = this.data
    wx.showLoading({
      title: '创建订单中...'
    })
    WXAPI.orderCreate({
      addressId: this.data.curAddressData.addressId,
      orderDetails: this.data.goodsList,
      type: type
    }).then((res)=> {
      const { amount, orderId } = res.data
      this.setData({
        allGoodsPrice: amount,
        orderId: orderId
      });
      let shopCarIds = []
      if ("buyNow" !== orderType) {
        // 清空购物车数据
        shopCarIds = this.data.goodsList.map(v=>v.shopCarId)
      }
      const redirectUrl = `/pages/pay-success/index?orderId=${orderId}&type=${type}`;
      if (type === 0) {
        wxpay.wxpay(allGoodsPrice, orderId, redirectUrl, shopCarIds);
      } else if (type === 1) {
        wx.redirectTo({
          url: redirectUrl
        });
      }
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
      title: '获取数据中...'
    })
    WXAPI.defaultAddress().then( (res)=> {
      this.setData({
        curAddressData: res.data
      });
    }).finally(() => {
      wx.hideLoading()
    })
  },
  getAmount(shopList){
    WXAPI.getOrderAmount({
      orderDetails: shopList
    }).then(res=>{
      if (res.data > 0) {
        this.setData({
          allGoodsPrice: (res.data).toFixed(2)
        })
      }
    })
  },
  close(){
    this.setData({
      dialogText: '',
      dialogType: 'add-address'
    })
  },
  addAddress() {
    wx.showToast({
      title: '您暂无地址类型，请联系管理员扫描地址归属二维码添加默认地址',
      duration: 2000,
      icon: 'none'
    })
    // wx.navigateTo({
    //   url: "/pages/address-add/index"
    // })
  },
  selectAddress() {
    wx.navigateTo({
      url: "/pages/select-address/index?from=pay"
    })
  }
})
