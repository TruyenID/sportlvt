import { Package, Users, Tags, FolderTree } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { title: "Tổng số sản phẩm", value: "0", icon: Package, color: "text-chart-1 bg-chart-1/10" },
  { title: "Danh mục", value: "0", icon: FolderTree, color: "text-chart-2 bg-chart-2/10" },
  { title: "Thương hiệu", value: "0", icon: Tags, color: "text-chart-3 bg-chart-3/10" },
  { title: "Khách hàng", value: "0", icon: Users, color: "text-chart-5 bg-chart-5/10" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">Xin chào, đây là tình hình cửa hàng của bạn hôm nay.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="gap-3">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`flex size-9 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
