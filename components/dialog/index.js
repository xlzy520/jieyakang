Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    type: {
      type: String,
      value: 'warning' //
    },
    text: {
      type: String,
      value: ''
    }
  },
  data: {
  
  },
  methods: {
    close(){
      this.triggerEvent('close')
    },
    addAddress(){
      wx.navigateTo({
        url: "/pages/address-add/index"
      })
    }
  }
})
