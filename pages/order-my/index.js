const wxpay = require('../../utils/pay.js')
const app = getApp()
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    // status从0到4,为 "待付款", "待发货", "待收货","待评价", "已完成"
    statusType: ["全部订单", "待付款", "待发货", "待收货", "已完成"],
    currentType: 0,
    tabClass: ["", "", "", "", ""],
    orderList: [],
    logisticsMap: {},
    goodsMap: {}
  },
  getAllOrder(){
    const token = wx.getStorageSync('token')
    const no_pay = WXAPI.orderList({token: token, status: 0})
    const no_transfer = WXAPI.orderList({token: token, status: 1})
    const no_confirm = WXAPI.orderList({token: token, status: 2})
    const success = WXAPI.orderList({token: token, status: 4})
    Promise.all([no_pay, no_transfer, no_confirm, success]).then(res=>{
      res.map(order =>{
        if (order.code === 0) {
          this.setData({
            orderList: this.data.orderList.concat(order.data.orderList),
            goodsMap: Object.assign(this.data.goodsMap, order.data.goodsMap),
            logisticsMap: Object.assign(this.data.logisticsMap, order.data.logisticsMap)
          })
        }
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
      currentType: e.currentTarget.dataset.index
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
      success(res) {
        if (res.confirm) {
          WXAPI.orderClose(orderId, wx.getStorageSync('token')).then((res)=> {
            if (res.code == 0) {
              this.onShow();
            }
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
        currentType: Number(options.type)
      });
    }
  },
  onReady() {
    // 生命周期函数--监听页面初次渲染完成

  },
  getOrderStatistics() {
    WXAPI.orderStatistics(wx.getStorageSync('token')).then((res)=> {
      if (res.code == 0) {
        let tabClass = this.data.tabClass;
        for (let i = 0; i < res.data.length; i++) {
          if (i < 4) {
            tabClass[i + 1] = res.data[i]>0? 'red-dot': ''
          } else {
            tabClass[i] = res.data[i]>0? 'red-dot': ''
          }
        }
        this.setData({
          tabClass: tabClass,
        });
      }
    })
  },
  onShow() {
    // 获取订单列表
    let status = this.data.currentType;
    switch (this.data.currentType) {
      case 0:
        status = 9;
        break;
      case 1:case 2:case 3:
      status = this.data.currentType - 1;
        break;
      case 4:
        status = 4;
        break;
      default:
        break;
    }
    const postData = {
      token: wx.getStorageSync('token'),
      status: status
    };
    this.getOrderStatistics();
    if (status !== 9) {
      WXAPI.orderList(postData).then((res)=> {
        if (res.code == 0) {
          this.setData({
            orderList: res.data.orderList,
            logisticsMap: res.data.logisticsMap,
            goodsMap: res.data.goodsMap
          });
        } else {
          this.setData({
            orderList: null,
            logisticsMap: {},
            goodsMap: {}
          });
        }
      })
    } else {
      this.getAllOrder()
    }
    
  },
  onHide() {
    // 生命周期函数--监听页面隐藏

  },
  onUnload() {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh() {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom() {
    // 页面上拉触底事件的处理函数

  }
})
