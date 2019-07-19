Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    tabList: {
      type: Array,
      value: []
    },
    currentTab: {
      type: Number,
      value: 0
    }
  },
  data: {
  
  },
  methods: {
    navTap(e) {
      const tabIndex = e.currentTarget.dataset.index
      this.triggerEvent('change', tabIndex)
    }
  }
})
