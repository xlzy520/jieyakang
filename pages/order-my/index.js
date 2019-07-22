const wxpay = require('../../utils/pay.js')
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    orderTypeTabs: ["全部订单", "待付款", "待发货", "待收货"],
    currentTab: 0,
    orderList: [],
  },
  getAllOrder(){
    WXAPI.orderList({
      statusCode: ''
    }).then((res) => {
      this.setData({
        orderList: res.data.list
      })
    })
  },
  goBack(){
    wx.navigateBack({
      delta: 2,
    })
  },
  statusTap(e) {
    this.setData({
      currentTab: e.detail
    })
    this.onShow();
  },
  orderDetail(e) {
    let orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  cancelOrderTap(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success:(res)=> {
        if (res.confirm) {
          WXAPI.orderClose(orderId).then((res)=> {
            this.onShow();
          })
        }
      }
    })
  },
  toPayTap(e) {
    const orderId = e.currentTarget.dataset.id;
    let money = e.currentTarget.dataset.money;
    let _msg = '订单金额: ' + money +' 元'
    wx.showModal({
      title: '请确认支付',
      content: _msg,
      confirmText: "确认支付",
      cancelText: "取消支付",
      success:(res) =>{
        if (res.confirm) {
          this._toPayTap(orderId, money)
        } else {
          console.log('用户取消支付')
        }
      }
    });
  },
  _toPayTap (orderId, money){
    wxpay.wxpay('order', money, orderId, "/pages/order-list/index");
  },
  onLoad(options) {
    if (options && options.type) {
      this.setData({
        currentTab: Number(options.type)
      });
    }
  },
  onReady() {
    // 生命周期函数--监听页面初次渲染完成

  },
  onShow() {
    // 获取订单列表
    const currentTabIndex = this.data.currentTab
    const tabMap = ['', 'unpaid', 'unshipped', 'unreceived']
    if (currentTabIndex !== 0) {
      WXAPI.orderList({
        statusCode: tabMap[currentTabIndex]
      }).then((res)=> {
        this.setData({
          orderList: res.data.list
        });
      })
    } else {
      this.getAllOrder()
    }
    
  }
})
