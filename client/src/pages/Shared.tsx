import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Share2 } from "lucide-react";

export default function Shared() {
  const { data: sharedPhotos, isLoading } = useQuery({
    queryKey: ["/api/photos/shared"],
  });

  return (
    <main className="pt-6 md:pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shared</h1>
          <p className="text-gray-600 mt-1">Photos and collections shared with you</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : sharedPhotos && sharedPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sharedPhotos.map((photo) => (
              <div key={photo.id} className="group relative">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                  <img 
                    src={photo.url} 
                    alt={photo.title} 
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button className="p-1.5 bg-white rounded-full text-gray-700 hover:text-primary-500">
                        <i className="ri-heart-line"></i>
                      </button>
                      <button className="p-1.5 bg-white rounded-full text-gray-700 hover:text-primary-500">
                        <i className="ri-share-line"></i>
                      </button>
                      <button className="p-1.5 bg-white rounded-full text-gray-700 hover:text-primary-500">
                        <i className="ri-more-fill"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 truncate">{photo.title}</p>
                  <p className="text-xs text-gray-500">
                    Shared by {photo.sharedBy} • {formatDate(new Date(photo.sharedAt))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Share2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No shared photos</h3>
              <p className="text-sm text-gray-500 mt-1">Photos shared with you will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
