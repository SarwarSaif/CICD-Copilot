import { useParams } from 'wouter';
import { CodeEditor } from '../components/pipeline/CodeEditor';
import { PageHeader } from '@/components/ui/page-header';

export default function JenkinsPipeline() {
  const params = useParams<{ id: string }>();
  const pipelineId = parseInt(params.id || '0');
  
  if (!pipelineId) {
    return (
      <div className="container mx-auto py-8">
        <PageHeader
          title="Jenkins Pipeline Editor"
          description="No pipeline selected. Please select a pipeline to edit."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Jenkins Pipeline Editor" 
        description="Edit your Jenkins pipeline code directly. Changes will be saved to your pipeline configuration."
      />
      
      <CodeEditor pipelineId={pipelineId} />
    </div>
  );
}