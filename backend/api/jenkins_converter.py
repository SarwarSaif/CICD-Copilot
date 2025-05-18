"""
Utility for converting MOP files to Jenkins pipelines.
"""

import re
import logging
from typing import Dict, Any, List, Optional

# Initialize logger
logger = logging.getLogger(__name__)

class JenkinsConverter:
    """
    Convert MOP files and pipeline configurations to Jenkins pipeline format.
    """
    
    @staticmethod
    def convert_to_jenkins_pipeline(mop_content: str, pipeline_config: Dict[str, Any] = None) -> str:
        """
        Convert MOP content or a pipeline configuration to a Jenkins pipeline script.
        
        Args:
            mop_content: Content of the MOP file
            pipeline_config: Optional pipeline configuration (if available)
            
        Returns:
            String containing the Jenkins pipeline script
        """
        try:
            # If we have a pipeline configuration, use that as the primary source
            if pipeline_config and 'steps' in pipeline_config:
                return JenkinsConverter._convert_config_to_jenkins(pipeline_config)
            
            # Otherwise, convert the MOP content directly
            return JenkinsConverter._convert_mop_to_jenkins(mop_content)
        except Exception as e:
            logger.error(f"Error converting to Jenkins pipeline: {str(e)}")
            # Return a basic pipeline template if conversion fails
            return JenkinsConverter._get_basic_pipeline_template()
    
    @staticmethod
    def _convert_config_to_jenkins(pipeline_config: Dict[str, Any]) -> str:
        """Convert a pipeline configuration to Jenkins pipeline script"""
        jenkins_script = "pipeline {\n"
        jenkins_script += "    agent any\n\n"
        
        # Add stages based on pipeline steps
        jenkins_script += "    stages {\n"
        
        for step in pipeline_config.get('steps', []):
            step_name = step.get('name', 'Unnamed Step')
            step_type = step.get('type', 'script')
            step_config = step.get('config', {})
            
            jenkins_script += f"        stage('{step_name}') {{\n"
            jenkins_script += "            steps {\n"
            
            # Generate step content based on step type
            if step_type == 'data_import':
                jenkins_script += JenkinsConverter._get_data_import_step(step_config)
            elif step_type == 'transform':
                jenkins_script += JenkinsConverter._get_transform_step(step_config)
            elif step_type == 'filter':
                jenkins_script += JenkinsConverter._get_filter_step(step_config)
            elif step_type == 'validate':
                jenkins_script += JenkinsConverter._get_validate_step(step_config)
            elif step_type == 'export':
                jenkins_script += JenkinsConverter._get_export_step(step_config)
            elif step_type == 'script':
                jenkins_script += JenkinsConverter._get_script_step(step_config)
            elif step_type == 'notification':
                jenkins_script += JenkinsConverter._get_notification_step(step_config)
            else:
                # Default is a simple echo step
                jenkins_script += f"                echo 'Executing {step_name}'\n"
            
            jenkins_script += "            }\n"
            jenkins_script += "        }\n\n"
        
        jenkins_script += "    }\n"
        
        # Add post section for notifications
        jenkins_script += """
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
"""
        
        jenkins_script += "}\n"
        return jenkins_script
    
    @staticmethod
    def _convert_mop_to_jenkins(mop_content: str) -> str:
        """Convert MOP content directly to Jenkins pipeline script"""
        jenkins_script = "pipeline {\n"
        jenkins_script += "    agent any\n\n"
        jenkins_script += "    stages {\n"
        
        # Try to identify sections/steps in the MOP content
        sections = JenkinsConverter._identify_sections(mop_content)
        
        for i, section in enumerate(sections):
            section_name = section.get('name', f'Step {i+1}')
            section_content = section.get('content', '')
            
            jenkins_script += f"        stage('{section_name}') {{\n"
            jenkins_script += "            steps {\n"
            
            # Convert the section content to shell script steps
            shell_steps = JenkinsConverter._convert_to_shell_steps(section_content)
            for step in shell_steps:
                jenkins_script += f"                sh '''{step}'''\n"
            
            jenkins_script += "            }\n"
            jenkins_script += "        }\n\n"
        
        jenkins_script += "    }\n"
        
        # Add post section
        jenkins_script += """
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
"""
        
        jenkins_script += "}\n"
        return jenkins_script
    
    @staticmethod
    def _identify_sections(mop_content: str) -> List[Dict[str, str]]:
        """Identify sections in the MOP content"""
        sections = []
        
        # Try to identify sections based on common patterns
        # Look for numbered sections, headings, etc.
        
        # Pattern 1: Numbered sections (e.g., "1. Section Name")
        numbered_sections = re.findall(r'(\d+\.\s*([^\n]+))(.*?)(?=\d+\.\s*[^\n]+|\Z)', mop_content, re.DOTALL)
        if numbered_sections:
            for _, name, content in numbered_sections:
                sections.append({
                    'name': name.strip(),
                    'content': content.strip()
                })
            return sections
        
        # Pattern 2: Heading-based sections
        heading_sections = re.findall(r'(#+\s*([^\n]+))(.*?)(?=#+\s*[^\n]+|\Z)', mop_content, re.DOTALL)
        if heading_sections:
            for _, name, content in heading_sections:
                sections.append({
                    'name': name.strip(),
                    'content': content.strip()
                })
            return sections
        
        # Pattern 3: ALL CAPS headings
        caps_sections = re.findall(r'([A-Z][A-Z\s]+[A-Z])(.*?)(?=[A-Z][A-Z\s]+[A-Z]|\Z)', mop_content, re.DOTALL)
        if caps_sections:
            for name, content in caps_sections:
                sections.append({
                    'name': name.strip(),
                    'content': content.strip()
                })
            return sections
        
        # If no patterns match, create a single section
        if not sections:
            sections.append({
                'name': 'Execute MOP',
                'content': mop_content
            })
        
        return sections
    
    @staticmethod
    def _convert_to_shell_steps(content: str) -> List[str]:
        """Convert text content to shell script steps"""
        steps = []
        
        # Split by lines and process each line
        lines = content.split('\n')
        current_step = []
        
        for line in lines:
            line = line.strip()
            if not line:
                # Empty line could indicate a step boundary
                if current_step:
                    steps.append('\n'.join(current_step))
                    current_step = []
                continue
            
            # Check if this looks like a command
            if re.match(r'^[a-zA-Z0-9_\-\.]+\s', line) and not line.startswith(('•', '·', '-', '*', '>')):
                # This could be a command - add it as a separate step
                if current_step:
                    steps.append('\n'.join(current_step))
                    current_step = []
                current_step.append(line)
            else:
                # This is likely a description or continuation - append to current step
                if line.startswith(('•', '·', '-', '*')) and line[1:].strip():
                    # This is a bullet point with content - might be a command
                    bullet_content = line[1:].strip()
                    if re.match(r'^[a-zA-Z0-9_\-\.]+\s', bullet_content):
                        # This looks like a command
                        if current_step:
                            steps.append('\n'.join(current_step))
                            current_step = []
                        current_step.append(bullet_content)
                    else:
                        # Just append as is
                        current_step.append(f"echo '{line}'")
                else:
                    # Echo non-command lines as comments
                    current_step.append(f"echo '{line}'")
        
        # Add the last step if any
        if current_step:
            steps.append('\n'.join(current_step))
        
        # If no steps were identified, add a placeholder
        if not steps:
            steps.append("echo 'Executing MOP instructions'")
        
        return steps
    
    @staticmethod
    def _get_data_import_step(config: Dict[str, Any]) -> str:
        """Generate Jenkins step for data import"""
        source = config.get('source', 'unknown')
        path = config.get('path', '')
        
        if source == 'file':
            return f"                sh 'cat {path} > imported_data.txt'\n"
        elif source == 'database':
            db_name = config.get('dbName', 'database')
            query = config.get('query', 'SELECT * FROM table')
            return f"                sh '''\n                    echo 'Importing from database {db_name}'\n                    echo 'Running query: {query}'\n                '''\n"
        elif source == 'api':
            url = config.get('url', 'https://api.example.com')
            return f"                sh 'curl -s {url} > api_data.json'\n"
        else:
            return "                echo 'Importing data from source'\n"
    
    @staticmethod
    def _get_transform_step(config: Dict[str, Any]) -> str:
        """Generate Jenkins step for data transformation"""
        transform_type = config.get('type', 'basic')
        
        if transform_type == 'map':
            return "                sh '''\n                    echo 'Applying map transformation'\n                    # Map transformation logic\n                '''\n"
        elif transform_type == 'filter':
            return "                sh '''\n                    echo 'Applying filter transformation'\n                    # Filter transformation logic\n                '''\n"
        elif transform_type == 'aggregate':
            return "                sh '''\n                    echo 'Applying aggregation'\n                    # Aggregation logic\n                '''\n"
        else:
            return "                echo 'Transforming data'\n"
    
    @staticmethod
    def _get_filter_step(config: Dict[str, Any]) -> str:
        """Generate Jenkins step for filtering"""
        filter_condition = config.get('condition', '')
        
        return f"                sh '''\n                    echo 'Filtering data with condition: {filter_condition}'\n                    # Filtering logic\n                '''\n"
    
    @staticmethod
    def _get_validate_step(config: Dict[str, Any]) -> str:
        """Generate Jenkins step for validation"""
        validation_rules = config.get('rules', [])
        rules_str = ', '.join(validation_rules) if validation_rules else 'default rules'
        
        return f"                sh '''\n                    echo 'Validating data with rules: {rules_str}'\n                    # Validation logic\n                '''\n"
    
    @staticmethod
    def _get_export_step(config: Dict[str, Any]) -> str:
        """Generate Jenkins step for export"""
        destination = config.get('destination', 'file')
        path = config.get('path', 'output.txt')
        
        if destination == 'file':
            return f"                sh 'echo \"Exporting data to {path}\"'\n"
        elif destination == 'database':
            db_name = config.get('dbName', 'database')
            return f"                sh 'echo \"Exporting to database {db_name}\"'\n"
        elif destination == 'api':
            url = config.get('url', 'https://api.example.com')
            return f"                sh 'echo \"Posting data to API {url}\"'\n"
        else:
            return "                echo 'Exporting data'\n"
    
    @staticmethod
    def _get_script_step(config: Dict[str, Any]) -> str:
        """Generate Jenkins step for custom script"""
        script = config.get('script', '')
        if script:
            # Escape single quotes in the script
            script = script.replace("'", "\\'")
            return f"                sh '''\n{script}\n                '''\n"
        else:
            return "                echo 'Executing custom script'\n"
    
    @staticmethod
    def _get_notification_step(config: Dict[str, Any]) -> str:
        """Generate Jenkins step for notification"""
        channel = config.get('channel', 'email')
        message = config.get('message', 'Pipeline notification')
        
        if channel == 'email':
            recipients = config.get('recipients', [])
            recipients_str = ', '.join(recipients) if recipients else 'admin@example.com'
            return f"                echo 'Sending email notification to {recipients_str}: {message}'\n"
        elif channel == 'slack':
            return f"                echo 'Sending Slack notification: {message}'\n"
        else:
            return f"                echo 'Sending notification: {message}'\n"
    
    @staticmethod
    def _get_basic_pipeline_template() -> str:
        """Return a basic Jenkins pipeline template"""
        return """pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code'
                // checkout scm
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building application'
                // Build commands go here
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests'
                // Test commands go here
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deploying application'
                // Deployment commands go here
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
"""