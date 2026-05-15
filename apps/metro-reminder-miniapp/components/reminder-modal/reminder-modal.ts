Component({
  properties: {
    visible: Boolean,
    title: String,
    body: String
  },
  methods: {
    handleConfirm() {
      this.triggerEvent('confirm');
    }
  }
});
