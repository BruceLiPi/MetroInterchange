import { describe, expect, it } from 'vitest';
import { findRouteOptions } from '../src';

describe('findRouteOptions', () => {
  it('returns a direct option when start and destination are on the same line', () => {
    const options = findRouteOptions({
      startLineId: 'wuhan-line-1',
      startStationId: 'wuhan-1-jinghe',
      endLineId: 'wuhan-line-1',
      endStationId: 'wuhan-1-hankoubei'
    });

    expect(options).toHaveLength(1);
    expect(options[0]!.kind).toBe('direct');
    expect(options[0]!.segments).toEqual([
      {
        lineId: 'wuhan-line-1',
        fromStationId: 'wuhan-1-jinghe',
        toStationId: 'wuhan-1-hankoubei',
        directionTerminalStationId: 'wuhan-1-hankoubei'
      }
    ]);
  });

  it('returns one-transfer options shared by the selected lines', () => {
    const options = findRouteOptions({
      startLineId: 'wuhan-line-8',
      startStationId: 'wuhan-8-wangjiadun',
      endLineId: 'wuhan-line-4',
      endStationId: 'wuhan-4-zhongjiacun'
    });

    expect(options.map((option) => option.transferStationId)).toEqual(['wuhan-4-yuejiazui']);
    expect(options[0]!.segments).toEqual([
      {
        lineId: 'wuhan-line-8',
        fromStationId: 'wuhan-8-wangjiadun',
        toStationId: 'wuhan-4-yuejiazui',
        directionTerminalStationId: 'wuhan-8-junyuncun'
      },
      {
        lineId: 'wuhan-line-4',
        fromStationId: 'wuhan-4-yuejiazui',
        toStationId: 'wuhan-4-zhongjiacun',
        directionTerminalStationId: 'wuhan-4-bailin'
      }
    ]);
  });

  it('returns two-transfer options ordered by the shortest station count', () => {
    const options = findRouteOptions({
      startLineId: 'wuhan-line-8',
      startStationId: 'wuhan-8-wangjiadun',
      endLineId: 'wuhan-line-6',
      endStationId: 'wuhan-6-guobozhongxinbei'
    });

    const realCommuteOption = options.find((option) =>
      option.transferStationIds?.join('|') === 'wuhan-4-yuejiazui|wuhan-4-zhongjiacun'
    );

    expect(realCommuteOption?.kind).toBe('two-transfer');
    expect(realCommuteOption?.segments).toEqual([
      {
        lineId: 'wuhan-line-8',
        fromStationId: 'wuhan-8-wangjiadun',
        toStationId: 'wuhan-4-yuejiazui',
        directionTerminalStationId: 'wuhan-8-junyuncun'
      },
      {
        lineId: 'wuhan-line-4',
        fromStationId: 'wuhan-4-yuejiazui',
        toStationId: 'wuhan-4-zhongjiacun',
        directionTerminalStationId: 'wuhan-4-bailin'
      },
      {
        lineId: 'wuhan-line-6',
        fromStationId: 'wuhan-4-zhongjiacun',
        toStationId: 'wuhan-6-guobozhongxinbei',
        directionTerminalStationId: 'wuhan-6-dongfenggongsi'
      }
    ]);
  });
});
