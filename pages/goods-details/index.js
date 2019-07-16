const WXAPI = require('../../wxapi/main')
Page({
  data: {
    // autoplay: true,
    // interval: 3000,
    // duration: 1000,
    // swiperCurrent: 0,
    goodsDetail: {},
    selectSpecLabel: "",
    selectSizePrice: 0,
    hideShopPopup: true,
    
    buyNumMin: 1,
    buyNumMax: 100000,

    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
    ciShuTag: ['一餐','二餐'],
    specSelected: '',
    cishuSelected: '',
    renshu: 0,
    tianshu: 0,
  
    tipText: '',
    dialogType: ''
  },

  //事件处理函数
  swiperchange: function(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  selectSpec(e){
    const spec =  e.target.dataset.id
    const specsName =  e.target.dataset.specsname
    this.setData({
      specSelected: spec,
      selectSpecLabel: specsName,
    })
  },
  selectCiShuTag(e){
    const cishu = e.target.dataset.num
    this.setData({
      cishuSelected: cishu
    })
  },
  onLoad: function(e) {
    if (e.inviter_id) {
      wx.setStorage({
        key: 'inviter_id_' + e.id,
        data: e.inviter_id
      })
      wx.setStorage({
        key: 'referrer',
        data: e.inviter_id
      })
    }
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: res=> {
        this.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })
    WXAPI.goodsDetail(e.id).then((res)=> {
      this.setData({
        goodsDetail: res.data
      })
    })
  },
  goShopCar: function() {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  toAddShopCar() {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  tobuy() {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function() {
    this.setData({
      hideShopPopup: false
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function() {
    this.setData({
      hideShopPopup: true
    })
  },
  numJianTap(e) {
    const type = e.target.dataset.type
    if (this.data[type] > this.data.buyNumMin) {
      let currentNum = this.data[type];
      currentNum--;
      this.setData({
        [type]: currentNum
      })
    }
  },
  numJiaTap(e) {
    const type = e.target.dataset.type
    if (this.data[type] < this.data.buyNumMax) {
      let currentNum = this.data[type];
      currentNum++;
      this.setData({
        [type]: currentNum
      })
    }
  },
  labelItemTap(e) {
    let that = this;
    let childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
    for (let i = 0; i < childs.length; i++) {
      that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    // 获取所有的选中规格尺寸数据
    let needSelectNum = that.data.goodsDetail.properties.length;
    let curSelectNum = 0;
    let propertyChildIds = "";
    let propertyChildNames = "";
    for (let i = 0; i < that.data.goodsDetail.properties.length; i++) {
      childs = that.data.goodsDetail.properties[i].childsCurGoods;
      for (let j = 0; j < childs.length; j++) {
        if (childs[j].active) {
          curSelectNum++;
          propertyChildIds = propertyChildIds + that.data.goodsDetail.properties[i].id + ":" + childs[j].id + ",";
          propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].name + ":" + childs[j].name + "  ";
        }
      }
    }
    let canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    // 计算当前价格
    if (canSubmit) {
      WXAPI.goodsPrice({
        goodsId: that.data.goodsDetail.id,
        propertyChildIds: propertyChildIds
      }).then(function(res) {
        that.setData({
          selectSizePrice: res.data.price,
          totalScoreToPay: res.data.score,
          propertyChildIds: propertyChildIds,
          propertyChildNames: propertyChildNames,
          buyNumMax: res.data.stores,
          buyNumber: (res.data.stores > 0) ? 1 : 0
        });
      })
    }


    this.setData({
      goodsDetail: that.data.goodsDetail,
      canSubmit: canSubmit
    })
  },
  popupOk(){
    if (this.data.shopType === 'addShopCar'){
      this.addShopCar()
    } else {
      this.buyNow()
    }
  },
  close(){
    this.setData({
      tipText: ''
    })
  },
  /**
   * 验证选择的参数是否符合要求
   */
  validate(){
    const { useType } = this.data.goodsDetail
    const { specSelected, cishuSelected, renshu, tianshu } = this.data
    // if (useType === '幼儿园餐具') {
    if (useType !== '幼儿园餐具'&&!specSelected) {
      this.setData({
        tipText: '请选择规格'
      })
      return
    }
    if (!cishuSelected) {
      this.setData({
        tipText: '请选择就餐次数'
      })
      return
    }
    if (renshu <= 0) {
      this.setData({
        tipText: '请输入就餐人数'
      })
      return
    }
    if (tianshu <= 0) {
      this.setData({
        tipText: '请输入就餐天数'
      })
      return
    }
    return true
  },
  /**
   * 加入购物车
   */
  addShopCar() {
    if (!this.validate()) {
      return
    }
    //组建购物车
    const shopCarInfo = this.bulidShopCarInfo();
    this.setData({
      shopCarInfo: shopCarInfo
    });
    wx.setStorage({
      key: 'shopCarInfo',
      data: shopCarInfo
    })
    this.closePopupTap();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
  },
  /**
   * 立即购买
   */
  buyNow() {
    if (!this.validate()) {
      return
    }
    //组建立即购买信息
    const buyNowInfo = this.buliduBuyNowInfo();
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap();
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow"
    })
  },
  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function() {
    // 加入购物车
    let shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.id;
    shopCarMap.pic = this.data.goodsDetail.pic;
    shopCarMap.name = this.data.goodsDetail.name;
    // shopCarMap.label=this.data.goodsDetail.id; 规格尺寸
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.weight;

    let shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    let hasSameGoodsIndex = -1;
    for (let i = 0; i < shopCarInfo.shopList.length; i++) {
      let tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    shopCarInfo.kjId = this.data.kjId;
    return shopCarInfo;
  },
  /**
   * 组建立即购买信息
   */
  buliduBuyNowInfo: function() {
    let shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.id;
    shopCarMap.pic = this.data.goodsDetail.pic;
    shopCarMap.name = this.data.goodsDetail.name;
    // shopCarMap.label=this.data.goodsDetail.id; 规格尺寸
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.weight;

    let buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
})
