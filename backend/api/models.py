from django.db import models
from django.contrib.auth.models import User


def mop_file_upload_path(instance, filename):
    # Specify the upload path for MOP files
    return f'mop_files/{instance.user.id}/{filename}'

class MopFile(models.Model):
    """
    Model for Manual Operation Procedure (MOP) files.
    These are the source files that will be converted to pipelines.
    Supports TXT, Word, and PDF file types.
    """
    FILE_TYPE_CHOICES = [
        ('txt', 'Text File'),
        ('docx', 'Word Document'),
        ('doc', 'Word Document (Legacy)'),
        ('pdf', 'PDF Document'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    content = models.TextField()
    file = models.FileField(upload_to=mop_file_upload_path, null=True, blank=True)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES, default='txt')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mop_files')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
        
    def get_file_type_from_filename(self, filename):
        """Determine file type from file extension"""
        if filename.lower().endswith('.txt'):
            return 'txt'
        elif filename.lower().endswith('.docx'):
            return 'docx'
        elif filename.lower().endswith('.doc'):
            return 'doc'
        elif filename.lower().endswith('.pdf'):
            return 'pdf'
        else:
            return 'other'


class Pipeline(models.Model):
    """
    Model for executable pipelines created from MOP files.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    mop_file = models.ForeignKey(MopFile, on_delete=models.CASCADE, related_name='pipelines')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pipelines')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class PipelineStep(models.Model):
    """
    Model for individual steps within a pipeline.
    """
    pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE, related_name='steps')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    config = models.JSONField(default=dict)
    position = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.pipeline.name} - {self.name} (Step {self.position})"


class PipelineExecution(models.Model):
    """
    Model for tracking pipeline executions.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE, related_name='executions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    logs = models.TextField(null=True, blank=True)
    results = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.pipeline.name} execution - {self.status}"


class SharedPipeline(models.Model):
    """
    Model for pipelines shared between users.
    """
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('edit', 'Can Edit'),
    ]
    
    pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE, related_name='shared_with')
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_pipelines')
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_with_me')
    permissions = models.CharField(max_length=10, choices=PERMISSION_CHOICES, default='view')
    shared_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('pipeline', 'shared_with')

    def __str__(self):
        return f"{self.pipeline.name} shared with {self.shared_with.username}"


class TeamMember(models.Model):
    """
    Model for team members.
    """
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('developer', 'Developer'),
        ('viewer', 'Viewer'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name