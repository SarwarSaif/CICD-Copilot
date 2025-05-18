import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ConnectionLineType,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

import PipelineNode from './PipelineNode';
import PipelineNodePanel from './PipelineNodePanel';
import PipelinePropertiesPanel from './PipelinePropertiesPanel';

// Register custom node types
const nodeTypes = {
  pipelineNode: PipelineNode,
};

// Define initial pipeline flow state
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface PipelineEditorProps {
  pipelineId?: number;
  initialData?: any;
  readOnly?: boolean;
  onSave?: (data: any) => void;
}

const PipelineEditor: React.FC<PipelineEditorProps> = ({
  pipelineId,
  initialData,
  readOnly = false,
  onSave,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isModified, setIsModified] = useState(false);
  const { toast } = useToast();

  // Load initial data if available
  useEffect(() => {
    if (initialData) {
      if (initialData.nodes) setNodes(initialData.nodes);
      if (initialData.edges) setEdges(initialData.edges);
    }
  }, [initialData, setNodes, setEdges]);

  // Handle node changes (position, delete, etc.)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      setIsModified(true);
    },
    [setNodes]
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      setIsModified(true);
    },
    [setEdges]
  );

  // Connect nodes when user creates a connection
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      }, eds));
      setIsModified(true);
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Handle drag over for new node creation
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop for new node creation
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (reactFlowWrapper.current && reactFlowInstance) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');
        
        // Check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // Create new node
        const newNode = {
          id: `node_${Date.now()}`,
          type: 'pipelineNode',
          position,
          data: { 
            label: type, 
            type: type, 
            config: {} 
          },
        };

        setNodes((nds) => nds.concat(newNode));
        setIsModified(true);
      }
    },
    [reactFlowInstance, setNodes]
  );

  // Update node data when edited
  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
    setIsModified(true);
  }, [setNodes]);

  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setSelectedNode(null);
      setIsModified(true);
    } else if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
      setIsModified(true);
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);
  
  // Save pipeline
  const savePipeline = useCallback(() => {
    if (onSave) {
      const pipelineData = {
        nodes,
        edges,
        config: {
          steps: nodes.map((node, index) => ({
            name: node.data.label,
            type: node.data.type,
            config: node.data.config || {},
            position: index + 1,
          })),
        }
      };
      onSave(pipelineData);
      setIsModified(false);
      toast({
        title: "Pipeline saved",
        description: "Your pipeline has been saved successfully.",
      });
    }
  }, [nodes, edges, onSave, toast]);

  return (
    <div className="flex h-full">
      <div className="w-3/4 h-full" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={readOnly ? undefined : onNodesChange}
            onEdgesChange={readOnly ? undefined : onEdgesChange}
            onConnect={readOnly ? undefined : onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onInit={setReactFlowInstance}
            onDrop={readOnly ? undefined : onDrop}
            onDragOver={readOnly ? undefined : onDragOver}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            snapToGrid={true}
            snapGrid={[10, 10]}
            fitView
            attributionPosition="bottom-right"
            deleteKeyCode="Delete"
            selectionKeyCode="Shift"
            multiSelectionKeyCode="Control"
            panOnDrag={!readOnly}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable={true}
          >
            <Controls />
            <MiniMap 
              nodeStrokeColor={(n) => {
                return n.selected ? '#6366F1' : '#10b981';
              }}
              nodeColor={(n) => {
                return n.selected ? '#F9FAFB' : '#10b981';
              }}
            />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      
      <div className="w-1/4 h-full overflow-auto border-l border-gray-200 p-4">
        <Tabs defaultValue="nodes">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="nodes" className="flex-1">Components</TabsTrigger>
            <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nodes">
            <PipelineNodePanel />
          </TabsContent>
          
          <TabsContent value="properties">
            <PipelinePropertiesPanel 
              selectedNode={selectedNode} 
              selectedEdge={selectedEdge}
              updateNodeData={updateNodeData} 
            />
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between gap-2 mt-4">
          <Button
            variant="destructive"
            onClick={deleteSelected}
            disabled={!selectedNode && !selectedEdge}
          >
            Delete Selected
          </Button>
          
          <Button
            onClick={savePipeline}
            disabled={!isModified || readOnly}
          >
            Save Pipeline
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PipelineEditor;