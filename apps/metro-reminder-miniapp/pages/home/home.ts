import { loadLocalState } from '../../services/localStore';

Page({
  data: {
    routes: [] as Array<{ id: string; name: string; summary: string }>
  },
  onShow() {
    const state = loadLocalState();
    this.setData({
      routes: state.routes.map((route) => ({
        id: route.id,
        name: route.name,
        summary: route.kind === 'fixed' ? '固定路线' : '临时路线'
      }))
    });
  },
  handleStartRoute(event: WechatMiniprogram.CustomEvent<{ routeId: string }>) {
    wx.navigateTo({ url: `/pages/trip-confirm/trip-confirm?routeId=${event.detail.routeId}` });
  },
  handleTemporaryRoute() {
    wx.navigateTo({ url: '/pages/route-edit/route-edit?kind=temporary' });
  },
  handleCreateRoute() {
    wx.navigateTo({ url: '/pages/route-edit/route-edit?kind=fixed' });
  }
});
