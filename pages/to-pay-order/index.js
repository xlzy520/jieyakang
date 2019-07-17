const WXAPI = require('../../wxapi/main')

Page({
  data: {
    goodsList: [],
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    curAddressData: {}
  },
  onShow () {
    let shopList = [];
    //立即购买下单
    if ("buyNow" === this.data.orderType) {
      let buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        switch (buyNowInfoMem.useType) {
          case '幼儿园餐具':
            break;
          case '小学餐具': case '中学餐具':
            break;
          case '宴席餐具':  case '餐馆餐具':
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

  onLoad: function (e) {
    let _data = {
      isNeedLogistics: 1,
      orderType: e.orderType|| 'buyNow'
    }
    this.setData(_data);
  },

  createOrder: function (e) {
    var loginToken = wx.getStorageSync('token') // 用户登录 token
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    var postData = {
      token: loginToken,
      goodsJsonStr: this.data.goodsJsonStr,
      remark: remark
    };
    if (this.data.pingtuanOpenId) {
      postData.pingtuanOpenId = this.data.pingtuanOpenId
    }
    if (this.data.isNeedLogistics > 0) {
      if (!this.data.curAddressData) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
      postData.provinceId = this.data.curAddressData.provinceId;
      postData.cityId = this.data.curAddressData.cityId;
      if (this.data.curAddressData.districtId) {
        postData.districtId = this.data.curAddressData.districtId;
      }
      postData.address = this.data.curAddressData.address;
      postData.linkMan = this.data.curAddressData.linkMan;
      postData.mobile = this.data.curAddressData.mobile;
      postData.code = this.data.curAddressData.code;
    }
    if (this.data.curCoupon) {
      postData.couponId = this.data.curCoupon.id;
    }
    if (!e) {
      postData.calculate = "true";
    }

    WXAPI.orderCreate(postData).then( (res)=> {
      if (e && "buyNow" != this.data.orderType) {
        // 清空购物车数据
        wx.removeStorageSync('shopCarInfo');
      }
      if (!e) {
        this.setData({
          isNeedLogistics: res.data.isNeedLogistics,
          allGoodsPrice: res.data.amountTotle,
          allGoodsAndYunPrice: res.data.amountLogistics + res.data.amountTotle,
          yunPrice: res.data.amountLogistics
        });
        return;
      }
      WXAPI.addTempleMsgFormid({
        token: wx.getStorageSync('token'),
        type: 'form',
        formId: e.detail.formId
      })
      // 配置模板消息推送
      var postJsonString = {};
      postJsonString.keyword1 = {
        value: res.data.dateAdd,
        color: '#173177'
      }
      postJsonString.keyword2 = {
        value: res.data.amountReal + '元',
        color: '#173177'
      }
      postJsonString.keyword3 = {
        value: res.data.orderNumber,
        color: '#173177'
      }
      postJsonString.keyword4 = {
        value: '订单已关闭',
        color: '#173177'
      }
      postJsonString.keyword5 = {
        value: '您可以重新下单，请在30分钟内完成支付',
        color: '#173177'
      }
      WXAPI.sendTempleMsg({
        module: 'order',
        business_id: res.data.id,
        trigger: -1,
        postJsonString: JSON.stringify(postJsonString),
        template_id: 'mGVFc31MYNMoR9Z-A9yeVVYLIVGphUVcK2-S2UdZHmg',
        type: 0,
        token: wx.getStorageSync('token'),
        url: 'pages/index/index'
      })
      postJsonString = {};
      postJsonString.keyword1 = {
        value: '您的订单已发货，请注意查收',
        color: '#173177'
      }
      postJsonString.keyword2 = {
        value: res.data.orderNumber,
        color: '#173177'
      }
      postJsonString.keyword3 = {
        value: res.data.dateAdd,
        color: '#173177'
      }
      WXAPI.sendTempleMsg({
        module: 'order',
        business_id: res.data.id,
        trigger: 2,
        postJsonString: JSON.stringify(postJsonString),
        template_id: 'Arm2aS1rsklRuJSrfz-QVoyUzLVmU2vEMn_HgMxuegw',
        type: 0,
        token: wx.getStorageSync('token'),
        url: 'pages/order-details/index?id=' + res.data.id
      })
      // 下单成功，跳转到订单管理界面
      wx.redirectTo({
        url: "/pages/order-my/index"
      });
    }).catch(err=>{
      wx.showModal({
        title: '错误',
        content: err.msg,
        showCancel: false
      })
    })
  },
  initShippingAddress: function () {
    WXAPI.defaultAddress().then( (res)=> {
      this.setData({
        curAddressData: {
          ...res.data,
          class: '113班'
        }
      });
      this.processYunfei();
    }).catch(err=>{
      this.setData({
        curAddressData: null
      });
    })
  },
  processYunfei: function () {
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var isNeedLogistics = 0;
    var allGoodsPrice = 0;

    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }



      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number+'}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    //console.log(goodsJsonStr);
    this.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr
    });
    // this.createOrder();
  },
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  }
})
