const WXAPI = require('../../wxapi/main')
const wxpay = require('../../utils/pay.js')
Page({
  data: {
    goodsList: [],
    allGoodsPrice: '0.00',
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    curAddressData: {},
    totalNum: 0, //共几份
    eatNumTag: ['一餐','二餐', '三餐', '四餐'],
    orderId: '',
    dialogText: '',
    dialogType: 'add-address'
  },
  onShow () {
    this.initShippingAddress();
    let shopList = [];
    if ("buyNow" === this.data.orderType) {
      let buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      let {useType, quantity, priceStr, eatNum, peopleNum,eatDay} = buyNowInfoMem.shopList[0]
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        useType = '宴席餐具'
        switch (useType) {
          case '幼儿园餐具': case '小学餐具': case '中学餐具':
          const totalNum = eatNum * peopleNum * eatDay
          this.setData({
            totalNum: totalNum,
            allGoodsPrice: (totalNum * Number(priceStr)).toFixed(2)
          })
            break;
          case '宴席餐具':  case '餐馆餐具':
            this.setData({
              totalNum: quantity,
              allGoodsPrice: quantity * Number(priceStr).toFixed(2)
            })
            break;
          default:
            break;
        }
        shopList = buyNowInfoMem.shopList
      }
    } else {
      //购物车下单
      let shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        shopList = shopCarInfoMem.shopList.filter(entity => entity.active);
      }
    }
    this.setData({
      goodsList: shopList,
    });
  },

  onLoad(e) {
    this.setData({
      orderType: e.orderType
    });
    const address = wx.getStorageSync('select-address')
    if (address) {
      this.setData({
        curAddressData: address
      })
      wx.removeStorageSync('select-address')
    }
  },

  toPay(e){
    if (e && "buyNow" !== this.data.orderType) {
      // 清空购物车数据
      wx.removeStorageSync('shopCarInfo');
    }
    wxpay.wxpay('order', this.data.allGoodsPrice, this.data.orderId, "/pages/index/index");
  },
  createOrder() {
    // if (!this.data.curAddressData) {
    //   wx.hideLoading();
    //   wx.showModal({
    //     title: '错误',
    //     content: '请先设置您的收货地址！',
    //     showCancel: false
    //   })
    //   return;
    // }
    WXAPI.orderCreate({
      addressId: this.data.curAddressData.addressId,
      orderDetails: this.data.goodsList,
    }).then( (res)=> {
      this.setData({
        allGoodsPrice: res.data.amount,
        orderId: res.data.orderId
      });
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
  initShippingAddress() {
    wx.showLoading({
      mask: true,
      title: '正在获取数据...'
    })
    WXAPI.defaultAddress().then( (res)=> {
      this.setData({
        curAddressData: res.data
      });
      this.createOrder();
    })
  },
  addAddress() {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  selectAddress() {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  }
})
