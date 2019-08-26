const WXAPI = require('../../wxapi/main')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    companyPhone: '',
    companyAddress: ''
  },
  getCompanyInfo(){
    WXAPI.getCompanyInfo().then(res=>{
      this.setData({
        companyPhone: res.data.phone||'0736 - 4388889',
        companyAddress: res.data.address|| '安乡县深柳镇工业园柏力园中园8栋'
      })
    })
  },
  call(){
    wx.makePhoneCall({
      phoneNumber: this.data.companyPhone
    })
  },
  copyAddress(){
    wx.setClipboardData({
      data: this.data.companyAddress
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCompanyInfo()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})
