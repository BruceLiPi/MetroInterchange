import type { MetroDataSet } from '../types';

export const wuhanMetroData: MetroDataSet = {
  version: 'wuhan-metro-core-2026-05',
  city: 'wuhan',
  defaultSegmentSeconds: 120,
  defaultTransferSeconds: 300,
  stations: [
    { id: 'wuhan-1-hankoubei', name: '汉口北', lineIds: ['wuhan-line-1'] },
    { id: 'wuhan-1-xunlimen', name: '循礼门', lineIds: ['wuhan-line-1', 'wuhan-line-2'] },
    { id: 'wuhan-1-dongwudadao', name: '东吴大道', lineIds: ['wuhan-line-1'] },
    { id: 'wuhan-2-tianhejichang', name: '天河机场', lineIds: ['wuhan-line-2'] },
    { id: 'wuhan-8-hongtudadao', name: '宏图大道', lineIds: ['wuhan-line-2', 'wuhan-line-8'] },
    { id: 'wuhan-2-jianghanlu', name: '江汉路', lineIds: ['wuhan-line-2', 'wuhan-line-6'] },
    { id: 'wuhan-2-hongshanguangchang', name: '洪山广场', lineIds: ['wuhan-line-2', 'wuhan-line-4'] },
    { id: 'wuhan-2-fuzuling', name: '佛祖岭', lineIds: ['wuhan-line-2'] },
    { id: 'wuhan-4-yuejiazui', name: '岳家嘴', lineIds: ['wuhan-line-4', 'wuhan-line-8'] },
    { id: 'wuhan-4-zhongjiacun', name: '钟家村', lineIds: ['wuhan-line-4', 'wuhan-line-6'] },
    { id: 'wuhan-4-huangjinkou', name: '黄金口', lineIds: ['wuhan-line-4'] },
    { id: 'wuhan-4-wuhanhuochezhan', name: '武汉火车站', lineIds: ['wuhan-line-4'] },
    { id: 'wuhan-6-xinchengshiyilu', name: '新城十一路', lineIds: ['wuhan-line-6'] },
    { id: 'wuhan-6-guobozhongxinbei', name: '国博中心北', lineIds: ['wuhan-line-6'] },
    { id: 'wuhan-6-dongfenggongsi', name: '东风公司', lineIds: ['wuhan-line-6'] },
    { id: 'wuhan-8-jintanlu', name: '金潭路', lineIds: ['wuhan-line-8'] },
    { id: 'wuhan-8-wangjiadun', name: '汪家墩', lineIds: ['wuhan-line-8'] },
    { id: 'wuhan-8-junyuncun', name: '军运村', lineIds: ['wuhan-line-8'] }
  ],
  lines: [
    {
      id: 'wuhan-line-1',
      name: '1号线',
      color: '#0066B3',
      directions: [
        { terminalStationId: 'wuhan-1-dongwudadao', stationIds: ['wuhan-1-hankoubei', 'wuhan-1-xunlimen', 'wuhan-1-dongwudadao'] },
        { terminalStationId: 'wuhan-1-hankoubei', stationIds: ['wuhan-1-dongwudadao', 'wuhan-1-xunlimen', 'wuhan-1-hankoubei'] }
      ]
    },
    {
      id: 'wuhan-line-2',
      name: '2号线',
      color: '#E31837',
      directions: [
        { terminalStationId: 'wuhan-2-fuzuling', stationIds: ['wuhan-2-tianhejichang', 'wuhan-8-hongtudadao', 'wuhan-1-xunlimen', 'wuhan-2-jianghanlu', 'wuhan-2-hongshanguangchang', 'wuhan-2-fuzuling'] },
        { terminalStationId: 'wuhan-2-tianhejichang', stationIds: ['wuhan-2-fuzuling', 'wuhan-2-hongshanguangchang', 'wuhan-2-jianghanlu', 'wuhan-1-xunlimen', 'wuhan-8-hongtudadao', 'wuhan-2-tianhejichang'] }
      ]
    },
    {
      id: 'wuhan-line-4',
      name: '4号线',
      color: '#78BE20',
      directions: [
        { terminalStationId: 'wuhan-4-wuhanhuochezhan', stationIds: ['wuhan-4-huangjinkou', 'wuhan-4-zhongjiacun', 'wuhan-2-hongshanguangchang', 'wuhan-4-yuejiazui', 'wuhan-4-wuhanhuochezhan'] },
        { terminalStationId: 'wuhan-4-huangjinkou', stationIds: ['wuhan-4-wuhanhuochezhan', 'wuhan-4-yuejiazui', 'wuhan-2-hongshanguangchang', 'wuhan-4-zhongjiacun', 'wuhan-4-huangjinkou'] }
      ]
    },
    {
      id: 'wuhan-line-6',
      name: '6号线',
      color: '#007A53',
      directions: [
        { terminalStationId: 'wuhan-6-dongfenggongsi', stationIds: ['wuhan-6-xinchengshiyilu', 'wuhan-2-jianghanlu', 'wuhan-4-zhongjiacun', 'wuhan-6-guobozhongxinbei', 'wuhan-6-dongfenggongsi'] },
        { terminalStationId: 'wuhan-6-xinchengshiyilu', stationIds: ['wuhan-6-dongfenggongsi', 'wuhan-6-guobozhongxinbei', 'wuhan-4-zhongjiacun', 'wuhan-2-jianghanlu', 'wuhan-6-xinchengshiyilu'] }
      ]
    },
    {
      id: 'wuhan-line-8',
      name: '8号线',
      color: '#9B5BA5',
      directions: [
        { terminalStationId: 'wuhan-8-junyuncun', stationIds: ['wuhan-8-jintanlu', 'wuhan-8-hongtudadao', 'wuhan-8-wangjiadun', 'wuhan-4-yuejiazui', 'wuhan-8-junyuncun'] },
        { terminalStationId: 'wuhan-8-jintanlu', stationIds: ['wuhan-8-junyuncun', 'wuhan-4-yuejiazui', 'wuhan-8-wangjiadun', 'wuhan-8-hongtudadao', 'wuhan-8-jintanlu'] }
      ]
    }
  ],
  segmentTimes: []
};
