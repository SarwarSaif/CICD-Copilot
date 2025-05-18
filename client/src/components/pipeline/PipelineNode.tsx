import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Node types and their corresponding styling
const NODE_TYPES: Record<string, { color: string; icon: string }> = {
  data_import: {
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    icon: '📥',
  },
  transform: {
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    icon: '🔄',
  },
  filter: {
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    icon: '🔍',
  },
  validate: {
    color: 'bg-green-100 border-green-300 text-green-800',
    icon: '✅',
  },
  export: {
    color: 'bg-red-100 border-red-300 text-red-800',
    icon: '📤',
  },
  script: {
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    icon: '📜',
  },
  notification: {
    color: 'bg-indigo-100 border-indigo-300 text-indigo-800',
    icon: '🔔',
  },
  // Default styling for unknown types
  default: {
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    icon: '❓',
  },
};

const PipelineNode: React.FC<NodeProps> = ({ data, selected, isConnectable }) => {
  // Determine node styling based on type
  const nodeType = data.type || 'default';
  const { color, icon } = NODE_TYPES[nodeType] || NODE_TYPES.default;
  
  return (
    <div 
      className={`px-4 py-2 rounded-md border-2 ${color} ${
        selected ? 'shadow-md border-blue-500' : ''
      }`}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      
      {/* Node content */}
      <div className="flex items-center">
        <span className="text-lg mr-2">{icon}</span>
        <div>
          <div className="font-medium">{data.label}</div>
          {data.description && (
            <div className="text-xs truncate max-w-[150px]">{data.description}</div>
          )}
        </div>
      </div>
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};

export default memo(PipelineNode);