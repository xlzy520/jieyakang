const baseUrl = 'https://axjieyakang.com/market'
// const baseUrl = 'http://auv4nb.natappfree.cc/market'

const imgBaseUrl = 'https://axjieyakang.com/assets/'

const patchImaUrl = (data)=>{
  if (data === null) {
    return ''
  }
  if (data.fileUrls&&data.fileUrls.length>0) {
    data.fileUrls = data.fileUrls.map(v=>imgBaseUrl+v)
  }
  if (data.littleUrl) {
    data.littleUrl = imgBaseUrl + data.littleUrl
  }
  if (data.list&&data.list.length>0) {
    data.list.map(v=>{
      if (v.fileUrl) {
        v.fileUrl = imgBaseUrl+ v.fileUrl
      }
      if (v.fileUrls&&v.fileUrls.length>0) {
        v.fileUrls = v.fileUrls.map(fileUrl=>imgBaseUrl+ fileUrl)
      }
    })
  }
  return data
}

let tokenError = false
// todo 统一处理 正确错误、token过期
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
      success:(res)=> {
        const { data, success, code, msg } = res.data
        if (success){
          // 图片默认补充路径
          res.data.data = patchImaUrl(data)
          resolve(res.data)
        } else {
          if (code === 1027) {
            wx.showLoading({
              title: '正在登录...'
            })
            wx.removeStorageSync('token')
            if (!tokenError) {
              handleLoginExpire()
              tokenError = true
            }
          } else {
            wx.showModal({
              title: '错误',
              content: msg|| '请重新登陆',
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

const handleLoginExpire = () =>{
  wx.login({
    success: resWXLogin=> {
      request('/login', {
        username: resWXLogin.code,
        password: resWXLogin.code
      }, 'formdata').then(resLogin=> {
        wx.setStorageSync('token', resLogin.data.appToken)
        if (resLogin.data.isFirst) {
          setTimeout(() => {
            wx.navigateTo({
              url: "/pages/authorize/index"
            })
          }, 500)
        }
        wx.reLaunch({
          url: "/pages/index/index"
        })
      }).catch(err=>{
        wx.showModal({
          title: '提示',
          content: err.msg||'无法登录，请重试',
          showCancel: false
        })
      }).finally(()=>{
        wx.hideLoading();
      })
    }
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
  addressDetail: (data) => {
    return request('/address/detail',data)
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
  orderComplete: data => {
    return request('/order/complete', data)
  },
  orderClose: data => {
    return request('/order/close', data)
  },
  getOrderAmount: data=>{
    return request('/order/amount/count', data)
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
