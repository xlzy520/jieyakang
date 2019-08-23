const WXAPI = require('../../wxapi/main')
Page({
  data: {
    swiperCurrent: 0,
    goodsDetail: {},
    hideShopPopup: true,
    
    buyNumMin: 1,
    buyNumMax: 9999,
    
    shopCarInfo: {
      shopList: []
    },
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
    eatNumTag: ['一餐','二餐'],
    selectSpecLabel: "",
    selectSizePrice: 0,
    specsId: '',
    eatNum: 1,
    peopleNum: 1,
    eatDay: 1,
    quantity: 1,
  //update 商品详情更新默认值，当时幼儿园类型时，修改价格为
    tipText: '',
    imgs: ['http://www.xlzy520.cn/750_600/餐馆餐具.png', 'http://www.xlzy520.cn/750_600/餐馆餐具.png']
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
  selectEatNumTag(e){
    const eatNum = e.target.dataset.num
    this.setData({
      eatNum: eatNum
    })
  },
  onLoad(e) {
    wx.showLoading({
      "mask": true,
      title: '正在获取商品详情...'
    })
    WXAPI.goodsDetail({
      goodsId: e.id
    }).then((res)=> {
      this.setData({
        goodsDetail: res.data,
      })
      if (res.data.useType === '幼儿园餐具') {
        this.setData({
          selectSizePrice: res.data.priceStr
        })
      }
    }).finally(()=>{
      wx.hideLoading()
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
    let eatNumTag = []
    switch (this.data.goodsDetail.useType) {
      case '幼儿园餐具':
        eatNumTag = [{label: '两餐', value: 2}]
        this.setData({
          eatNum: 2
        })
        break;
      case '小学餐具':
        eatNumTag = [{label: '一餐', value: 1},{label: '两餐', value: 2}]
        break;
      case '中学餐具':
        //todo 初中不能选四餐，待确认
        eatNumTag = [{label: '一餐', value: 1},{label: '两餐', value: 2},
          {label: '三餐', value: 3},{label: '四餐', value: 4}]
        break;
      default:
        break;
    }
    this.setData({
      hideShopPopup: false,
      selectSizePrice: this.data.goodsDetail.priceStr,
      eatNumTag: eatNumTag
    })
  },
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
      title: '添加成功，在购物车等亲～',
      icon: 'none',
      duration: 2000
    })
  },
  buyNow() {
    if (!this.validate()) {
      return
    }
    //组建立即购买信息
    const buyNowInfo = this.buildBuyNowInfo();
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap();
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow"
    })
  },
  buildShopCarInfo() {
    const { goodsId,goodsName,fileUrls,priceStr,specsList,useType} = this.data.goodsDetail
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
    let shopCarInfo = wx.getStorageSync('shopCarInfo');
    let sameGoods
    if (!shopCarInfo||!shopCarInfo.shopList) {
      shopCarInfo = {}
      shopCarInfo.shopList = [];
      shopCarInfo.shopList.push(shopCarMap);
    } else {
      switch (useType) {
        case '幼儿园餐具':
          sameGoods = shopCarInfo.shopList.find(v=>v.goodsId ===goodsId
            &&v.specsId === specsId&&v.eatNum === eatNum)
          if (sameGoods) {
            shopCarMap.peopleNum = shopCarMap.peopleNum + sameGoods.peopleNum;
            shopCarMap.eatDay = shopCarMap.eatDay + sameGoods.eatDay;
          }
          shopCarMap.quantity = shopCarMap.peopleNum * shopCarMap.eatDay * shopCarMap.eatNum
          break;
        case '小学餐具': case '中学餐具':
          sameGoods = shopCarInfo.shopList.find(v=>v.goodsId ===goodsId &&v.eatNum === eatNum)
          if (sameGoods) {
            shopCarMap.peopleNum = shopCarMap.peopleNum + sameGoods.peopleNum;
            shopCarMap.eatDay = shopCarMap.eatDay + sameGoods.eatDay;
        }
          shopCarMap.quantity = shopCarMap.peopleNum * shopCarMap.eatDay * shopCarMap.eatNum
        break;
        case '宴席餐具':  case '餐馆餐具':
          delete shopCarMap.eatNum
          delete shopCarMap.eatDay
          delete shopCarMap.peopleNum
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
    }
    // todo 各种情况分类
    return shopCarInfo;
  },
  buildBuyNowInfo: function() {
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
    if (useType === '宴席餐具'|| useType === '餐馆餐具'){
      delete shopCarMap.eatNum
      delete shopCarMap.eatDay
      delete shopCarMap.peopleNum
    }else {
      delete shopCarMap.quantity
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
})
