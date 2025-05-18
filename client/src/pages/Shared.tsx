import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  GitBranch, 
  Share2, 
  Search,
  Eye,
  Play,
  Clock
} from "lucide-react";

interface SharedPipeline {
  id: number;
  name: string;
  description: string;
  status: string;
  sharedBy: string;
  sharedAt: string;
  permissions: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
        Active
      </Badge>
    );
  } else if (status === "draft") {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
        Draft
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
        {status}
      </Badge>
    );
  }
}

function PermissionBadge({ permission }: { permission: string }) {
  if (permission === "edit") {
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
        Can Edit
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
        View Only
      </Badge>
    );
  }
}

export default function Shared() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: sharedPipelines, isLoading } = useQuery({
    queryKey: ["/api/pipelines/shared"],
  });

  // Filter shared pipelines based on search query
  const filteredPipelines = Array.isArray(sharedPipelines) ? 
    sharedPipelines.filter((pipeline: SharedPipeline) => 
      pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (pipeline.description && pipeline.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pipeline.sharedBy && pipeline.sharedBy.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : 
    [];

  return (
    <main className="pt-6 md:pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shared Pipelines</h1>
          <p className="text-gray-600 mt-1">Pipelines that have been shared with you</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search shared pipelines..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredPipelines && filteredPipelines.length > 0 ? (
          <div className="space-y-4">
            {filteredPipelines.map((pipeline: SharedPipeline) => (
              <Card 
                key={pipeline.id} 
                className="bg-white overflow-hidden hover:shadow-md transition-shadow border-gray-200"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-md mr-3 flex-shrink-0 ${
                        pipeline.status === 'active' ? 'bg-green-100' : 
                        pipeline.status === 'draft' ? 'bg-yellow-100' : 
                        'bg-gray-100'
                      }`}>
                        <GitBranch className={`h-5 w-5 ${
                          pipeline.status === 'active' ? 'text-green-500' : 
                          pipeline.status === 'draft' ? 'text-yellow-500' : 
                          'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-gray-900 text-lg">{pipeline.name}</h3>
                          <StatusBadge status={pipeline.status} />
                          <PermissionBadge permission={pipeline.permissions} />
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {pipeline.description || 'No description'}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3 inline-block mr-1" />
                          <span>Shared by {pipeline.sharedBy} • {formatDate(new Date(pipeline.sharedAt))}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <a href={`/pipelines/${pipeline.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </a>
                      </Button>
                      {pipeline.permissions === "edit" && (
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={pipeline.status !== 'active'}
                        >
                          <Play className="h-4 w-4 mr-1" /> Execute
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Share2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchQuery ? 'No matching shared pipelines found' : 'No shared pipelines'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term or clear the search' : 'Pipelines shared with you will appear here'}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
