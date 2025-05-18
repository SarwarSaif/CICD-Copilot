import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Define pipeline component categories and their nodes
const NODE_CATEGORIES = [
  {
    name: 'Data',
    description: 'Components for data handling',
    nodes: [
      { type: 'data_import', label: 'Data Import', description: 'Import data from various sources' },
      { type: 'export', label: 'Data Export', description: 'Export data to various destinations' },
    ],
  },
  {
    name: 'Processing',
    description: 'Components for data processing',
    nodes: [
      { type: 'transform', label: 'Transform', description: 'Transform data using rules' },
      { type: 'filter', label: 'Filter', description: 'Filter data based on conditions' },
      { type: 'validate', label: 'Validate', description: 'Validate data against rules' },
    ],
  },
  {
    name: 'Operations',
    description: 'Components for pipeline operations',
    nodes: [
      { type: 'script', label: 'Script', description: 'Run custom script' },
      { type: 'notification', label: 'Notification', description: 'Send notifications' },
    ],
  },
];

const PipelineNodePanel: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-6 pr-4">
        {NODE_CATEGORIES.map((category) => (
          <div key={category.name}>
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
              <p className="text-xs text-gray-500">{category.description}</p>
            </div>
            
            <div className="space-y-2">
              {category.nodes.map((node) => (
                <div
                  key={node.type}
                  className="border border-gray-200 rounded-md p-2 bg-white cursor-grab hover:shadow-sm transition-all"
                  draggable
                  onDragStart={(event) => onDragStart(event, node.type)}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {node.type === 'data_import' && '📥'}
                      {node.type === 'export' && '📤'}
                      {node.type === 'transform' && '🔄'}
                      {node.type === 'filter' && '🔍'}
                      {node.type === 'validate' && '✅'}
                      {node.type === 'script' && '📜'}
                      {node.type === 'notification' && '🔔'}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{node.label}</div>
                      <div className="text-xs text-gray-500">{node.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {category !== NODE_CATEGORIES[NODE_CATEGORIES.length - 1] && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PipelineNodePanel;