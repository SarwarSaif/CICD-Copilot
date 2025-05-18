from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Count
from django.utils import timezone

from .models import MopFile, Pipeline, PipelineStep, PipelineExecution, SharedPipeline, TeamMember
from .serializers import (
    MopFileSerializer, PipelineSerializer, PipelineStepSerializer, 
    PipelineExecutionSerializer, SharedPipelineSerializer, TeamMemberSerializer, UserSerializer
)
from .langchain_processor import MopProcessor


class MopFileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for MOP files
    """
    queryset = MopFile.objects.all().order_by('-created_at')
    serializer_class = MopFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent MOP files"""
        recent_files = self.queryset[:5]
        serializer = self.get_serializer(recent_files, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def convert_to_pipeline(self, request, pk=None):
        """Convert a MOP file to a pipeline using LangChain"""
        mop_file = self.get_object()
        
        try:
            # Initialize the MOP processor
            processor = MopProcessor()
            
            # Process the MOP file content
            pipeline_config = processor.process_mop_file(mop_file.content)
            
            # Create a new pipeline
            pipeline = Pipeline.objects.create(
                name=f"Pipeline from {mop_file.name}",
                description=f"Auto-generated pipeline from {mop_file.name}",
                mop_file=mop_file,
                user=request.user,
                status='draft',
                config=pipeline_config
            )
            
            # Create pipeline steps
            if 'steps' in pipeline_config:
                for step_config in pipeline_config['steps']:
                    PipelineStep.objects.create(
                        pipeline=pipeline,
                        name=step_config['name'],
                        type=step_config['type'],
                        config=step_config.get('config', {}),
                        position=step_config['position']
                    )
            
            # Return the created pipeline
            serializer = PipelineSerializer(pipeline)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PipelineViewSet(viewsets.ModelViewSet):
    """
    API endpoint for pipelines
    """
    queryset = Pipeline.objects.all().order_by('-created_at')
    serializer_class = PipelineSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute a pipeline"""
        pipeline = self.get_object()
        
        # Create a new execution record
        execution = PipelineExecution.objects.create(
            pipeline=pipeline,
            status='running'
        )
        
        # In a real implementation, you would start a background task here
        # For now, we'll just simulate execution with a simple status update
        try:
            # Update the execution status
            execution.status = 'completed'
            execution.completed_at = timezone.now()
            execution.logs = "Pipeline executed successfully"
            execution.results = {"success": True, "message": "Pipeline executed successfully"}
            execution.save()
            
            serializer = PipelineExecutionSerializer(execution)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            execution.status = 'failed'
            execution.completed_at = timezone.now()
            execution.logs = f"Pipeline execution failed: {str(e)}"
            execution.save()
            
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PipelineStepViewSet(viewsets.ModelViewSet):
    """
    API endpoint for pipeline steps
    """
    queryset = PipelineStep.objects.all()
    serializer_class = PipelineStepSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter steps by pipeline if pipeline_id is provided"""
        queryset = self.queryset
        pipeline_id = self.request.query_params.get('pipeline_id')
        if pipeline_id:
            queryset = queryset.filter(pipeline_id=pipeline_id)
        return queryset


class PipelineExecutionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for pipeline executions
    """
    queryset = PipelineExecution.objects.all().order_by('-started_at')
    serializer_class = PipelineExecutionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter executions by pipeline if pipeline_id is provided"""
        queryset = self.queryset
        pipeline_id = self.request.query_params.get('pipeline_id')
        if pipeline_id:
            queryset = queryset.filter(pipeline_id=pipeline_id)
        return queryset


class SharedPipelineViewSet(viewsets.ModelViewSet):
    """
    API endpoint for shared pipelines
    """
    queryset = SharedPipeline.objects.all()
    serializer_class = SharedPipelineSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return pipelines shared with the authenticated user"""
        return self.queryset.filter(shared_with=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(shared_by=self.request.user)


class TeamMemberViewSet(viewsets.ModelViewSet):
    """
    API endpoint for team members
    """
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.IsAuthenticated]


class StatsView(viewsets.ViewSet):
    """
    API endpoint for retrieving statistics
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """Get overview statistics"""
        mop_file_count = MopFile.objects.count()
        pipeline_count = Pipeline.objects.count()
        shared_count = SharedPipeline.objects.filter(shared_with=request.user).count()
        
        return Response({
            'totalMopFiles': mop_file_count,
            'pipelines': pipeline_count,
            'shared': shared_count
        })