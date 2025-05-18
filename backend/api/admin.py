from django.contrib import admin
from .models import MopFile, Pipeline, PipelineStep, PipelineExecution, SharedPipeline, TeamMember

# Register models for admin interface
@admin.register(MopFile)
class MopFileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at', 'updated_at')

@admin.register(Pipeline)
class PipelineAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'status', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('status', 'created_at', 'updated_at')

@admin.register(PipelineStep)
class PipelineStepAdmin(admin.ModelAdmin):
    list_display = ('pipeline', 'name', 'type', 'position')
    search_fields = ('name',)
    list_filter = ('type',)

@admin.register(PipelineExecution)
class PipelineExecutionAdmin(admin.ModelAdmin):
    list_display = ('pipeline', 'status', 'started_at', 'completed_at')
    search_fields = ('logs',)
    list_filter = ('status', 'started_at')

@admin.register(SharedPipeline)
class SharedPipelineAdmin(admin.ModelAdmin):
    list_display = ('pipeline', 'shared_by', 'shared_with', 'permissions', 'shared_at')
    list_filter = ('permissions', 'shared_at')

@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role', 'created_at')
    search_fields = ('name', 'email')
    list_filter = ('role', 'created_at')