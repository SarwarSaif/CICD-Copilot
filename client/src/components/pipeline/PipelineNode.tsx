import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  CircleAlert, 
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

// Node type icons
const nodeIcons: Record<string, React.ReactNode> = {
  data_import: <Database size={20} />,
  data_export: <Upload size={20} />,
  transform: <MoveHorizontal size={20} />,
  filter: <Filter size={20} />,
  analyze: <Gauge size={20} />,
  merge: <GitBranch size={20} />,
  cleanup: <Trash2 size={20} />,
  extract: <Maximize size={20} />,
  mop_file: <FileText size={20} />,
  config: <Settings size={20} />,
  default: <CircleAlert size={20} />
};

const PipelineNode: React.FC<NodeProps> = ({ data, isConnectable, selected }) => {
  // Get the appropriate icon for this node type
  const icon = nodeIcons[data.type] || nodeIcons.default;
  
  return (
    <div 
      className={`
        relative px-4 py-2 rounded-md text-sm font-medium border-2 min-w-[180px]
        ${selected ? 'border-primary bg-primary/10' : 'border-gray-300 bg-white'} 
        shadow-md transition-all
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-white bg-gray-400"
      />
      
      {/* Node content */}
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded-full ${selected ? 'text-primary' : 'text-gray-700'}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">{data.label}</span>
          <span className="text-xs text-gray-500">{data.type}</span>
        </div>
      </div>
      
      {/* Show configuration summary if any */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="text-xs text-gray-500 mt-1 border-t border-gray-200 pt-1">
          <div className="max-h-14 overflow-auto">
            {Object.entries(data.config).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-2">
                <span className="font-medium">{key}:</span>
                <span className="truncate">
                  {typeof value === 'object' 
                    ? JSON.stringify(value).substring(0, 20) + '...' 
                    : String(value).substring(0, 20) + (String(value).length > 20 ? '...' : '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-white bg-gray-400"
      />
    </div>
  );
};

export default memo(PipelineNode);