import React, { useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface PipelinePropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  updateNodeData: (nodeId: string, data: any) => void;
}

// Form schema for node properties
const nodeFormSchema = z.object({
  label: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.string(),
});

const PipelinePropertiesPanel: React.FC<PipelinePropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  updateNodeData,
}) => {
  // Initialize form for node properties
  const form = useForm<z.infer<typeof nodeFormSchema>>({
    resolver: zodResolver(nodeFormSchema),
    defaultValues: {
      label: '',
      description: '',
      type: '',
    },
  });

  // Update form values when selected node changes
  useEffect(() => {
    if (selectedNode) {
      form.reset({
        label: selectedNode.data.label || '',
        description: selectedNode.data.description || '',
        type: selectedNode.data.type || '',
      });
    }
  }, [selectedNode, form]);

  // Handle form submission
  const onSubmit = (values: z.infer<typeof nodeFormSchema>) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, values);
    }
  };

  // Handle edge properties (placeholder for future enhancement)
  if (selectedEdge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edge Properties</CardTitle>
          <CardDescription>Configure the connection between nodes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Edge ID</h3>
              <Badge variant="outline">{selectedEdge.id}</Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Source</h3>
              <Badge variant="outline">{selectedEdge.source}</Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Target</h3>
              <Badge variant="outline">{selectedEdge.target}</Badge>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Edge properties editing will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display node properties form
  if (selectedNode) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Node Properties</h3>
            <p className="text-xs text-gray-500">Configure the selected node</p>
          </div>
          
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter node name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter a description (optional)" 
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select node type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="data_import">Data Import</SelectItem>
                    <SelectItem value="export">Data Export</SelectItem>
                    <SelectItem value="transform">Transform</SelectItem>
                    <SelectItem value="filter">Filter</SelectItem>
                    <SelectItem value="validate">Validate</SelectItem>
                    <SelectItem value="script">Script</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type determines the node's appearance and behavior.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full">
            Update Node
          </Button>
        </form>
      </Form>
    );
  }

  // No node or edge selected
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="text-gray-400 mb-2">⬢</div>
      <h3 className="text-sm font-medium text-gray-900">No Element Selected</h3>
      <p className="text-xs text-gray-500 mt-1">
        Select a node or connection to edit its properties
      </p>
    </div>
  );
};

export default PipelinePropertiesPanel;