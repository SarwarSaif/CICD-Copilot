import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PipelineEditor from '@/components/pipeline/PipelineEditor';
import { CodeEditor } from '@/components/pipeline/CodeEditor';

const PipelineVisualizer: React.FC = () => {
  const [location, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const pipelineId = params?.id ? parseInt(params.id) : undefined;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('editor');
  
  // Fetch pipeline data if editing an existing pipeline
  const { data: pipeline, isLoading, isError } = useQuery({
    queryKey: ['/api/pipelines', pipelineId],
    queryFn: async () => {
      if (!pipelineId) return null;
      return fetch(`/api/pipelines/${pipelineId}`).then(res => res.json());
    },
    enabled: !!pipelineId,
  });

  // Mutation for saving pipeline
  const savePipelineMutation = useMutation({
    mutationFn: async (pipelineData: any) => {
      const url = pipelineId ? `/api/pipelines/${pipelineId}` : '/api/pipelines';
      const method = pipelineId ? 'PATCH' : 'POST';
      
      return fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipelineData),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      if (!pipelineId) {
        setLocation('/pipelines');
      }
      toast({
        title: 'Success',
        description: pipelineId ? 'Pipeline updated successfully.' : 'Pipeline created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save pipeline. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Execute pipeline mutation
  const executePipelineMutation = useMutation({
    mutationFn: async () => {
      if (!pipelineId) return null;
      return fetch(`/api/pipelines/${pipelineId}/execute`, {
        method: 'POST',
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: 'Pipeline Executing',
        description: 'Pipeline execution started successfully.',
      });
      // Optionally navigate to execution results
      // setLocation(`/pipeline-executions/${data.id}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to execute pipeline. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle save pipeline
  const handleSavePipeline = (pipelineData: any) => {
    const saveData = {
      ...pipelineData,
      name: pipeline?.name || 'New Pipeline',
      description: pipeline?.description || 'Created with the Pipeline Visualizer',
      mop_file_id: pipeline?.mop_file_id,
    };
    
    savePipelineMutation.mutate(saveData);
  };

  // Handle execute pipeline
  const handleExecutePipeline = () => {
    executePipelineMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError && pipelineId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold text-red-500">Error Loading Pipeline</h2>
        <p className="text-gray-600 mt-2">Could not load the pipeline. It may have been deleted or you don't have permission.</p>
        <Button className="mt-4" onClick={() => setLocation('/pipelines')}>
          Back to Pipelines
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {pipelineId ? `Edit Pipeline: ${pipeline?.name || ''}` : 'Create New Pipeline'}
          </h1>
          <p className="text-sm text-gray-500">
            {pipelineId ? 'Edit and visualize your pipeline' : 'Create and configure a new pipeline'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {pipelineId && (
            <Button 
              onClick={handleExecutePipeline}
              disabled={executePipelineMutation.isPending}
              variant="outline"
            >
              {executePipelineMutation.isPending ? 'Executing...' : 'Execute Pipeline'}
            </Button>
          )}
          
          <Button onClick={() => setLocation('/pipelines')}>
            Back to Pipelines
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Visual Editor</TabsTrigger>
            <TabsTrigger value="jenkins">Jenkins Pipeline</TabsTrigger>
            <TabsTrigger value="json">JSON View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="h-[calc(100%-40px)]">
            <PipelineEditor 
              pipelineId={pipelineId}
              initialData={pipeline}
              onSave={handleSavePipeline}
            />
          </TabsContent>
          
          <TabsContent value="jenkins">
            {pipelineId ? (
              <CodeEditor pipelineId={pipelineId} />
            ) : (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Jenkins Pipeline Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">Please save the pipeline first to access the Jenkins pipeline editor.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="json">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline JSON Configuration</CardTitle>
                <CardDescription>
                  View and edit the raw pipeline configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto h-[500px] text-sm">
                  {JSON.stringify(pipeline, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PipelineVisualizer;