import { createTrip, wuhanMetroData, type Route } from '../../../services/coreAdapter';
import { loadLocalState, saveLocalState } from '../../../services/localStore';

function stationName(stationId?: string): string {
  if (!stationId) return '';
  return wuhanMetroData.stations.find((station) => station.id === stationId)?.name ?? stationId;
}

Page({
  data: {
    route: undefined as Route | undefined,
    boardingStationName: '',
    directionName: '',
    nextStationName: ''
  },
  onLoad(query) {
    const state = loadLocalState();
    const route = state.routes.find((item) => item.id === query.routeId);
    if (!route) {
      wx.showToast({ title: '路线不存在', icon: 'none' });
      wx.navigateBack();
      return;
    }

    const trip = createTrip(route, Date.now());
    const firstSegment = route.segments[0]!;
    this.setData({
      route,
      boardingStationName: stationName(trip.currentStationId),
      directionName: stationName(firstSegment.directionTerminalStationId),
      nextStationName: stationName(trip.nextStationId)
    });
  },
  handleStart() {
    if (!this.data.route) return;
    const state = loadLocalState();
    saveLocalState({ ...state, recentRouteId: this.data.route.id });
    wx.navigateTo({ url: `/subpackages/travel/trip/trip?routeId=${this.data.route.id}` });
  }
});
