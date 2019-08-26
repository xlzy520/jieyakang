const WXAPI = require('../wxapi/main')

function wxpay(app, money, orderId, redirectUrl) {
  WXAPI.wxpay({
    orderId: orderId,
    token: wx.getStorageSync('token'),
    money: 0.01,
  }).then( (res) =>{
    wx.requestPayment({
      timeStamp: res.data.timeStamp.toString(),
      nonceStr: res.data.nonceStr,
      package: res.data.packageStr,
      signType: 'MD5',
      paySign: res.data.sign,
      fail:  (err)=> {
        console.log(err);
      },
      success: ()=> {
        wx.showToast({
          title: '支付成功'
        })
        wx.redirectTo({
          url: redirectUrl
        });
      }
    })
  }).catch(err=>{
    console.log(err);
    wx.showModal({
      title: '出错了',
      content: err.code + ':' + err.msg + ':' + err.data,
      showCancel: false,
      success: function (res) {

      }
    })
  })
}

module.exports = {
  wxpay: wxpay
}
