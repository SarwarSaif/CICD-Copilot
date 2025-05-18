import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { Link } from 'wouter';

interface Photo {
  id: number;
  title: string;
  url: string;
  createdAt: string;
}

interface RecentPhotosProps {
  photos: Photo[];
  isLoading: boolean;
}

export default function RecentPhotos({ photos, isLoading }: RecentPhotosProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Photos</h2>
        <Link href="/photos">
          <a className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all photos
          </a>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
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
                <p className="text-xs text-gray-500">{formatDate(new Date(photo.createdAt))}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <i className="ri-image-2-line text-4xl text-gray-400 mb-3"></i>
          <h3 className="text-base font-medium text-gray-700">No photos yet</h3>
          <p className="text-sm text-gray-500 mt-1">Upload your first photo to get started</p>
        </div>
      )}
    </div>
  );
}
