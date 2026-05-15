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
        summary: route.kind === 'fixed' ? '\u56FA\u5B9A\u8DEF\u7EBF' : '\u4E34\u65F6\u8DEF\u7EBF'
      }))
    });
  },
  handleStartRoute(event: WechatMiniprogram.CustomEvent<{ routeId: string }>) {
    wx.navigateTo({ url: `/subpackages/travel/trip-confirm/trip-confirm?routeId=${event.detail.routeId}` });
  },
  handleTemporaryRoute() {
    wx.navigateTo({ url: '/subpackages/travel/route-edit/route-edit?kind=temporary' });
  },
  handleCreateRoute() {
    wx.navigateTo({ url: '/subpackages/travel/route-edit/route-edit?kind=fixed' });
  }
});
