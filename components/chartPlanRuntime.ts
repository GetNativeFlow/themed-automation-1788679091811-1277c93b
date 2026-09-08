/**
 * GENERATED — do not edit.
 *
 * Concatenated verbatim from the NativeFlow chart adapter's transform modules
 * so the plan built on device is byte-for-byte the plan built at export time.
 */
/* eslint-disable */

type ChartSpec = any;

const CHART_PALETTE_SIZE = 5;
const GIFTED_MAX_SERIES = 5;

function seriesSlotFor(index: number): string {
  return 'series.' + ((index % CHART_PALETTE_SIZE) + 1);
}


/**
 * The shapes `react-native-gifted-charts` actually consumes.
 *
 * Declared here rather than imported from the library: the Studio bundle never
 * loads gifted-charts (it only ships it into generated Expo apps), and the
 * transforms must stay pure, dependency-free and unit-testable.
 */

/** One datum in an inline series (`data`, `data2`, …) or a `dataSet` entry. */
export interface GiftedItem {
  value: number;
  /** Pre-formatted — gifted has no `formatXLabel`. */
  label?: string;
  /** Bar colour. NOTE: inside `stackData` the key is `color`, not this. */
  frontColor?: string;
  /** Line/area point colour. */
  dataPointColor?: string;
  /** Grouped bars: gap to the *next* bar. */
  spacing?: number;
  /** Gaps in a series. */
  hideDataPoint?: boolean;
}

/** A `stackData` row — stacked bars use a different shape entirely. */
export interface GiftedStackRow {
  label?: string;
  stacks: Array<{ value: number; color?: string; marginBottom?: number }>;
}

/** A `dataSet` entry — the multi-series form used above five series. */
export interface GiftedDataSetEntry {
  data: GiftedItem[];
  color?: string;
  /** Gradient start, when the spec asks for one. */
  startFillColor?: string;
  endFillColor?: string;
}

export interface GiftedSeriesArrays {
  /**
   * `inline` uses `data`/`data2`…`data5`; `dataSet` is the multi-series form
   * gifted requires past five series. Never silently drop a series.
   */
  mode: 'inline' | 'dataSet';
  /** Always present, even in `dataSet` mode (gifted still reads `data`). */
  data: GiftedItem[];
  data2?: GiftedItem[];
  data3?: GiftedItem[];
  data4?: GiftedItem[];
  data5?: GiftedItem[];
  dataSet?: GiftedDataSetEntry[];
  /** `color1`…`color5`, in series order. */
  colors: string[];
  seriesCount: number;
}

/** The triple gifted requires to keep its y-axis coherent. */
export interface GiftedAxisScale {
  maxValue: number;
  noOfSections: number;
  stepValue: number;
  /** Only set when the data goes below zero. */
  mostNegativeValue?: number;
  noOfSectionsBelowXAxis?: number;
}

/**
 * `resolveAxisScale` — the ONLY producer of `maxValue`, `noOfSections` and
 * `stepValue`.
 *
 * gifted-charts does not derive these from each other. If they disagree the
 * chart renders visibly wrong with no error at all — bars overflow the plot,
 * or the y-axis labels stop matching the bars. It is the single most reported
 * defect in the library.
 *
 * So the three are computed together, here, and the invariant
 * `maxValue === noOfSections * stepValue` holds by construction. No adapter
 * code, node prop or IR field may set any of them independently:
 * `ChartSpec.axes` carries `yMax`/`yTickCount` as *intent*, nothing more.
 */

/** Default section count when the spec expresses no intent. */
export const DEFAULT_SECTIONS = 4;

/** 1, 2, 2.5, 5, 10 × 10^k — the smallest "nice" step at or above `raw`. */
export function niceStep(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const exponent = Math.floor(Math.log10(raw));
  const magnitude = Math.pow(10, exponent);
  const scaled = raw / magnitude;
  const nice = [1, 2, 2.5, 5, 10].find((n) => scaled <= n + 1e-9) ?? 10;
  // Re-multiplying can leave float dust (0.30000000000000004); round to the
  // magnitude's precision so the invariant multiplication stays exact.
  return round(nice * magnitude, Math.max(0, -exponent + 2));
}

