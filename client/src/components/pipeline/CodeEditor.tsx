import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CodeEditorProps {
  pipelineId: number;
}

export function CodeEditor({ pipelineId }: CodeEditorProps) {
  const [code, setCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch the Jenkins pipeline code
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/pipelines', pipelineId, 'jenkins_pipeline'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/pipelines/${pipelineId}/jenkins_pipeline/`);
        if (!response.ok) {
          // If we get a 404, just return an empty object - the endpoint might not be implemented yet
          if (response.status === 404) {
            return { jenkins_code: '// Jenkins pipeline code will appear here when available' };
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch Jenkins pipeline code');
        }
        return response.json();
      } catch (err) {
        console.error('Error fetching Jenkins code:', err);
        return { jenkins_code: '// Error loading Jenkins pipeline code. The backend API may not be available.' };
      }
    },
    enabled: !!pipelineId
  });
  
  // Update the code state when data is loaded
  const jenkinsCode = data?.jenkins_code || '';
  
  // Initialize code state when data loads
  React.useEffect(() => {
    if (data?.jenkins_code) {
      setCode(data.jenkins_code);
    }
  }, [data]);
  
  // Handle code change
  const onChange = useCallback((value: string) => {
    setCode(value);
  }, []);
  
  // Save the updated code
  const updateMutation = useMutation({
    mutationFn: async (updatedCode: string) => {
      return apiRequest(`/api/pipelines/${pipelineId}/update_jenkins_code/`, 'POST', {
        jenkins_code: updatedCode
      });
    },
    onSuccess: () => {
      toast({
        title: 'Pipeline Updated',
        description: 'Jenkins pipeline code has been updated successfully.',
      });
      setIsEditing(false);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines', pipelineId, 'jenkins_pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines', pipelineId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update Jenkins pipeline code',
        variant: 'destructive',
      });
    }
  });
  
  // Handle save button click
  const handleSave = () => {
    updateMutation.mutate(code);
  };
  
  // Handle edit button click
  const handleEdit = () => {
    setCode(jenkinsCode);
    setIsEditing(true);
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    setIsEditing(false);
    setCode(jenkinsCode);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jenkins Pipeline Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p>Loading pipeline code...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jenkins Pipeline Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-red-500">
            <p>Error loading pipeline code: {(error as Error).message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Jenkins Pipeline Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="code" className="w-full">
          <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="mt-4">
            <div className="border rounded-md">
              <CodeMirror
                value={isEditing ? code : jenkinsCode}
                height="400px"
                extensions={[javascript({ jsx: true })]}
                onChange={onChange}
                readOnly={!isEditing}
                theme="dark"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  crosshairCursor: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  searchKeymap: true,
                  foldKeymap: true,
                  completionKeymap: true,
                  lintKeymap: true,
                }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="visualization" className="mt-4">
            <div className="border rounded-md h-[400px] p-4 flex items-center justify-center">
              <p className="text-muted-foreground">Pipeline visualization coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button onClick={handleEdit}>
            Edit Pipeline
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}