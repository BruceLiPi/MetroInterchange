import { loadLocalState, saveLocalState } from '../../services/localStore';
import { findRouteOptions, wuhanMetroData, type Route, type RouteOption } from '../../services/coreAdapter';

interface RouteOptionView {
  id: string;
  title: string;
  body: string;
}

function stationsForLine(lineIndex: number) {
  const line = wuhanMetroData.lines[lineIndex] ?? wuhanMetroData.lines[0]!;
  return line.directions[0].stationIds.map((stationId) => wuhanMetroData.stations.find((station) => station.id === stationId)!).filter(Boolean);
}

function stationName(stationId?: string): string {
  if (!stationId) return '';
  return wuhanMetroData.stations.find((station) => station.id === stationId)?.name ?? stationId;
}

function lineName(lineId: string): string {
  return wuhanMetroData.lines.find((line) => line.id === lineId)?.name ?? lineId;
}

function optionTitle(option: RouteOption): string {
  if (option.kind === 'direct') return '\u76F4\u8FBE';
  const transferNames = (option.transferStationIds ?? [option.transferStationId]).filter(Boolean).map((stationId) => stationName(stationId));
  return `\u5728 ${transferNames.join('\u3001')} \u6362\u4E58`;
}

function optionBody(option: RouteOption): string {
  return option.segments
    .map((segment) => `${lineName(segment.lineId)} ${stationName(segment.fromStationId)} -> ${stationName(segment.toStationId)}\uFF08\u5F80${stationName(segment.directionTerminalStationId)}\uFF09`)
    .join('\uFF1B');
}

Page({
  data: {
    kind: 'fixed' as 'fixed' | 'temporary',
    name: '\u4E0A\u73ED',
    labels: {
      routeName: '\u8DEF\u7EBF\u540D\u79F0',
      startLine: '\u8D77\u70B9\u7EBF\u8DEF',
      startStation: '\u8D77\u70B9',
      endLine: '\u7EC8\u70B9\u7EBF\u8DEF',
      endStation: '\u7EC8\u70B9',
      transferNote: '\u6362\u4E58\u5907\u6CE8',
      routeOptions: '\u53EF\u9009\u8DEF\u7EBF',
      saveRoute: '\u4FDD\u5B58\u8DEF\u7EBF'
    },
    lines: wuhanMetroData.lines,
    startStations: stationsForLine(0),
    endStations: stationsForLine(0),
    selectedStartLineIndex: 0,
    selectedEndLineIndex: 0,
    startStationIndex: 0,
    endStationIndex: 1,
    selectedStartLineName: wuhanMetroData.lines[0]!.name,
    selectedEndLineName: wuhanMetroData.lines[0]!.name,
    startStationName: stationsForLine(0)[0]!.name,
    endStationName: stationsForLine(0)[1]!.name,
    transferNote: '',
    routeOptions: [] as RouteOptionView[],
    selectedOptionIndex: 0,
    routeOptionHint: '\u8BF7\u9009\u62E9\u8D77\u70B9\u548C\u7EC8\u70B9'
  },
  routeOptions: [] as RouteOption[],
  onLoad(query) {
    this.setData({ kind: query.kind === 'temporary' ? 'temporary' : 'fixed' });
    this.refreshRouteOptions();
  },
  handleNameInput(event: WechatMiniprogram.Input) {
    this.setData({ name: event.detail.value });
  },
  handleStartLineChange(event: WechatMiniprogram.PickerChange) {
    const selectedStartLineIndex = Number(event.detail.value);
    const startStations = stationsForLine(selectedStartLineIndex);
    this.setData({
      selectedStartLineIndex,
      startStations,
      startStationIndex: 0,
      selectedStartLineName: this.data.lines[selectedStartLineIndex]!.name,
      startStationName: startStations[0]!.name
    });
    this.refreshRouteOptions();
  },
  handleEndLineChange(event: WechatMiniprogram.PickerChange) {
    const selectedEndLineIndex = Number(event.detail.value);
    const endStations = stationsForLine(selectedEndLineIndex);
    this.setData({
      selectedEndLineIndex,
      endStations,
      endStationIndex: Math.min(1, endStations.length - 1),
      selectedEndLineName: this.data.lines[selectedEndLineIndex]!.name,
      endStationName: endStations[Math.min(1, endStations.length - 1)]!.name
    });
    this.refreshRouteOptions();
  },
  handleStartChange(event: WechatMiniprogram.PickerChange) {
    const startStationIndex = Number(event.detail.value);
    this.setData({ startStationIndex, startStationName: this.data.startStations[startStationIndex]!.name });
    this.refreshRouteOptions();
  },
  handleEndChange(event: WechatMiniprogram.PickerChange) {
    const endStationIndex = Number(event.detail.value);
    this.setData({ endStationIndex, endStationName: this.data.endStations[endStationIndex]!.name });
    this.refreshRouteOptions();
  },
  handleNoteInput(event: WechatMiniprogram.Input) {
    this.setData({ transferNote: event.detail.value });
  },
  handleOptionSelect(event: WechatMiniprogram.TouchEvent<{ index: string }>) {
    this.setData({ selectedOptionIndex: Number(event.currentTarget.dataset.index) });
  },
  refreshRouteOptions() {
    const startLine = this.data.lines[this.data.selectedStartLineIndex]!;
    const endLine = this.data.lines[this.data.selectedEndLineIndex]!;
    const startStation = this.data.startStations[this.data.startStationIndex]!;
    const endStation = this.data.endStations[this.data.endStationIndex]!;

    this.routeOptions = findRouteOptions({
      startLineId: startLine.id,
      startStationId: startStation.id,
      endLineId: endLine.id,
      endStationId: endStation.id
    });

    this.setData({
      routeOptions: this.routeOptions.map((option) => ({ id: option.id, title: optionTitle(option), body: optionBody(option) })),
      selectedOptionIndex: 0,
      routeOptionHint: startLine.id === endLine.id ? '\u5F53\u524D\u65B9\u5411\u4E0D\u53EF\u8FBE\uFF0C\u8BF7\u8C03\u6574\u8D77\u70B9\u6216\u7EC8\u70B9' : '\u6682\u672A\u627E\u5230\u6362\u4E58\u65B9\u6848'
    });
  },
  handleSave() {
    const selectedOption = this.routeOptions[this.data.selectedOptionIndex];
    if (!selectedOption) {
      wx.showToast({ title: '\u8BF7\u9009\u62E9\u53EF\u7528\u8DEF\u7EBF', icon: 'none' });
      return;
    }

    const state = loadLocalState();
    const now = Date.now();
    const route: Route = {
      id: `route-${now}`,
      name: this.data.name,
      kind: this.data.kind,
      segments: selectedOption.segments.map((segment, index) => ({
        ...segment,
        ...(index === 0 && this.data.transferNote ? { transferNote: this.data.transferNote } : {})
      })),
      createdAt: now,
      updatedAt: now
    };

    saveLocalState({ ...state, routes: [...state.routes, route], recentRouteId: route.id });
    wx.navigateBack();
  }
});
