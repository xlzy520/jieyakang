Component({
  options: {
    multipleSlots: true
  },
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    text: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: ''
    }
  },
  data: {
  
  },
  methods: {
    close() {
      this.triggerEvent('close')
    },
    confirm() {
      this.triggerEvent('confirm')
    },
    addAddress() {
      wx.navigateTo({
        url: "/pages/address-add/index"
      })
    }
  }
})
