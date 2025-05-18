from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MopFileViewSet, PipelineViewSet, PipelineStepViewSet, 
    PipelineExecutionViewSet, SharedPipelineViewSet, 
    TeamMemberViewSet, StatsView
)

# Create a router for our ViewSets
router = DefaultRouter()
router.register(r'mop-files', MopFileViewSet)
router.register(r'pipelines', PipelineViewSet)
router.register(r'pipeline-steps', PipelineStepViewSet)
router.register(r'pipeline-executions', PipelineExecutionViewSet)
router.register(r'shared-pipelines', SharedPipelineViewSet)
router.register(r'team-members', TeamMemberViewSet)
router.register(r'stats', StatsView, basename='stats')

urlpatterns = [
    path('', include(router.urls)),
]