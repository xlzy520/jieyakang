// 小程序开发api接口工具包，https://github.com/gooking/wxapi
// const API_BASE_URL = 'https://api.it120.cc/jieyakang/'
const API_BASE_URL_XCX = 'https://www.easy-mock.com/mock/5ced4b17d564921f45a737c3/xcx'
const API_BASE_URL_ADMIN = 'https://www.easy-mock.com/mock/5cdb6b1c196b3a1793f9fcad/admin'

const request = (url,data,method='post') => {
  let _url = 'https://api.it120.cc/jieyakang/' + url
  return new Promise((resolve, reject) => {
    wx.request({
      url: _url,
      method: method==='formdata'?'post': method,
      data: data,
      header: {
        'Content-Type': method==='formdata'?'application/x-www-form-urlencoded':'application/json'
      },
      success(request) {
        resolve(request.data)
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
const request_xcx = (url,data,method='post') => {
  let _url = API_BASE_URL_XCX + url
  return new Promise((resolve, reject) => {
    wx.request({
      url: _url,
      method: method==='formdata'?'post': method,
      data: Object.assign(data, {
        token: wx.getStorageSync('token')
      }),
      header: {
        'Content-Type': method==='formdata'?'application/x-www-form-urlencoded':'application/json'
      },
      success(request) {
        resolve(request.data)
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
const request_admin = (url,data,method='post') => {
  let _url = API_BASE_URL_ADMIN + url
  return new Promise((resolve, reject) => {
    wx.request({
      url: _url,
      method: method==='formdata'?'post': method,
      data: data,
      header: {
        'Content-Type': method==='formdata'?'application/x-www-form-urlencoded':'application/json'
      },
      success(request) {
        resolve(request.data)
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
    return request('/pay/wx/wxapp', data)
  },
  login: (code) => {
    return request('/user/wxapp/login', {
      code,
      type: 2
    }, 'formdata')
  },
  register: (data) => {
    return request('/user/wxapp/register/complex', data)
  },
  banners: (data) => {
    return request('/banner/list', 'get', data)
  },
  goods: (data) => {
    return request_xcx('/goods/list', data)
  },
  goodsDetail: (id) => {
    return request('/shop/goods/detail', 'get', {
      id
    })
  },
  goodsPrice: (data) => {
    return request('/shop/goods/price', data)
  },
  addAddress: (data) => {
    return request('/user/shipping-address/add', data)
  },
  updateAddress: (data) => {
    return request('/user/shipping-address/update', data)
  },
  deleteAddress: (id, token) => {
    return request('/user/shipping-address/delete', {
      id,
      token
    })
  },
  queryAddress: (token) => {
    return request('/user/shipping-address/list', 'get', {
      token
    })
  },
  defaultAddress: (token) => {
    return request('/user/shipping-address/default', 'get', {
      token
    })
  },
  addressDetail: (id, token) => {
    return request('/user/shipping-address/detail', 'get', {
      id,
      token
    })
  },
  userDetail: (token) => {
    return request('/user/detail', 'get', {
      token
    })
  },
  userAmount: (token) => {
    return request('/user/amount', 'get', {
      token
    })
  },
  orderCreate: (data) => {
    return request('/order/create', data)
  },
  orderList: (data) => {
    return request('/order/list', data)
  },
  orderDetail: (id, token) => {
    return request('/order/detail', 'get', {
      id,
      token
    })
  },
  orderDelivery: (orderId, token) => {
    return request('/order/delivery', {
      orderId,
      token
    })
  },
  orderReputation: (data) => {
    return request('/order/reputation', data)
  },
  orderClose: (orderId, token) => {
    return request('/order/close', {
      orderId,
      token
    })
  },
  orderPay: (orderId, token) => {
    return request('/order/pay', {
      orderId,
      token
    })
  },
  orderStatistics: (token) => {
    return request('/order/statistics', 'get', {
      token
    })
  },
  withDrawApply: (money, token) => {
    return request('/user/withDraw/apply', {
      money,
      token
    })
  },
  cashLogs: (data) => {
    return request('/user/cashLog', data)
  },
  rechargeSendRules: () => {
    return request('/user/recharge/send/rule', 'get')
  },
  getPartner: () => {
    return request_admin('/partner/list')
  },
  getCompanyInfo: ()=>{
    return request_admin('/company/getInfo')
  }
}
