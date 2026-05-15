import { describe, expect, it } from 'vitest';
import { buildRoutePlan } from '../src';
import type { Route } from '../src';

const realTestRoute: Route = {
  id: 'route-real-test',
  name: '汪家墩到国博中心北',
  kind: 'fixed',
  segments: [
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
  ],
  createdAt: 1,
  updatedAt: 1
};

describe('buildRoutePlan', () => {
  it('builds ordered steps and transfer targets for the real test route', () => {
    const plan = buildRoutePlan(realTestRoute);

    expect(plan.steps.map((step) => step.toStationId)).toEqual([
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
      'wuhan-4-zhongjiacun',
      'wuhan-6-mayinglu',
      'wuhan-6-jiangang',
      'wuhan-6-qianjincun',
      'wuhan-6-guobozhongxinbei'
    ]);
    expect(plan.targets.map((target) => ({ stationId: target.stationId, kind: target.kind, transferToLineId: target.transferToLineId }))).toEqual([
      { stationId: 'wuhan-4-yuejiazui', kind: 'transfer', transferToLineId: 'wuhan-line-4' },
      { stationId: 'wuhan-4-zhongjiacun', kind: 'transfer', transferToLineId: 'wuhan-line-6' },
      { stationId: 'wuhan-6-guobozhongxinbei', kind: 'destination', transferToLineId: undefined }
    ]);
  });

  it('throws when the destination is not reachable in the selected direction', () => {
    const invalidRoute: Route = {
      ...realTestRoute,
      segments: [
        {
          ...realTestRoute.segments[0]!,
          toStationId: 'wuhan-8-jintanlu'
        }
      ]
    };

    expect(() => buildRoutePlan(invalidRoute)).toThrow('Station wuhan-8-jintanlu is not reachable on line wuhan-line-8');
  });
});

