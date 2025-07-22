"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  type LayoutType,
} from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// Define a type for the chart components
type ChartComponent =
  | typeof LineChart
  | typeof BarChart
  | typeof PieChart
  | typeof RadialBarChart
  | typeof AreaChart
  | typeof ScatterChart

// Define a type for the chart elements
type ChartElement = typeof Line | typeof Bar | typeof Area | typeof Scatter | typeof Pie | typeof RadialBar

type ChartProps = React.ComponentProps<typeof ChartContainer> & {
  /**
   * The type of chart to display.
   * @example "line", "bar", "pie", "radial", "area", "scatter"
   */
  chartType?: "line" | "bar" | "pie" | "radial" | "area" | "scatter"
  /**
   * The data for the chart.
   * @example [{ name: "Jan", uv: 400, pv: 2400 }]
   */
  data: Record<string, any>[]
  /**
   * The configuration for the chart.
   * @example { uv: { label: "UV", color: "hsl(var(--chart-1))" } }
   */
  config: ChartConfig
  /**
   * The layout of the chart.
   * @default "horizontal"
   * @example "vertical"
   */
  layout?: LayoutType
  /**
   * Whether to hide the legend.
   * @default false
   */
  hideLegend?: boolean
  /**
   * Whether to hide the tooltip.
   * @default false
   */
  hideTooltip?: boolean
  /**
   * The content of the legend.
   * @example <ChartLegendContent />
   */
  legendContent?: React.ComponentProps<typeof ChartLegend>["content"]
  /**
   * The content of the tooltip.
   * @example <ChartTooltipContent />
   */
  tooltipContent?: React.ComponentProps<typeof ChartTooltip>["content"]
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      chartType,
      data,
      config,
      className,
      layout = "horizontal",
      hideLegend = false,
      hideTooltip = false,
      legendContent,
      tooltipContent,
      ...props
    },
    ref,
  ) => {
    const chartComponents: Record<string, ChartComponent> = {
      line: LineChart,
      bar: BarChart,
      pie: PieChart,
      radial: RadialBarChart,
      area: AreaChart,
      scatter: ScatterChart,
    }

    const chartElements: Record<string, ChartElement> = {
      line: Line,
      bar: Bar,
      area: Area,
      scatter: Scatter,
      pie: Pie,
      radial: RadialBar,
    }

    const ChartComponent = chartComponents[chartType || "line"]
    const ChartElement = chartElements[chartType || "line"]

    return (
      <ChartContainer ref={ref} config={config} className={cn("min-h-[200px] w-full", className)} {...props}>
        <ResponsiveContainer>
          <ChartComponent data={data} layout={layout}>
            <CartesianGrid vertical={layout === "vertical"} horizontal={layout === "horizontal"} />
            {chartType !== "pie" && chartType !== "radial" && (
              <>
                <XAxis
                  dataKey={Object.keys(data[0] || {})[0]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
              </>
            )}
            {!hideTooltip && <ChartTooltip content={tooltipContent || <ChartTooltipContent />} />}
            {!hideLegend && <ChartLegend content={legendContent || <ChartLegendContent />} />}
            {Object.entries(config).map(([key, item]) => (
              <ChartElement
                key={key}
                dataKey={key}
                fill={item.color}
                stroke={item.color}
                {...(chartType === "pie" && {
                  dataKey: item.dataKey || key,
                  nameKey: item.nameKey || "name",
                })}
                {...(chartType === "radial" && {
                  dataKey: item.dataKey || key,
                  nameKey: item.nameKey || "name",
                })}
              />
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </ChartContainer>
    )
  },
)
Chart.displayName = "Chart"

export { Chart }
