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
    orderId: ''
  },
  onShow () {
    let shopList = [];
    //立即购买下单
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
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active;
        });
      }
    }
    this.setData({
      goodsList: shopList,
    });
    this.initShippingAddress();
  },

  onLoad(e) {
    this.setData({
      orderType: e.orderType|| 'buyNow'
    });
  },

  toPay(e){

    if (e && "buyNow" !== this.data.orderType) {
      // 清空购物车数据
      wx.removeStorageSync('shopCarInfo');
    }
    // WXAPI.addTempleMsgFormid({
    //   token: wx.getStorageSync('token'),
    //   type: 'form',
    //   formId: e.detail.formId
    // })
    // 配置模板消息推送
    // let postJsonString = {
    //   keyword1: {
    //     value: res.data.dateAdd,
    //     color: '#173177'
    //   }
    // };
    // postJsonString.keyword1 = {
    //   value: res.data.dateAdd,
    //   color: '#173177'
    // }
    // postJsonString.keyword2 = {
    //   value: res.data.amountReal + '元',
    //   color: '#173177'
    // }
    // postJsonString.keyword3 = {
    //   value: res.data.orderNumber,
    //   color: '#173177'
    // }
    // postJsonString.keyword4 = {
    //   value: '订单已关闭',
    //   color: '#173177'
    // }
    // postJsonString.keyword5 = {
    //   value: '您可以重新下单，请在30分钟内完成支付',
    //   color: '#173177'
    // }
    // WXAPI.sendTempleMsg({
    //   module: 'order',
    //   business_id: res.data.id,
    //   trigger: -1,
    //   postJsonString: postJsonString,
    //   template_id: 'mGVFc31MYNMoR9Z-A9yeVVYLIVGphUVcK2-S2UdZHmg',
    //   type: 0,
    //   token: wx.getStorageSync('token'),
    //   url: 'pages/index/index'
    // })
    // postJsonString = {};
    // postJsonString.keyword1 = {
    //   value: '您的订单已发货，请注意查收',
    //   color: '#173177'
    // }
    // postJsonString.keyword2 = {
    //   value: res.data.orderNumber,
    //   color: '#173177'
    // }
    // postJsonString.keyword3 = {
    //   value: res.data.dateAdd,
    //   color: '#173177'
    // }
    // WXAPI.sendTempleMsg({
    //   module: 'order',
    //   business_id: res.data.id,
    //   trigger: 2,
    //   postJsonString: postJsonString,
    //   template_id: 'Arm2aS1rsklRuJSrfz-QVoyUzLVmU2vEMn_HgMxuegw',
    //   type: 0,
    //   token: wx.getStorageSync('token'),
    //   url: 'pages/order-details/index?id=' + res.data.id
    // })
    // 下单成功，跳转到订单管理界面
    // wx.redirectTo({
    //   url: "/pages/order-my/index"
    // });
    console.log(this.data.orderId);
    wxpay.wxpay('order', this.data.allGoodsPrice, this.data.orderId, "/pages/order-list/index");
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
        content: err.msg,
        showCancel: false
      })
    })
  },
  getAllPrice(){

  },
  initShippingAddress() {
    WXAPI.defaultAddress().then( (res)=> {
      this.setData({
        curAddressData: res.data
      });
      this.getAllPrice()
      this.createOrder();
    }).catch(err=>{
      this.setData({
        curAddressData: null
      });
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
