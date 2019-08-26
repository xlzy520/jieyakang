const WXAPI = require('../wxapi/main')

function goLoginPageTimeOut() {
  setTimeout(() => {
    wx.navigateTo({
      url: "/pages/authorize/index"
    })
  }, 500)
}
function login() {
  wx.login({
    success: res => {
      WXAPI.login(res.code).then(res => {
        wx.setStorageSync('token', res.data.appToken)
        if (res.data.isFirst) {
          this.goLoginPageTimeOut();
        }
      }).catch(err => {
        wx.showModal({
          title: '提示',
          content: err.msg || '无法登录，请重试',
          showCancel: false
        })
      }).finally(() => {
        wx.hideLoading();
      })
    }
  })
}
function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

module.exports = {
  parseTime: parseTime,
  login: login,
  goLoginPageTimeOut: goLoginPageTimeOut
}
