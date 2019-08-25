const app = getApp();
const WXAPI = require('../../wxapi/main')
const wxpay = require('../../utils/pay')
Page({
  data: {
    lastTime: '',
    titleMap: {
      'unpaid': {
        label: '等待买家付款',
        labelTip: '剩23小时59分自动关闭'
      },
      'unshipped': {
        label: '买家已付款',
        labelTip: '加速装箱中，切莫着急～'
      },
      'unreceived': {
        label: '洁雅康已为您发货',
        labelTip: '餐具已经在路上了，请耐心等待～'
      },
      'completed': {
        label: '交易成功',
        labelTip: '期待您的下次下单～'
      }
    },
    orderId: 0,
    orderDetail: {},
    companyPhone: ''
  },
  getCompanyInfo(){
    WXAPI.getCompanyInfo().then(res=>{
      this.setData({
        companyPhone: res.data.phone|| '0736 - 4388889',
      })
    })
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.companyPhone
    })
  },
  gotoGoods(e){
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad(e) {
    if (e.id) {
      const orderId = e.id;
      this.setData({
        orderId: orderId
      });
    }
  },
  onShow() {
    wx.showLoading({
      title: '努力加载中...'
    })
    this.getCompanyInfo()
    WXAPI.orderDetail({
      orderId: this.data.orderId
    }).then(res => {
      this.setData({
        orderDetail: res.data,
      });
      const ss = 'titleMap.unpaid.labelTip'
      this.setData({
        [ss]: `剩余${res.data.lastTime}自动关闭`
      })
    }).catch(err => {
      wx.showModal({
        title: '错误',
        content: err.msg,
        showCancel: false
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  cancelOrderTap() {
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success:(res)=> {
        if (res.confirm) {
          WXAPI.orderClose({
            orderId: this.data.orderId
          }).then((res)=> {
            wx.showToast({
              title: '取消订单成功',
              duration: 1000
            })
            wx.navigateBack()
          })
        }
      }
    })
  },
  toPayTap(e) {
    const orderId = this.data.orderId
    let money = this.data.orderDetail.amount
    let _msg = '订单金额: ' + money +' 元'
    wx.showModal({
      title: '请确认支付',
      content: _msg,
      confirmText: "确认支付",
      cancelText: "取消支付",
      success :(res)=> {
        if (res.confirm) {
          wxpay.wxpay('order', money, orderId, "/pages/order-list/index");
        } else {
          console.log('用户点击取消支付')
        }
      }
    });
  },
  shouhuo() {
    let orderId = this.data.orderId;
    wx.showModal({
      title: '确认您已收到商品？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          WXAPI.orderComplete({
            orderId: orderId,
          }).then( (res)=> {
            wx.showToast({
              title: '收货成功',
              icon: 'success',
            })
            wx.redirectTo({
              url: 'pages/index/index'
            })
          })
        }
      }
    })
  }
})
