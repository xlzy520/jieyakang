const app = getApp();
const WXAPI = require('../../wxapi/main')
Page({
  data: {
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
    orderDetail: {}
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: '0736-4388889'
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
    WXAPI.orderDetail(this.data.orderId).then(res => {
      this.setData({
        orderDetail: res.data
      });
    }).catch(err => {
      wx.showModal({
        title: '错误',
        content: err.msg,
        showCancel: false
      })
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
  confirmBtnTap(e) {
    let that = this;
    let orderId = this.data.orderId;
    WXAPI.addTempleMsgFormid({
      token: wx.getStorageSync('token'),
      type: 'form',
      formId: e.detail.formId
    })
    wx.showModal({
      title: '确认您已收到商品？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          WXAPI.orderDelivery(orderId, wx.getStorageSync('token')).then(function (res) {
            if (res.code == 0) {
              that.onShow();
              // 模板消息，提醒用户进行评价
              let postJsonString = {};
              postJsonString.keyword1 = {value: that.data.orderDetail.orderInfo.orderNumber, color: '#173177'}
              let keywords2 = '您已确认收货，期待您的再次光临！';
              if (app.globalData.order_reputation_score) {
                keywords2 += '立即好评，系统赠送您' + app.globalData.order_reputation_score + '积分奖励。';
              }
              postJsonString.keyword2 = {value: keywords2, color: '#173177'}
              WXAPI.sendTempleMsg({
                module: 'immediately',
                postJsonString: JSON.stringify(postJsonString),
                template_id: 'uJL7D8ZWZfO29Blfq34YbuKitusY6QXxJHMuhQm_lco',
                type: 0,
                token: wx.getStorageSync('token'),
                url: '/pages/order-details/index?id=' + orderId
              })
            }
          })
        }
      }
    })
  }
})
