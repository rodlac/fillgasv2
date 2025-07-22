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
  Legend,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
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
type ChartElement =
  | typeof Line
  | typeof Bar
  | typeof Pie
  | typeof RadialBar
  | typeof Area
  | typeof Scatter
  | typeof XAxis
  | typeof YAxis
  | typeof CartesianGrid
  | typeof Legend
  | typeof Tooltip

// Map of component names to their actual components
const chartComponents: Record<string, ChartComponent> = {
  LineChart,
  BarChart,
  PieChart,
  RadialBarChart,
  AreaChart,
  ScatterChart,
}

const chartElements: Record<string, ChartElement> = {
  Line,
  Bar,
  Pie,
  RadialBar,
  Area,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
}

interface DynamicChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[]
  chartConfig: ChartConfig
  chartType: keyof typeof chartComponents
  children?: React.ReactNode
  className?: string
  tooltipContent?: React.ComponentType<TooltipProps<any, any>>
  showTooltip?: boolean
  showLegend?: boolean
}

const DynamicChart = React.forwardRef<HTMLDivElement, DynamicChartProps>(
  (
    {
      data,
      chartConfig,
      chartType,
      children,
      className,
      tooltipContent: CustomTooltipContent,
      showTooltip = true,
      showLegend = true,
      ...props
    },
    ref,
  ) => {
    const Chart = chartComponents[chartType]
    if (!Chart) {
      console.error(`Chart type "${chartType}" not found.`)
      return null
    }

    const defaultTooltipContent = CustomTooltipContent || ChartTooltipContent
    const defaultLegendContent = ChartLegendContent

    return (
      <ChartContainer ref={ref} config={chartConfig} className={cn("min-h-[200px] w-full", className)} {...props}>
        <ResponsiveContainer>
          <Chart data={data}>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && typeof child.type === "string") {
                const Element = chartElements[child.type as string]
                if (Element) {
                  return <Element {...child.props} />
                }
              }
              return child
            })}
            {showTooltip && <ChartTooltip content={defaultTooltipContent} />}
            {showLegend && <ChartLegend content={defaultLegendContent} />}
          </Chart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  },
)

DynamicChart.displayName = "DynamicChart"

export { DynamicChart }
