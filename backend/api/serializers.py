from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MopFile, Pipeline, PipelineStep, PipelineExecution, SharedPipeline, TeamMember


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class MopFileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = MopFile
        fields = ['id', 'name', 'description', 'content', 'user', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class PipelineStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = PipelineStep
        fields = ['id', 'name', 'type', 'config', 'position', 'pipeline', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PipelineExecutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PipelineExecution
        fields = ['id', 'pipeline', 'status', 'logs', 'results', 'started_at', 'completed_at']
        read_only_fields = ['id', 'started_at', 'completed_at']


class PipelineSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    steps = PipelineStepSerializer(many=True, read_only=True)
    mop_file_name = serializers.SerializerMethodField()
    step_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Pipeline
        fields = ['id', 'name', 'description', 'mop_file', 'mop_file_name', 'user', 
                  'status', 'config', 'created_at', 'updated_at', 'steps', 'step_count']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_mop_file_name(self, obj):
        return obj.mop_file.name if obj.mop_file else None
    
    def get_step_count(self, obj):
        return obj.steps.count()


class SharedPipelineSerializer(serializers.ModelSerializer):
    pipeline = PipelineSerializer(read_only=True)
    shared_by = UserSerializer(read_only=True)
    shared_with = UserSerializer(read_only=True)
    
    class Meta:
        model = SharedPipeline
        fields = ['id', 'pipeline', 'shared_by', 'shared_with', 'permissions', 'shared_at']
        read_only_fields = ['id', 'shared_at']


class TeamMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TeamMember
        fields = ['id', 'user', 'name', 'email', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']