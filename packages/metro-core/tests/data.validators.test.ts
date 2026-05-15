import { describe, expect, it } from 'vitest';
import { validateMetroDataSet, wuhanMetroData } from '../src';

describe('wuhanMetroData', () => {
  it('uses the MVP data version and line ids', () => {
    expect(wuhanMetroData.version).toBe('wuhan-metro-core-2026-05');
    expect(wuhanMetroData.lines.map((line) => line.id)).toEqual([
      'wuhan-line-1',
      'wuhan-line-2',
      'wuhan-line-4',
      'wuhan-line-6',
      'wuhan-line-8'
    ]);
  });

  it('passes validation', () => {
    expect(validateMetroDataSet(wuhanMetroData)).toEqual([]);
  });

  it('contains complete station counts for the MVP lines', () => {
    const stationCounts = Object.fromEntries(
      wuhanMetroData.lines.map((line) => [line.id, line.directions[0].stationIds.length])
    );

    expect(stationCounts).toEqual({
      'wuhan-line-1': 32,
      'wuhan-line-2': 38,
      'wuhan-line-4': 37,
      'wuhan-line-6': 32,
      'wuhan-line-8': 26
    });
  });

  it('uses shared station ids for MVP transfer stations', () => {
    const stationsByName = new Map(wuhanMetroData.stations.map((station) => [station.name, station]));

    expect(stationsByName.get('循礼门')?.lineIds).toEqual(expect.arrayContaining(['wuhan-line-1', 'wuhan-line-2']));
    expect(stationsByName.get('洪山广场')?.lineIds).toEqual(expect.arrayContaining(['wuhan-line-2', 'wuhan-line-4']));
    expect(stationsByName.get('江汉路')?.lineIds).toEqual(expect.arrayContaining(['wuhan-line-2', 'wuhan-line-6']));
    expect(stationsByName.get('宏图大道')?.lineIds).toEqual(expect.arrayContaining(['wuhan-line-2', 'wuhan-line-8']));
    expect(stationsByName.get('岳家嘴')?.lineIds).toEqual(expect.arrayContaining(['wuhan-line-4', 'wuhan-line-8']));
    expect(stationsByName.get('钟家村')?.lineIds).toEqual(expect.arrayContaining(['wuhan-line-4', 'wuhan-line-6']));
  });

  it('keeps the first real test route stations in the correct direction order', () => {
    const line8ToJunyuncun = wuhanMetroData.lines.find((line) => line.id === 'wuhan-line-8')!.directions[0].stationIds;
    const line4ToBailin = wuhanMetroData.lines.find((line) => line.id === 'wuhan-line-4')!.directions[1].stationIds;
    const line6ToDongfenggongsi = wuhanMetroData.lines.find((line) => line.id === 'wuhan-line-6')!.directions[0].stationIds;

    expect(line8ToJunyuncun.slice(line8ToJunyuncun.indexOf('wuhan-8-wangjiadun'), line8ToJunyuncun.indexOf('wuhan-4-yuejiazui') + 1)).toEqual([
      'wuhan-8-wangjiadun',
      'wuhan-4-yuejiazui'
    ]);
    expect(line4ToBailin.slice(line4ToBailin.indexOf('wuhan-4-yuejiazui'), line4ToBailin.indexOf('wuhan-4-zhongjiacun') + 1)).toEqual([
      'wuhan-4-yuejiazui',
      'wuhan-4-dongting',
      'wuhan-4-qingyuzui',
      'wuhan-4-chuhehanjie',
      'wuhan-2-hongshanguangchang',
      'wuhan-2-zhongnanlu',
      'wuhan-4-meiyuanxiaoqu',
      'wuhan-4-wuchanghuochezhan',
      'wuhan-4-shouyilu',
      'wuhan-4-fuxinglu',
      'wuhan-4-lanjianglu',
      'wuhan-4-zhongjiacun'
    ]);
    expect(line6ToDongfenggongsi.slice(line6ToDongfenggongsi.indexOf('wuhan-4-zhongjiacun'), line6ToDongfenggongsi.indexOf('wuhan-6-guobozhongxinbei') + 1)).toEqual([
      'wuhan-4-zhongjiacun',
      'wuhan-6-mayinglu',
      'wuhan-6-jiangang',
      'wuhan-6-qianjincun',
      'wuhan-6-guobozhongxinbei'
    ]);
  });
});
