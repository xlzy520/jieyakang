// const baseUrl = 'https://axjieyakang.com/market'
const baseUrl = 'http://7dc785e8.ngrok.io/market'
// todo 统一处理 正确错误、token过期
const auth = require('../utils/auth')
const request = (url,data={},method='post') => {
  let _url = baseUrl + url
  return new Promise((resolve, reject) => {
    wx.request({
      url: _url+'?appToken='+ wx.getStorageSync('token'),
      method: method==='formdata'?'post': method,
      data: data,
      header: {
        'Content-Type': method==='formdata'?'application/x-www-form-urlencoded':'application/json'
      },
      success(request) {
        if (request.data.success){
          resolve(request.data)
        } else {
          if (request.data.code === 1027) {
            wx.removeStorageSync('token')
            auth.login()
          } else {
            wx.showModal({
              title: '错误',
              content: request.data.msg,
              showCancel: false
            })
            reject(request.data)
          }
        }
      },
      fail(error) {
        reject(error)
      },
      complete(aaa) {
        // 加载完成
      }
    })
  })
}

/**
 * 小程序的promise没有finally方法，自己扩展下
 */
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
}

module.exports = {
  request,
  addTempleMsgFormid: (data) => {
    return request('/template-msg/wxa/formId', data)
  },
  sendTempleMsg: (data) => {
    return request('/template-msg/put', data)
  },
  wxpay: (data) => {
    return request('/bill/pay', data)
  },
  login: (code) => {
    return request('/login', {
      username: code,
      password: code
    }, 'formdata')
  },
  register: (data) => {
    return request('/user/logon', data)
  },
  goods: (data) => {
    return request('/goods/list', data)
  },
  goodsDetail: data => {
    return request('/goods/detail', data)
  },
  goodsPrice: (data) => {
    return request('/shop/goods/price', data)
  },
  addAddress: (data) => {
    return request('/address/save', data)
  },
  updateAddressDefault: (data) => {
    return request('/address/default/update', data)
  },
  updateAddress: (data) => {
    return request('/address/update', data)
  },
  deleteAddress: data => {
    return request('/address/delete', data)
  },
  getAddressList: (data) => {
    return request('/address/list', data)
  },
  defaultAddress: () => {
    return request('/address/default/get')
  },
  addressDetail: (id) => {
    return request('/address/detail',{
      id,
    })
  },
  orderCreate: (data) => {
    return request('/order/save', data)
  },
  orderList: (data) => {
    return request('/order/list', data)
  },
  orderDetail: data => {
    return request('/order/detail',data)
  },
  orderDelivery: (orderId, token) => {
    return request('/order/delivery', {
      orderId,
      token
    })
  },
  orderClose: data => {
    return request('/order/close', data)
  },
  orderStatistics: () => {
    return request('/order/statistics')
  },
  getPartner: (data) => {
    return request('/partner/list', data)
  },
  getCompanyInfo: ()=>{
    return request('/company/getInfo')
  },
  getSchoolList: (data)=>{
    return request('/school/list', data)
  },
  getInventoryList: (data)=>{
    return request('/inventory/list', data)
  },
  getCurrentStore: ()=>{
    return request('/inventory/current')
  },

}
