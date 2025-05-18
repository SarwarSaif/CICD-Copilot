import React from 'react';
import { 
  Database, 
  FileText, 
  Filter, 
  Gauge, 
  GitBranch, 
  Maximize, 
  MoveHorizontal, 
  Settings, 
  Trash2, 
  Upload
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define the pipeline node types
const nodeTypes = [
  { type: 'data_import', name: 'Data Import', icon: <Database size={18} />, description: 'Import data from external sources' },
  { type: 'transform', name: 'Transform', icon: <MoveHorizontal size={18} />, description: 'Transform data format or structure' },
  { type: 'filter', name: 'Filter', icon: <Filter size={18} />, description: 'Filter data based on conditions' },
  { type: 'analyze', name: 'Analyze', icon: <Gauge size={18} />, description: 'Analyze data and generate insights' },
  { type: 'merge', name: 'Merge', icon: <GitBranch size={18} />, description: 'Merge multiple data sources' },
  { type: 'cleanup', name: 'Cleanup', icon: <Trash2 size={18} />, description: 'Clean up and normalize data' },
  { type: 'extract', name: 'Extract', icon: <Maximize size={18} />, description: 'Extract specific data elements' },
  { type: 'mop_file', name: 'MOP File', icon: <FileText size={18} />, description: 'MOP file processing' },
  { type: 'config', name: 'Config', icon: <Settings size={18} />, description: 'Configure pipeline settings' },
  { type: 'data_export', name: 'Data Export', icon: <Upload size={18} />, description: 'Export data to external systems' },
];

const PipelineNodePanel: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="grid grid-cols-1 gap-2">
        {nodeTypes.map((nodeType) => (
          <TooltipProvider key={nodeType.type} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className="cursor-grab hover:border-primary transition-colors"
                  draggable
                  onDragStart={(event) => onDragStart(event, nodeType.type)}
                >
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded-md text-gray-700">
                      {nodeType.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{nodeType.name}</p>
                      <p className="text-xs text-gray-500">{nodeType.type}</p>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px]">
                <p>{nodeType.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PipelineNodePanel;