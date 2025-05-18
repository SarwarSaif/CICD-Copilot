import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Album, Users } from "lucide-react";

export default function Collections() {
  const { data: collections, isLoading } = useQuery({
    queryKey: ["/api/collections"],
  });

  return (
    <main className="pt-6 md:pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600 mt-1">Organize your photos into meaningful groups</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-64 rounded-lg" />
            ))}
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <div 
                key={collection.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-200">
                  <img 
                    src={collection.coverUrl} 
                    alt={collection.name} 
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 w-full">
                      <h3 className="text-white font-medium text-lg">{collection.name}</h3>
                      <p className="text-white/80 text-sm">{collection.photoCount} photos</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <i className="ri-share-line text-gray-500 mr-1.5"></i>
                      <span className="text-sm text-gray-500">
                        Shared with {collection.sharedWith} people
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="ri-more-2-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Album className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No collections yet</h3>
              <p className="text-sm text-gray-500 mt-1">Create your first collection to organize your photos</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
