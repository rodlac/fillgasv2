import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BookingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">
                    <Skeleton className="h-5 w-20" />
                  </th>
                  <th className="px-4 py-2 text-left">
                    <Skeleton className="h-5 w-20" />
                  </th>
                  <th className="px-4 py-2 text-left">
                    <Skeleton className="h-5 w-24" />
                  </th>
                  <th className="px-4 py-2 text-left">
                    <Skeleton className="h-5 w-28" />
                  </th>
                  <th className="px-4 py-2 text-left">
                    <Skeleton className="h-5 w-24" />
                  </th>
                  <th className="px-4 py-2 text-left">
                    <Skeleton className="h-5 w-20" />
                  </th>
                  <th className="px-4 py-2 text-right">
                    <Skeleton className="h-5 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="px-4 py-2">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="px-4 py-2">
                      <Skeleton className="h-5 w-40" />
                    </td>
                    <td className="px-4 py-2">
                      <Skeleton className="h-5 w-48" />
                    </td>
                    <td className="px-4 py-2">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-4 py-2">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Skeleton className="h-8 w-20" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
