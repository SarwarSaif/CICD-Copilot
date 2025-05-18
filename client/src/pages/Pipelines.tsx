import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  GitBranch, 
  Search, 
  Play,
  Clock,
  Settings,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Pipeline {
  id: number;
  name: string;
  description: string;
  status: string;
  mopFileId: number;
  mopFileName: string;
  stepCount: number;
  createdAt: string;
  updatedAt: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" /> Active
      </Badge>
    );
  } else if (status === "draft") {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" /> Draft
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

export default function Pipelines() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Fetch all pipelines
  const { data: pipelines, isLoading } = useQuery({
    queryKey: ["/api/pipelines"],
  });
  
  // Filter pipelines based on search query
  const filteredPipelines = Array.isArray(pipelines) ? 
    pipelines.filter((pipeline: Pipeline) => 
      pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (pipeline.description && pipeline.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pipeline.mopFileName && pipeline.mopFileName.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : 
    [];
  
  const executePipeline = async (pipelineId: number) => {
    try {
      // Create a new pipeline execution
      await apiRequest('/api/pipeline-executions', 'POST', { pipelineId });
      
      toast({
        title: "Pipeline execution started",
        description: "The pipeline is now running. Check the pipeline details for progress.",
      });
      
      // Refresh pipeline data
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines', pipelineId, 'executions'] });
    } catch (error) {
      toast({
        title: "Execution failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <main className="pt-6 md:pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipelines</h1>
            <p className="text-gray-600 mt-1">Manage your executable pipelines</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              asChild
              className="flex items-center"
            >
              <a href="/mop-files">
                <GitBranch className="h-4 w-4 mr-2" /> Create New Pipeline
              </a>
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search pipelines..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredPipelines.length > 0 ? (
          <div className="space-y-4">
            {filteredPipelines.map((pipeline: Pipeline) => (
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
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900 text-lg">{pipeline.name}</h3>
                          <div className="ml-2">
                            <StatusBadge status={pipeline.status} />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {pipeline.description || 'No description'}
                        </p>
                        <div className="flex flex-wrap items-center mt-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Source:</span> {pipeline.mopFileName}
                          </div>
                          <div>
                            <span className="font-medium">Steps:</span> {pipeline.stepCount}
                          </div>
                          <div>
                            <Clock className="h-3 w-3 inline-block mr-1" />
                            <span>Created {formatDate(new Date(pipeline.createdAt))}</span>
                          </div>
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
                          <Settings className="h-4 w-4 mr-1" /> Configure
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={pipeline.status !== 'active'}
                        onClick={() => executePipeline(pipeline.id)}
                      >
                        <Play className="h-4 w-4 mr-1" /> Execute
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <GitBranch className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchQuery ? 'No matching pipelines found' : 'No pipelines yet'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term or clear the search' : 'Create your first pipeline to get started'}
              </p>
              {searchQuery ? (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              ) : (
                <Button 
                  className="mt-4"
                  asChild
                >
                  <a href="/mop-files">Create Pipeline</a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}