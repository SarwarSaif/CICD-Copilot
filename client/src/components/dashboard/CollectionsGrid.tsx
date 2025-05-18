import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

interface Collection {
  id: number;
  name: string;
  photoCount: number;
  coverUrl: string;
  sharedWith: number;
}

interface CollectionsGridProps {
  collections: Collection[];
  isLoading: boolean;
}

export default function CollectionsGrid({ collections, isLoading }: CollectionsGridProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Collections</h2>
        <Link href="/collections">
          <a className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all collections
          </a>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      ) : collections.length > 0 ? (
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
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <i className="ri-album-line text-4xl text-gray-400 mb-3"></i>
          <h3 className="text-base font-medium text-gray-700">No collections yet</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first collection to organize your photos</p>
        </div>
      )}
    </div>
  );
}
