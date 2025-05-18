import React, { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PipelinePropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  updateNodeData: (nodeId: string, data: any) => void;
}

const PipelinePropertiesPanel: React.FC<PipelinePropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  updateNodeData,
}) => {
  const [localNodeData, setLocalNodeData] = useState<any>(null);
  
  // Update local state when selection changes
  useEffect(() => {
    if (selectedNode) {
      setLocalNodeData({ ...selectedNode.data });
    } else {
      setLocalNodeData(null);
    }
  }, [selectedNode]);
  
  // Handle node property changes
  const handleNodeDataChange = (field: string, value: any) => {
    if (!selectedNode) return;
    
    const newData = { ...localNodeData };
    
    // Handle nested properties (config.*)
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newData[parent] = { ...newData[parent], [child]: value };
    } else {
      newData[field] = value;
    }
    
    setLocalNodeData(newData);
  };
  
  // Apply changes to the actual node
  const applyChanges = () => {
    if (selectedNode && localNodeData) {
      updateNodeData(selectedNode.id, localNodeData);
    }
  };
  
  // Reset to original node data
  const resetChanges = () => {
    if (selectedNode) {
      setLocalNodeData({ ...selectedNode.data });
    }
  };
  
  // Render specific node type properties
  const renderNodeTypeProperties = () => {
    if (!selectedNode || !localNodeData) return null;
    
    const nodeType = localNodeData.type;
    
    switch (nodeType) {
      case 'data_import':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="source">Data Source</Label>
              <Select 
                value={localNodeData.config?.source || ''}
                onValueChange={(value) => handleNodeDataChange('config.source', value)}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="s3">S3 Bucket</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection_string">Connection String</Label>
              <Input
                id="connection_string"
                value={localNodeData.config?.connection_string || ''}
                onChange={(e) => handleNodeDataChange('config.connection_string', e.target.value)}
                placeholder="Connection string or path"
              />
            </div>
          </>
        );
        
      case 'filter':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="condition">Filter Condition</Label>
              <Textarea
                id="condition"
                value={localNodeData.config?.condition || ''}
                onChange={(e) => handleNodeDataChange('config.condition', e.target.value)}
                placeholder="Enter filter condition"
              />
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Switch
                id="case_sensitive"
                checked={localNodeData.config?.case_sensitive || false}
                onCheckedChange={(checked) => handleNodeDataChange('config.case_sensitive', checked)}
              />
              <Label htmlFor="case_sensitive">Case Sensitive</Label>
            </div>
          </>
        );
        
      case 'transform':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="transformation">Transformation Type</Label>
              <Select 
                value={localNodeData.config?.transformation_type || ''}
                onValueChange={(value) => handleNodeDataChange('config.transformation_type', value)}
              >
                <SelectTrigger id="transformation">
                  <SelectValue placeholder="Select transformation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">Map</SelectItem>
                  <SelectItem value="reduce">Reduce</SelectItem>
                  <SelectItem value="aggregate">Aggregate</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transform_code">Transformation Code</Label>
              <Textarea
                id="transform_code"
                value={localNodeData.config?.transform_code || ''}
                onChange={(e) => handleNodeDataChange('config.transform_code', e.target.value)}
                placeholder="Enter transformation code"
                className="h-32 font-mono text-sm"
              />
            </div>
          </>
        );
        
      case 'data_export':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="destination">Export Destination</Label>
              <Select 
                value={localNodeData.config?.destination || ''}
                onValueChange={(value) => handleNodeDataChange('config.destination', value)}
              >
                <SelectTrigger id="destination">
                  <SelectValue placeholder="Select export destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="s3">S3 Bucket</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select 
                value={localNodeData.config?.format || ''}
                onValueChange={(value) => handleNodeDataChange('config.format', value)}
              >
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="path">Export Path</Label>
              <Input
                id="path"
                value={localNodeData.config?.path || ''}
                onChange={(e) => handleNodeDataChange('config.path', e.target.value)}
                placeholder="Export path or connection string"
              />
            </div>
          </>
        );
        
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="custom_config">Configuration (JSON)</Label>
            <Textarea
              id="custom_config"
              value={localNodeData.config ? JSON.stringify(localNodeData.config, null, 2) : '{}'}
              onChange={(e) => {
                try {
                  const config = JSON.parse(e.target.value);
                  handleNodeDataChange('config', config);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              placeholder="Enter configuration as JSON"
              className="h-32 font-mono text-sm"
            />
          </div>
        );
    }
  };
  
  // Show edge properties when an edge is selected
  const renderEdgeProperties = () => {
    if (!selectedEdge) return null;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Edge Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Edge ID</Label>
              <Input value={selectedEdge.id} disabled />
            </div>
            <div>
              <Label>Source</Label>
              <Input value={selectedEdge.source} disabled />
            </div>
            <div>
              <Label>Target</Label>
              <Input value={selectedEdge.target} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // No selection
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Select a node or edge to view properties</p>
      </div>
    );
  }
  
  // Show node properties
  if (selectedNode && localNodeData) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Basic Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={localNodeData.label || ''}
                  onChange={(e) => handleNodeDataChange('label', e.target.value)}
                  placeholder="Node label"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={localNodeData.type || ''}
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {renderNodeTypeProperties()}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={resetChanges}>Reset</Button>
          <Button onClick={applyChanges}>Apply Changes</Button>
        </div>
      </div>
    );
  }
  
  // Show edge properties
  return renderEdgeProperties();
};

export default PipelinePropertiesPanel;