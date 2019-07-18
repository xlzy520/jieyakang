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
        label: '等待买家付款',
        labelTip: '等待买家付款'
      },
      'unreceived': {
        label: '等待买家付款',
        labelTip: '等待买家付款'
      },
      'completed': {
        label: '等待买家付款',
        labelTip: '等待买家付款'
      }
    },
    orderId: 0,
    goodsList: [],
    orderDetail: {}
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: '0736-4388889'
    })
  },
  onLoad(e) {
    const orderId = e.id;
    this.setData({
      orderId: orderId
    });
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
    var yunPrice = parseFloat(this.data.yunPrice);
    var allprice = 0;
    var goodsList = this.data.goodsList;
    for (var i = 0; i < goodsList.length; i++) {
      allprice += parseFloat(goodsList[0].price) * goodsList[0].number;
    }
    this.setData({
      allGoodsPrice: allprice,
      yunPrice: yunPrice
    });
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
