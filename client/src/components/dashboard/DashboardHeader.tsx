import { Card } from "@/components/ui/card";

interface StatsProps {
  totalPhotos: number;
  collections: number;
  shared: number;
}

interface DashboardHeaderProps {
  firstName: string;
  stats: StatsProps;
}

export default function DashboardHeader({ firstName, stats }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
      <p className="text-gray-600 mt-1">Organize your photos and create beautiful memories</p>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md">
              <i className="ri-image-line text-xl text-primary-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Photos</p>
              <p className="text-xl font-semibold">{stats.totalPhotos.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-md">
              <i className="ri-album-line text-xl text-green-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Collections</p>
              <p className="text-xl font-semibold">{stats.collections}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-md">
              <i className="ri-share-line text-xl text-purple-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Shared</p>
              <p className="text-xl font-semibold">{stats.shared}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
