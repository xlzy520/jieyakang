const WXAPI = require('../../wxapi/main')
Page({
  data: {
    // autoplay: true,
    // interval: 3000,
    // duration: 1000,
    // swiperCurrent: 0,
    goodsDetail: {},
    hideShopPopup: true,
    
    buyNumMin: 1,
    buyNumMax: 100000,

    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
    ciShuTag: ['一餐','二餐'],
    selectSpecLabel: "",
    selectSizePrice: 0,
    specsId: '',
    eatNum: '',
    peopleNum: 0,
    eatDay: 0,
    quantity: 0,
  
    tipText: '',
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
    const price =  e.target.dataset.price
    this.setData({
      specsId: spec,
      selectSpecLabel: specsName,
      selectSizePrice: price
    })
  },
  selectCiShuTag(e){
    const cishu = e.target.dataset.num
    this.setData({
      eatNum: cishu
    })
  },
  onLoad(e) {
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: res=> {
        this.setData({
          shopCarInfo: res.data
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
    this.openGuigeDialog();
  },
  tobuy() {
    this.setData({
      shopType: "tobuy"
    });
    this.openGuigeDialog();
  },
  /**
   * 规格选择弹出框
   */
  openGuigeDialog() {
    this.setData({
      hideShopPopup: false,
      selectSizePrice: this.data.goodsDetail.priceStr
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
  setTipText(text=''){
    this.setData({
      tipText: text
    })
  },
  close(){
   this.setTipText()
  },
  /**
   * 验证选择的参数是否符合要求
   */
  validate(){
    const { useType } = this.data.goodsDetail
    const { specsId, eatNum, peopleNum, eatDay, quantity } = this.data
    if (useType !== '餐馆餐具'&&useType !== '宴席餐具') {
      if (useType === '幼儿园餐具'&&!specsId) {
        this.setTipText('请选择规格')
        return
      }
      if (!eatNum) {
        this.setTipText('请选择就餐次数')
        return
      }
      if (peopleNum <= 0) {
        this.setTipText('请输入就餐人数')
        return
      }
      if (eatDay <= 0) {
        this.setTipText('请输入就餐天数')
        return
      }
    } else {
      if (quantity <= 0) {
        this.setTipText('请输入购买数量')
        return
      }
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
    const shopCarInfo = this.buildShopCarInfo();
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
  buildShopCarInfo() {
    const { goodsId,goodsName,fileUrls,priceStr,specsList,useType } = this.data.goodsDetail
    const { specsId, eatNum, peopleNum, eatDay, quantity } = this.data
    let shopCarMap = {
      goodsId: goodsId,
      goodsName: goodsName,
      fileUrls: fileUrls,
      priceStr: priceStr,
      specsList: specsList,
      useType: useType,
  
      specsId: specsId,
      eatNum: eatNum,
      peopleNum: peopleNum,
      eatDay: eatDay,
      quantity: quantity
    };
    let shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    let sameGoods
    // todo 各种情况分类
    switch (useType) {
      case '幼儿园餐具':
        sameGoods = shopCarInfo.shopList.find(v=>v.goodsId ===goodsId
          &&v.specsId === specsId&&v.eatNum === eatNum)
        if (sameGoods) {
          shopCarMap.peopleNum = shopCarMap.peopleNum + sameGoods.peopleNum;
          shopCarMap.eatDay = shopCarMap.eatDay + sameGoods.eatDay;
        }
        break;
      case '小学餐具': case '中学餐具':
        sameGoods = shopCarInfo.shopList.find(v=>v.goodsId ===goodsId &&v.eatNum === eatNum)
        if (sameGoods) {
          shopCarMap.peopleNum = shopCarMap.peopleNum + sameGoods.peopleNum;
          shopCarMap.eatDay = shopCarMap.eatDay + sameGoods.eatDay;
        }
        break;
      case '宴席餐具':  case '餐馆餐具':
        sameGoods = shopCarInfo.shopList.find(v=>v.goodsId ===goodsId)
        if (sameGoods) {
          shopCarMap.quantity = shopCarMap.quantity + sameGoods.quantity;
        }
        break;
      default:
        break;
    }

    if (sameGoods) {
      const sameGoodsIndex = shopCarInfo.shopList.findIndex(v=>v.goodsId === sameGoods.goodsId)
      shopCarInfo.shopList.splice(sameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    return shopCarInfo;
  },
  /**
   * 组建立即购买信息
   */
  buliduBuyNowInfo: function() {
    const { goodsId,goodsName,fileUrls,priceStr,specsList,useType } = this.data.goodsDetail
    const { specsId, eatNum, peopleNum, eatDay, quantity } = this.data
    let shopCarMap = {
      goodsId: goodsId,
      goodsName: goodsName,
      fileUrls: fileUrls,
      priceStr: priceStr,
      specsList: specsList,
      useType: useType,

      specsId: specsId,
      eatNum: eatNum,
      peopleNum: peopleNum,
      eatDay: eatDay,
      quantity: quantity
    };

    let buyNowInfo = {};
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
})
