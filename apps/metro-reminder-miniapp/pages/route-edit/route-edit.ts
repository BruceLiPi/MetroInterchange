import { loadLocalState, saveLocalState } from '../../services/localStore';
import { wuhanMetroData, type Route } from '../../services/coreAdapter';

function stationsForLine(lineIndex: number) {
  const line = wuhanMetroData.lines[lineIndex] ?? wuhanMetroData.lines[0]!;
  return line.directions[0].stationIds.map((stationId) => wuhanMetroData.stations.find((station) => station.id === stationId)!).filter(Boolean);
}

Page({
  data: {
    kind: 'fixed' as 'fixed' | 'temporary',
    name: '上班',
    lines: wuhanMetroData.lines,
    stations: stationsForLine(0),
    selectedLineIndex: 0,
    startStationIndex: 0,
    endStationIndex: 1,
    selectedLineName: wuhanMetroData.lines[0]!.name,
    startStationName: stationsForLine(0)[0]!.name,
    endStationName: stationsForLine(0)[1]!.name,
    transferNote: ''
  },
  onLoad(query) {
    this.setData({ kind: query.kind === 'temporary' ? 'temporary' : 'fixed' });
  },
  handleNameInput(event: WechatMiniprogram.Input) {
    this.setData({ name: event.detail.value });
  },
  handleLineChange(event: WechatMiniprogram.PickerChange) {
    const selectedLineIndex = Number(event.detail.value);
    const stations = stationsForLine(selectedLineIndex);
    this.setData({
      selectedLineIndex,
      stations,
      startStationIndex: 0,
      endStationIndex: Math.min(1, stations.length - 1),
      selectedLineName: this.data.lines[selectedLineIndex]!.name,
      startStationName: stations[0]!.name,
      endStationName: stations[Math.min(1, stations.length - 1)]!.name
    });
  },
  handleStartChange(event: WechatMiniprogram.PickerChange) {
    const startStationIndex = Number(event.detail.value);
    this.setData({ startStationIndex, startStationName: this.data.stations[startStationIndex]!.name });
  },
  handleEndChange(event: WechatMiniprogram.PickerChange) {
    const endStationIndex = Number(event.detail.value);
    this.setData({ endStationIndex, endStationName: this.data.stations[endStationIndex]!.name });
  },
  handleNoteInput(event: WechatMiniprogram.Input) {
    this.setData({ transferNote: event.detail.value });
  },
  handleSave() {
    const line = this.data.lines[this.data.selectedLineIndex]!;
    const startStation = this.data.stations[this.data.startStationIndex]!;
    const endStation = this.data.stations[this.data.endStationIndex]!;
    const state = loadLocalState();
    const now = Date.now();
    const route: Route = {
      id: `route-${now}`,
      name: this.data.name,
      kind: this.data.kind,
      segments: [
        {
          lineId: line.id,
          fromStationId: startStation.id,
          toStationId: endStation.id,
          directionTerminalStationId: line.directions[0].terminalStationId,
          ...(this.data.transferNote ? { transferNote: this.data.transferNote } : {})
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    saveLocalState({ ...state, routes: [...state.routes, route], recentRouteId: route.id });
    wx.navigateBack();
  }
});
