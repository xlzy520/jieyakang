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
      currentTab: e.currentTarget.dataset.index
    })
    this.onShow();
  },
  orderDetail(e) {
    var orderId = e.currentTarget.dataset.id;
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
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    let money = e.currentTarget.dataset.money;
    console.log(money);
    // const needScore = e.currentTarget.dataset.score;
    WXAPI.userAmount(wx.getStorageSync('token')).then(function(res) {
      if (res.code == 0) {
        // 增加提示框
        let _msg = '订单金额: ' + money +' 元'
        wx.showModal({
          title: '请确认支付',
          content: _msg,
          confirmText: "确认支付",
          cancelText: "取消支付",
          success (res) {
            if (res.confirm) {
              that._toPayTap(orderId, money)
            } else {
              console.log('用户点击取消支付')
            }
          }
        });
      } else {
        wx.showModal({
          title: '错误',
          content: '无法获取用户资金信息',
          showCancel: false
        })
      }
    })
  },
  _toPayTap (orderId, money){
    const _this = this
    if (money <= 0) {
      // 直接使用余额支付
      WXAPI.orderPay(orderId, wx.getStorageSync('token')).then(function (res) {
        _this.onShow();
      })
    } else {
      wxpay.wxpay('order', money, orderId, "/pages/order-list/index");
    }
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
