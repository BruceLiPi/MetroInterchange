# Wuhan Metro Data Checklist

Data version: `wuhan-metro-core-2026-05`

MVP lines:

- Line 1
- Line 2
- Line 4
- Line 6
- Line 8

Entered station counts:

- Line 1: 32 stations.
- Line 2: 38 stations.
- Line 4: 37 stations.
- Line 6: 32 stations.
- Line 8: 26 stations.

Verification rules:

- Confirm both terminal station names for each line.
- Confirm station order in both directions.
- Confirm interchange stations across the five MVP lines.
- Use one shared station ID for the same physical transfer station.
- Confirm line colors against a current Wuhan metro map.
- Keep default station time at 120 seconds.
- Keep default transfer time at 300 seconds.

First real test route:

- 汪家墩站 -> 岳家嘴站 -> 钟家村站 -> 国博中心北站.
- 8号线往军运村方向 -> 4号线往黄金口方向 -> 6号线往东风公司方向.

Implementation note:

- Current static data uses the complete Line 4 station order through 柏林. The test route's "往黄金口方向" is represented in code by the current full-line terminal direction `柏林`, because 黄金口 is now an intermediate station on that same direction.
- Shared station IDs are used for 循礼门, 大智路, 黄浦路, 码头潭公园, 宏图大道, 常青花园, 江汉路, 洪山广场, 中南路, 街道口, 岳家嘴, and 钟家村 where they connect MVP lines.
- The first real test route is covered by automated route-planning assertions.

Reference sources for manual cross-checking:

- MetroMan Wuhan lines: https://www.metroman.cn/cities/wuhan/lines
- MetroMan Wuhan stations: https://www.metroman.cn/cities/wuhan/stations
- Wuhan Metro official or operator-published line map available at implementation time.

Verification status:

- Static data validation: covered by `packages/metro-core/tests/data.validators.test.ts`.
- Real route planning: covered by `packages/metro-core/tests/routing.buildRoutePlan.test.ts`.
