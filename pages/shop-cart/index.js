const WXAPI = require('../../wxapi/main')
Page({
  data: {
    isEditing: false,
    totalPrice: 0,
    allSelect: false,
    noSelect: false,
    shopList: [],
    hideShopPopup: true,
    tipText: '',
    eatNumTag: [
      {label: '一餐', value: 1},{label: '两餐', value: 2},
      {label: '三餐', value: 3},{label: '四餐', value: 4}
    ],
    currentShop: {}
  },

  onLoad() {

  },
  onShow() {
    const shopCarInfo = wx.getStorageSync('shopCarInfo');
    // todo 测试价格变化
    if (shopCarInfo&&shopCarInfo.shopList) {
      const list = shopCarInfo.shopList.map(v=>{
        v.active = false
        return v
      })
      WXAPI.goods({
        pageIndex: 1,
        pageSize: 20
      }).then((res)=> {
        list.map(v=>{
          res.data.list.map(vres=>{
            if (v.useType === vres.useType) {
              if (v.useType === '幼儿园餐具') {
                v.selectSizePrice = vres.specsList.find(sp=>sp.specsId === v.specsId).price
              } else {
                v.selectSizePrice = vres.priceStr
              }
            }
          })
        })
        this.setData({
          shopList: list,
          isEditing: false,
          totalPrice: 0,
          allSelect: false,
          noSelect: false,
        })
        this.updatePageData()
      })
    }
  },
  updatePrice(){
  
  },
  shopCarEdit(e){
    const active = this.data.isEditing
    const { shopList } = this.data;
    for (let i = 0; i < shopList.length; i++) {
      shopList[i].active = false;
    }
    this.setData({
      isEditing: !active
    })
    this.updatePageData()
  },
  toIndexPage() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  selectSpec(e) {
    const spec = e.target.dataset.id
    const specsName = e.target.dataset.specsname
    const price = e.target.dataset.price
    this.setData({
      'currentShop.specsId': spec,
      'currentShop.selectSpecLabel': specsName? '('+specsName+')': '',
      selectSpecLabel: specsName,
      selectSizePrice: price
    })
    // this.updatePageData()
  },
  selectTap(e) {
    const index = e.currentTarget.dataset.index;
    const { shopList } = this.data;
    if (index !== "" && index !== null) {
      shopList[parseInt(index)].active = !shopList[parseInt(index)].active;
      this.updatePageData()
    }
  },
  selectEatNumTag(e){
    const eatNum = e.target.dataset.num
    this.setData({
      'currentShop.eatNum': eatNum,
    })
  },
  changeGuige(e){
    const index = e.currentTarget.dataset.index;
    this.setData({
      hideShopPopup: false,
      currentShop: JSON.parse(JSON.stringify(this.data.shopList[index]))
    })
    this.openGuigeDialog()
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
        total += parseFloat(curItem.selectSizePrice) * curItem.quantity;
      }
    }
    total = total.toFixed(2); //js浮点计算bug，取两位小数精度
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
    const activeShopList = this.data.shopList.filter(v=>v.active)
    const useTypeMap = activeShopList.map(v=>v.useType)
    const initMap1 = ['宴席餐具','餐馆餐具']
    const initMap2 = ['小学餐具','中学餐具', '幼儿园餐具']
    let flag = []
    useTypeMap.map(v=>{
      if (initMap1.includes(v)) {
        flag.push(1)
      } else {
        flag.push(2)
      }
    })
    const isMixin = flag.every(v=>v===1)||flag.every(v=>v===2)
    if (!isMixin) {
      wx.showToast({
        title: '只能选择学校或餐馆类型的商品',
        icon: 'none'
      })
      return false
    }
    wx.navigateTo({
      url: "/pages/to-pay-order/index"
    })
  },
  // 规格选择
  openGuigeDialog() {
    this.setData({
      hideShopPopup: false,
      selectSizePrice: this.data.currentShop.selectSizePrice,
      selectSpecLabel: this.data.currentShop.selectSpecLabel
        .replace('(','').replace(')',''),
    })
  },
  closePopupTap: function() {
    this.setData({
      hideShopPopup: true,
      selectSpecLabel: this.data.currentShop.selectSpecLabel
        .replace('(','').replace(')','')
    })
  },
  numJianTap(e) {
    const type = e.target.dataset.type
    const { hideShopPopup, currentShop } = this.data
    if (hideShopPopup) {
      if (this.data[type] > 1) {
        let currentNum = this.data[type];
        currentNum--;
        this.setData({
          [type]: currentNum
        })
      }
    } else {
      if (currentShop[type] > 1) {
        let currentNum = currentShop[type];
        currentNum--;
        const str = 'currentShop.'+ type
        this.setData({
          [str]: currentNum
        })
      }
    }
  },
  numJiaTap(e) {
    const type = e.target.dataset.type
    const { hideShopPopup, currentShop } = this.data
    if (hideShopPopup) {
      if (this.data[type] < 9999) {
        let currentNum = this.data[type];
        currentNum++;
        this.setData({
          [type]: currentNum
        })
      }
    } else {
      if (currentShop[type] < 9999) {
        let currentNum = currentShop[type];
        currentNum++;
        const str = 'currentShop.'+ type
        this.setData({
          [str]: currentNum
        })
      }
    }
    
  },
  confirmChange(){
    const { eatNum, peopleNum, eatDay } =  this.data.currentShop
    const index = this.data.shopList.findIndex(v=>v.goodsId === this.data.currentShop.goodsId)
    this.data.currentShop.quantity = eatNum* peopleNum * eatDay
    this.data.shopList.splice(index,1)
    this.data.shopList.splice(index,0, this.data.currentShop)
    this.updatePageData()
    this.setData({
      hideShopPopup: true
    })
    // 确认修改购物车
  },
  setTipText(text=''){
    this.setData({
      tipText: text
    })
  },
  close(){
    this.setTipText()
  },
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
})