function round(value: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

export interface AxisScaleIntent {
  /** Author intent for the top of the axis. Never used verbatim. */
  yMax?: number;
  /** Author intent for the number of sections. */
  yTickCount?: number;
}

/** Every finite numeric value a spec's series contribute to the y-axis. */
export function specValues(spec: ChartSpec): number[] {
  const out: number[] = [];
  for (const series of spec.data.series) {
    for (const point of series.points) {
      if (point.stackValues?.length) {
        // A stacked bar's height is the sum of its segments.
        const positive = point.stackValues.filter((v) => v > 0).reduce((a, b) => a + b, 0);
        const negative = point.stackValues.filter((v) => v < 0).reduce((a, b) => a + b, 0);
        if (positive) out.push(positive);
        if (negative) out.push(negative);
        if (!positive && !negative) out.push(0);
        continue;
      }
      if (typeof point.value === 'number' && Number.isFinite(point.value)) out.push(point.value);
    }
  }
  return out;
}

/**
 * Derive the coherent triple from raw values.
 *
 * - Empty or all-null data still produces a drawable axis (0…sections).
 * - Negative data extends the axis below zero in whole `stepValue` units, so
 *   the invariant continues to hold on the negative side too.
 */
export function resolveAxisScale(values: number[], intent: AxisScaleIntent = {}): GiftedAxisScale {
  const finite = values.filter((v) => Number.isFinite(v));
  const sections = Math.max(1, Math.round(intent.yTickCount ?? DEFAULT_SECTIONS));

  const dataMax = finite.length ? Math.max(...finite) : 0;
  const dataMin = finite.length ? Math.min(...finite) : 0;

  const target = Math.max(intent.yMax ?? 0, dataMax, 0);
  const stepValue = target > 0 ? niceStep(target / sections) : niceStep(Math.abs(dataMin) / sections);
  const maxValue = round(stepValue * sections, 6);

  const scale: GiftedAxisScale = { maxValue, noOfSections: sections, stepValue };

  if (dataMin < 0) {
    const belowSections = Math.ceil(Math.abs(dataMin) / stepValue - 1e-9);
    scale.noOfSectionsBelowXAxis = belowSections;
    scale.mostNegativeValue = round(-belowSections * stepValue, 6);
  }

  return scale;
}

/** Convenience: derive the scale straight from a spec. */
export function resolveAxisScaleForSpec(spec: ChartSpec, intent: AxisScaleIntent = {}): GiftedAxisScale {
  return resolveAxisScale(specValues(spec), intent);
}

/** The invariant, as an assertable predicate. Used by the tests and the gate. */
export function axisScaleInvariantHolds(scale: GiftedAxisScale): boolean {
  const product = scale.noOfSections * scale.stepValue;
  if (Math.abs(product - scale.maxValue) > 1e-6) return false;
  if (scale.mostNegativeValue !== undefined) {
    const below = (scale.noOfSectionsBelowXAxis ?? 0) * scale.stepValue;
    if (Math.abs(below + scale.mostNegativeValue) > 1e-6) return false;
  }
  return true;
}

/**
 * `pivotToSeriesArrays` — row-major IR to column-major gifted series.
 *
 * ```text
 * ChartSpec.data.series (already column-major in the IR, one entry per series)
 *   ->  data  = [{ value, label }, …]      series 1
 *       data2 = [{ value, label }, …]      series 2
 *       …
 *       dataSet = [{ data, color }, …]     six series or more
 * ```
 *
 * The trap the brief calls out: gifted's inline form stops at `data5`. Passing
 * a sixth series inline drops it silently. Above five series this switches to
 * `dataSet`, which has no such ceiling.
 *
 * X labels are pre-formatted here because gifted has no `formatXLabel`.
 */

/** gifted's inline series ceiling. Beyond this the `dataSet` form is required. */
export const INLINE_SERIES_LIMIT = 5;

export interface PivotOptions {
  /** Resolved series colours, index-aligned with `spec.data.series`. */
  colors?: string[];
  /** Label formatter — applied here, since gifted cannot format at render. */
  formatLabel?: (label: string | undefined, index: number) => string | undefined;
  /** Force the multi-series form even below six series (tests, composed). */
  forceDataSet?: boolean;
}

function formatted(
  label: string | undefined,
  index: number,
  options: PivotOptions,
): string | undefined {
  const out = options.formatLabel ? options.formatLabel(label, index) : label;
  return out === undefined || out === null ? undefined : String(out);
}

/** One IR series to a gifted item array. Nulls become zero-valued gaps. */
export function seriesToItems(
  points: ChartSpec['data']['series'][number]['points'],
  seriesColor: string | undefined,
  options: PivotOptions = {},
): GiftedItem[] {
  return points.map((point, index) => {
    const item: GiftedItem = { value: typeof point.value === 'number' ? point.value : 0 };
    const label = formatted(point.label, index, options);
    if (label !== undefined) item.label = label;
    // Per-point authored colour wins over the series colour (task 4.6).
    const color = point.legacyLiteralColor || seriesColor;
    if (color) item.frontColor = color;
    if (point.value === null || point.value === undefined) item.hideDataPoint = true;
    return item;
  });
}

export function pivotToSeriesArrays(spec: ChartSpec, options: PivotOptions = {}): GiftedSeriesArrays {
  const colors = options.colors ?? [];
  const seriesList = spec.data.series;

  const items = seriesList.map((series, i) =>
    seriesToItems(series.points, series.legacyLiteralColor || colors[i], options),
  );

  const resolvedColors = seriesList.map((series, i) => series.legacyLiteralColor || colors[i] || colors[0] || '');
  const useDataSet = options.forceDataSet || items.length > INLINE_SERIES_LIMIT;

  const out: GiftedSeriesArrays = {
    mode: useDataSet ? 'dataSet' : 'inline',
    data: items[0] ?? [],
    colors: resolvedColors,
    seriesCount: items.length,
  };

  if (useDataSet) {
    out.dataSet = items.map((data, i) => {
      const entry: GiftedSeriesArrays['dataSet'][number] = { data };
      if (resolvedColors[i]) entry.color = resolvedColors[i];
      return entry;
    });
    return out;
  }

  if (items[1]) out.data2 = items[1];
  if (items[2]) out.data3 = items[2];
  if (items[3]) out.data4 = items[3];
  if (items[4]) out.data5 = items[4];
  return out;
}

/**
 * `toStackData` — stacked bars use a *different data shape*.
 *
 * `<BarChart stackData={…} />` takes rows of `{ label, stacks: [{ value,
 * color }] }`. The trap: inside `stacks` the colour key is **`color`**, not
 * `frontColor`. Using `frontColor` there produces default-coloured bars with
 * no error and no warning, which is why this transform exists on its own and
 * is tested on its own.
 */

export interface StackOptions {
  /** Resolved colours, one per stack segment index. */
  segmentColors?: string[];
  formatLabel?: (label: string | undefined, index: number) => string | undefined;
}

export function toStackData(spec: ChartSpec, options: StackOptions = {}): GiftedStackRow[] {
  const palette = options.segmentColors ?? [];
  const series = spec.data.series[0];
  if (!series) return [];

  return series.points.map((point, index) => {
    const label = options.formatLabel ? options.formatLabel(point.label, index) : point.label;
    const values = point.stackValues?.length
      ? point.stackValues
      : [typeof point.value === 'number' ? point.value : 0];

    const row: GiftedStackRow = {
      stacks: values.map((value, segment) => {
        const color = series.legacyLiteralPalette?.[segment] || palette[segment % (palette.length || 1)];
        // `color`, never `frontColor` — see the module comment.
        return color ? { value: Number(value) || 0, color } : { value: Number(value) || 0 };
      }),
    };
    if (label !== undefined && label !== null) row.label = String(label);
    return row;
  });
}

/**
 * `toGroupedBars` — grouped bars are NOT a first-class gifted feature.
 *
 * The library draws one flat array of bars. A "group" is faked by flattening
 * every series into that single array, ordered group by group, and controlling
 * the gaps:
 *
 * ```text
 * groups:   [A: s1 s2 s3]      [B: s1 s2 s3]
 * flat:      a1  a2  a3         b1  b2  b3
 * spacing:    2   2  GAP         2   2  GAP
 * label:     'A'  -   -         'B'   -   -
 * ```
 *
 * Rules encoded here, each of which fails silently when wrong:
 *  - `spacing: intra` on every member except the last of its group.
 *  - `spacing: gap` on the last member, separating it from the next group.
 *  - `label` only on the first member, otherwise every bar gets an x label.
 *  - per-item `frontColor`, since one array cannot carry per-series colour.
 *
 * This is the most fragile transform in the adapter, so it is also the most
 * heavily tested: two groups, five groups, uneven sizes, single-member groups,
 * one group, empty groups, null members and long labels.
 */

/** Gap between bars inside one group. */
export const INTRA_GROUP_SPACING = 2;
/** Gap between one group and the next. */
export const INTER_GROUP_SPACING = 24;

export interface GroupedOptions {
  colors?: string[];
  intraGroupSpacing?: number;
  interGroupSpacing?: number;
  formatLabel?: (label: string | undefined, index: number) => string | undefined;
}

export interface GroupedBars {
  data: GiftedItem[];
  /** Members per group, in group order. Drives the legend and the tests. */
  groupSizes: number[];
  /** Series colours actually used, in series order. */
  colors: string[];
}

/**
 * Group index = point index (a "group" is one x-category across all series).
 * Series with fewer points simply contribute no member to the later groups,
 * which is what produces uneven group sizes.
 */
export function toGroupedBars(spec: ChartSpec, options: GroupedOptions = {}): GroupedBars {
  const intra = options.intraGroupSpacing ?? INTRA_GROUP_SPACING;
  const gap = options.interGroupSpacing ?? INTER_GROUP_SPACING;
  const palette = options.colors ?? [];

  const seriesList = spec.data.series;
  const colors = seriesList.map((s, i) => s.legacyLiteralColor || palette[i % (palette.length || 1)] || '');
  const groupCount = seriesList.reduce((max, s) => Math.max(max, s.points.length), 0);

  const data: GiftedItem[] = [];
  const groupSizes: number[] = [];

  for (let g = 0; g < groupCount; g += 1) {
    const members = seriesList
      .map((series, si) => ({ point: series.points[g], si }))
      .filter((m) => m.point !== undefined);

    groupSizes.push(members.length);
    if (!members.length) continue;

    members.forEach(({ point, si }, memberIndex) => {
      const isLast = memberIndex === members.length - 1;
      const item: GiftedItem = {
        value: typeof point!.value === 'number' ? point!.value : 0,
        // Last member carries the inter-group gap, everyone else the intra gap.
        spacing: isLast ? gap : intra,
      };
      if (memberIndex === 0) {
        const raw = point!.label;
        const label = options.formatLabel ? options.formatLabel(raw, g) : raw;
        if (label !== undefined && label !== null) item.label = String(label);
      }
      const color = point!.legacyLiteralColor || colors[si];
      if (color) item.frontColor = color;
      if (point!.value === null || point!.value === undefined) item.hideDataPoint = true;
      data.push(item);
    });
  }

  return { data, groupSizes, colors };
}

/**
 * `toCumulativeStackedArea` — gifted has no `stackId`.
 *
 * A stacked area chart on the native lane is drawn as overlapping area series
 * whose values are **pre-summed**: series N is plotted at the running total of
 * series 1..N, so the visible band for series N is its own contribution.
 * The topmost band must therefore be drawn last, which is why the returned
 * arrays stay in series order and the adapter renders them in reverse.
 *
 * Two traps the tests pin down:
 *  - off-by-one accumulation (the first band must be the raw series, not zero),
 *  - negatives, which under accumulation can move a band *below* its
 *    predecessor. That is arithmetically correct but visually confusing, so
 *    the transform reports it rather than silently clamping.
 */

export interface CumulativeOptions {
  colors?: string[];
  formatLabel?: (label: string | undefined, index: number) => string | undefined;
}

export interface CumulativeStackedArea {
  /** One item array per series, values already accumulated. */
  series: GiftedItem[][];
  colors: string[];
  /** True when any series contributed a negative value. */
  hasNegativeContribution: boolean;
}

export function toCumulativeStackedArea(
  spec: ChartSpec,
  options: CumulativeOptions = {},
): CumulativeStackedArea {
  const palette = options.colors ?? [];
  const seriesList = spec.data.series;
  const pointCount = seriesList.reduce((max, s) => Math.max(max, s.points.length), 0);

  const running = new Array<number>(pointCount).fill(0);
  let hasNegativeContribution = false;

  const series = seriesList.map((entry, si) =>
    Array.from({ length: pointCount }, (_unused, i): GiftedItem => {
      const point = entry.points[i];
      const raw = typeof point?.value === 'number' && Number.isFinite(point.value) ? point.value : 0;
      if (raw < 0) hasNegativeContribution = true;
      running[i] += raw;

      const item: GiftedItem = { value: running[i] };
      const rawLabel = point?.label;
      const label = options.formatLabel ? options.formatLabel(rawLabel, i) : rawLabel;
      if (label !== undefined && label !== null) item.label = String(label);
      const color = point?.legacyLiteralColor || entry.legacyLiteralColor || palette[si % (palette.length || 1)];
      if (color) item.frontColor = color;
      if (point?.value === null || point?.value === undefined) item.hideDataPoint = true;
      return item;
    }),
  );

  return {
    series,
    colors: seriesList.map((s, i) => s.legacyLiteralColor || palette[i % (palette.length || 1)] || ''),
    hasNegativeContribution,
  };
}

/**
 * Bound-data rows to IR points (task 2.1).
 *
 * A chart whose `chartData` prop is bound to an API response has no data at
 * emit time, so the emitted plan cannot be the final one. The device runtime
 * receives the live array and rebuilds the plan through the very same
 * transforms the emitter uses — this file is part of the source shipped into
 * the generated app, so there is exactly one implementation.
 */

/** Raw API rows → IR points. Mirrors `toChartSpec`'s `toPoint` exactly. */
export function pointsFromRows(rows: unknown): ChartSpec['data']['series'][number]['points'] {
  if (!Array.isArray(rows)) return [];
  return rows.map((raw: any) => {
    const value = raw && typeof raw === 'object' ? raw.value : raw;
    const num = Number(value);
    const point: any = {
      value: value === null || value === undefined || value === '' || Number.isNaN(num) ? null : num,
    };
    if (raw && typeof raw === 'object') {
      if (typeof raw.label === 'string') point.label = raw.label;
      if (Array.isArray(raw.stackValues)) point.stackValues = raw.stackValues.map((v: unknown) => Number(v) || 0);
      if (typeof raw.frontColor === 'string' && raw.frontColor) point.legacyLiteralColor = raw.frontColor;
      if (typeof raw.gradientColor === 'string' && raw.gradientColor) {
        point.legacyLiteralGradientColor = raw.gradientColor;
      }
    }
    return point;
  });
}

/** `spec` with its first series replaced by live bound rows. */
export function specWithRows(spec: ChartSpec, rows: unknown): ChartSpec {
  if (!Array.isArray(rows)) return spec;
  const first = spec.data.series[0] || { id: `${spec.nodeId}:0`, points: [] };
  return {
    ...spec,
    data: {
      ...spec.data,
      series: [{ ...first, points: pointsFromRows(rows) }, ...spec.data.series.slice(1)],
    },
  };
}

/**
 * `buildGiftedPlan` — spec + resolved theme to a flat, serialisable prop bag.
 *
 * The transforms run **here, at emit time**, not on the device. The runtime
 * component shipped into a generated Expo app is deliberately dumb: it picks a
 * gifted component by `plan.component` and spreads `plan.props`. That is what
 * makes the emit path byte-identical on repeat render and keeps the fragile
 * pivot logic in one tested place instead of duplicated in a generated file.
 */

export interface GiftedLegendItem {
  label: string;
  color: string;
}

export interface GiftedPlan {
  nodeId: string;
  /** The gifted component to mount. */
  component: 'BarChart' | 'LineChart' | 'PieChart';
  width: number;
  height: number;
  title?: string;
  titleColor: string;
  backgroundColor?: string;
  /** Spread verbatim onto the gifted component. */
  props: Record<string, unknown>;
  legend?: { items: GiftedLegendItem[]; textColor: string };
  /** Diagnostics the adapter wants visible in the Studio, not on device. */
  notes: string[];
}

const COMPONENT_FOR: Record<ChartSpec['kind'], GiftedPlan['component']> = {
  bar: 'BarChart',
  'stacked-bar': 'BarChart',
  line: 'LineChart',
  area: 'LineChart',
  pie: 'PieChart',
};

function seriesColors(spec: ChartSpec, colors: Record<string, string>): string[] {
  return Array.from({ length: Math.max(spec.data.series.length, GIFTED_MAX_SERIES) }, (_v, i) =>
    colors[seriesSlotFor(i)]);
}

/** Text style objects, because gifted takes styles here — not colour strings. */
function textStyle(color: string, fontSize = 10) {
  return { color, fontSize };
}

export function buildGiftedPlan(spec: ChartSpec, colors: Record<string, string>): GiftedPlan {
  const palette = seriesColors(spec, colors);
  const notes: string[] = [];
  const scale = resolveAxisScaleForSpec(spec);

  const axisProps: Record<string, unknown> = spec.axes.hideAxes && spec.axes.hideRules
    ? { hideAxesAndRules: true }
    : {
        hideRules: spec.axes.hideRules,
        rulesColor: colors['chart.rules'],
        rulesType: 'solid',
        xAxisColor: colors['chart.axis'],
        yAxisColor: colors['chart.axis'],
        xAxisThickness: spec.axes.hideAxes ? 0 : 1,
        yAxisThickness: spec.axes.hideAxes ? 0 : 1,
      };

  const labelProps: Record<string, unknown> = {
    hideYAxisText: spec.axes.hideYLabels,
    yAxisTextStyle: textStyle(colors['chart.label.y']),
    xAxisLabelTextStyle: textStyle(colors['chart.label.x']),
  };

  const base: Record<string, unknown> = {
    width: spec.size.width,
    height: spec.size.height,
    isAnimated: spec.features.animate,
    ...axisProps,
    ...labelProps,
    ...scale,
  };

  const plan: GiftedPlan = {
    nodeId: spec.nodeId,
    component: COMPONENT_FOR[spec.kind],
    width: spec.size.width,
    height: spec.size.height,
    title: spec.title,
    titleColor: colors['chart.title'],
    backgroundColor: spec.colors.background?.kind === 'literal'
      ? spec.colors.background.value
      : colors['chart.background'],
    props: base,
    notes,
  };

  switch (spec.kind) {
    case 'stacked-bar': {
      plan.props = {
        ...base,
        // `stackData`, not `data` — and the colour key inside is `color`.
        stackData: toStackData(spec, { segmentColors: palette }),
        barWidth: spec.plot.barWidth,
        spacing: spec.plot.spacing,
        barBorderRadius: 4,
        showValuesOnTop: spec.plot.showValuesOnTop,
        topLabelTextStyle: textStyle(colors['chart.value']),
      };
      const depth = spec.data.series[0]?.points[0]?.stackValues?.length ?? 0;
      plan.legend = spec.features.legend
        ? {
            items: Array.from({ length: depth }, (_v, i) => ({
              label: `Series ${i + 1}`,
              color: spec.data.series[0]?.legacyLiteralPalette?.[i] || palette[i],
            })),
            textColor: colors['chart.legend.text'],
          }
        : undefined;
      break;
    }

    case 'bar': {
      const multi = spec.data.series.length > 1;
      if (multi) {
        // Grouped bars are not first class: one flat array plus spacing.
        const grouped = toGroupedBars(spec, { colors: palette });
        notes.push('Grouped bars are derived from a flat bar array with per-group spacing.');
        plan.props = {
          ...base,
          data: grouped.data,
          barWidth: spec.plot.barWidth,
          barBorderRadius: 4,
          showValuesOnTop: spec.plot.showValuesOnTop,
          topLabelTextStyle: textStyle(colors['chart.value']),
        };
        plan.legend = spec.features.legend
          ? {
              items: spec.data.series.map((s, i) => ({ label: s.id, color: grouped.colors[i] })),
              textColor: colors['chart.legend.text'],
            }
          : undefined;
      } else {
        const pivot = pivotToSeriesArrays(spec, { colors: palette });
        plan.props = {
          ...base,
          data: pivot.data,
          frontColor: pivot.colors[0] || palette[0],
          barWidth: spec.plot.barWidth,
          spacing: spec.plot.spacing,
          barBorderRadius: 4,
          showValuesOnTop: spec.plot.showValuesOnTop,
          topLabelTextStyle: textStyle(colors['chart.value']),
        };
      }
      break;
    }

    case 'line':
    case 'area': {
      const isArea = spec.kind === 'area';
      const stacked = isArea && spec.data.series.length > 1;
      const pivot = stacked
        ? undefined
        : pivotToSeriesArrays(spec, { colors: palette });

      const seriesArrays: Record<string, unknown> = {};
      if (stacked) {
        const cumulative = toCumulativeStackedArea(spec, { colors: palette });
        notes.push('Stacked area is derived from pre-summed cumulative series (gifted has no stackId).');
        if (cumulative.hasNegativeContribution) {
          notes.push('Negative values in a stacked area move a band below its predecessor.');
        }
        // Draw topmost band last so the smaller bands stay visible.
        cumulative.series.forEach((items, i) => {
          seriesArrays[i === 0 ? 'data' : `data${i + 1}`] = items;
          seriesArrays[`color${i + 1}`] = cumulative.colors[i];
          seriesArrays[`startFillColor${i + 1}`] = cumulative.colors[i];
          seriesArrays[`endFillColor${i + 1}`] = cumulative.colors[i];
        });
      } else if (pivot!.mode === 'dataSet') {
        seriesArrays.dataSet = pivot!.dataSet;
      } else {
        seriesArrays.data = pivot!.data;
        if (pivot!.data2) seriesArrays.data2 = pivot!.data2;
        if (pivot!.data3) seriesArrays.data3 = pivot!.data3;
        if (pivot!.data4) seriesArrays.data4 = pivot!.data4;
        if (pivot!.data5) seriesArrays.data5 = pivot!.data5;
        pivot!.colors.forEach((color, i) => {
          if (color) seriesArrays[`color${i + 1}`] = color;
        });
      }

      plan.props = {
        ...base,
        ...seriesArrays,
        curved: !!spec.plot.curved,
        areaChart: isArea,
        thickness: spec.plot.thickness,
        hideDataPoints: !spec.plot.showDataPoints,
        dataPointsColor: colors['chart.point'],
        dataPointsRadius: spec.plot.dataPointsRadius,
        focusedDataPointColor: colors['chart.point.border'],
        // Dashed rules: `strokeDashArray` — capital A on mobile. recharts
        // spells it `strokeDasharray`; a shared helper gets this wrong.
        strokeDashArray: undefined,
        ...(isArea
          ? {
              startFillColor: colors['chart.area.fill'],
              endFillColor: colors['chart.area.fill'],
              startOpacity: spec.plot.areaFillOpacity ?? 0.4,
              endOpacity: 0.05,
            }
          : {}),
        ...(spec.features.tooltip
          ? {
              pointerConfig: {
                pointerColor: colors['chart.point'],
                pointerStripColor: colors['chart.tooltip.background'],
                pointerStripWidth: 1,
                pointerLabelWidth: 90,
                pointerLabelHeight: 32,
                activatePointersOnLongPress: false,
              },
            }
          : {}),
      };

      plan.legend = spec.features.legend
        ? {
            items: spec.data.series.map((s, i) => ({ label: s.id, color: palette[i] })),
            textColor: colors['chart.legend.text'],
          }
        : undefined;
      break;
    }

    case 'pie': {
      const points = spec.data.series[0]?.points ?? [];
      plan.props = {
        data: points.map((point, i) => ({
          value: typeof point.value === 'number' ? point.value : 0,
          // Pie slices take `color`, not `frontColor`.
          color: point.legacyLiteralColor || palette[i % GIFTED_MAX_SERIES],
          text: point.label,
        })),
        radius: spec.size.radius,
        innerRadius: spec.plot.donut ? spec.size.innerRadius : 0,
        donut: !!spec.plot.donut,
        showText: !!spec.plot.showText,
        textColor: colors['chart.value'],
        textSize: spec.plot.textSize,
        isAnimated: spec.features.animate,
      };
      plan.legend = spec.features.legend
        ? {
            items: points.map((point, i) => ({
              label: point.label || `Slice ${i + 1}`,
              color: point.legacyLiteralColor || palette[i % GIFTED_MAX_SERIES],
            })),
            textColor: colors['chart.legend.text'],
          }
        : undefined;
      break;
    }
  }

  // Drop undefined so the serialised plan is stable and compact.
  plan.props = Object.fromEntries(Object.entries(plan.props).filter(([, v]) => v !== undefined));
  return plan;
}
