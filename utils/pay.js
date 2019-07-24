const WXAPI = require('../wxapi/main')

function wxpay(app, money, orderId, redirectUrl) {
  WXAPI.wxpay({
    orderId: orderId,
    token: wx.getStorageSync('token'),
    money: 0.01,
  }).then( (res) =>{
    wx.requestPayment({
      timeStamp: Date.now(),
      nonceStr: res.data.nonceStr,
      package: 'prepay_id=' + res.data.prepayId,
      signType: 'MD5',
      paySign: res.data.sign,
      fail:  (aaa)=> {
        wx.showToast({
          title: '支付失败:' + aaa
        })
      },
      success:  ()=> {
        // 保存 formid
        WXAPI.addTempleMsgFormid({
          token: wx.getStorageSync('token'),
          type: 'pay',
          formId: res.data.prepayId
        })
        // 提示支付成功
        wx.showToast({
          title: '支付成功'
        })
        wx.redirectTo({
          url: redirectUrl
        });
      }
    })
  }).catch(err=>{
    wx.showModal({
      title: '出错了',
      content: res.code + ':' + res.msg + ':' + res.data,
      showCancel: false,
      success: function (res) {

      }
    })
  })
}

module.exports = {
  wxpay: wxpay
}
