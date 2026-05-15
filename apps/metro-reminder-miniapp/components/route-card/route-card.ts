Component({
  properties: {
    routeId: String,
    name: String,
    summary: String
  },
  methods: {
    handleTap() {
      this.triggerEvent('start', { routeId: this.properties.routeId });
    }
  }
});
