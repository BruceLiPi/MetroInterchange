# Wuhan Metro Data Checklist

Data version: `wuhan-metro-core-2026-05`

MVP lines:

- Line 1
- Line 2
- Line 4
- Line 6
- Line 8

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

Reference sources for manual cross-checking:

- MetroMan Wuhan lines: https://www.metroman.cn/cities/wuhan/lines
- MetroMan Wuhan stations: https://www.metroman.cn/cities/wuhan/stations
- Wuhan Metro official or operator-published line map available at implementation time.
