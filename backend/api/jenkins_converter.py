"""
Jenkins Pipeline Converter
Utility for converting MOP content to Jenkins Pipeline format
"""
import re
import json
from typing import List, Dict, Optional, Any


def convert_to_jenkins_pipeline(mop_content: str, pipeline: Optional[Dict[str, Any]] = None) -> str:
    """
    Convert MOP content or pipeline configuration to Jenkins Pipeline format
    """
    try:
        # If there's an existing Jenkins code in the pipeline config, return it
        if pipeline and pipeline.get('config'):
            config = pipeline.get('config')
            if isinstance(config, dict) and 'jenkins_code' in config:
                return config['jenkins_code']
        
        # Otherwise, convert MOP content to Jenkins pipeline
        return generate_jenkins_pipeline(mop_content)
    except Exception as e:
        print(f'Error converting to Jenkins pipeline: {e}')
        return get_basic_pipeline_template()


def generate_jenkins_pipeline(mop_content: str) -> str:
    """
    Generate Jenkins pipeline from MOP content
    """
    # Parse MOP content to identify sections/steps
    sections = identify_sections(mop_content)
    
    pipeline = "pipeline {\n"
    pipeline += "    agent any\n\n"
    pipeline += "    stages {\n"
    
    # Create a stage for each identified section
    for section in sections:
        pipeline += f"        stage('{section['name']}') {{\n"
        pipeline += "            steps {\n"
        
        # Convert section content to shell steps
        shell_steps = convert_to_shell_steps(section['content'])
        for step in shell_steps:
            pipeline += f"                sh '''\n{step}\n                '''\n"
        
        pipeline += "            }\n"
        pipeline += "        }\n\n"
    
    pipeline += "    }\n"
    
    # Add post section for notifications
    pipeline += """
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
"""
    
    pipeline += "}\n"
    return pipeline


def identify_sections(mop_content: str) -> List[Dict[str, str]]:
    """
    Identify sections in MOP content based on various patterns
    """
    sections = []
    
    # Pattern 1: Numbered sections (e.g. "1. Section Name")
    numbered_pattern = r'(\d+\.\s*([^\n]+))([\s\S]*?)(?=\d+\.\s*[^\n]+|$)'
    matches = re.finditer(numbered_pattern, mop_content)
    found_sections = False
    
    for match in matches:
        found_sections = True
        name = match.group(2).strip()
        content = match.group(3).strip()
        sections.append({
            'name': name,
            'content': content
        })
    
    # If we didn't find numbered sections, try heading-based sections
    if not found_sections:
        heading_pattern = r'(#+\s*([^\n]+))([\s\S]*?)(?=#+\s*[^\n]+|$)'
        matches = re.finditer(heading_pattern, mop_content)
        
        for match in matches:
            found_sections = True
            name = match.group(2).strip()
            content = match.group(3).strip()
            sections.append({
                'name': name,
                'content': content
            })
    
    # If still no sections found, try ALL CAPS headings
    if not found_sections:
        caps_pattern = r'([A-Z][A-Z\s]+[A-Z])([\s\S]*?)(?=[A-Z][A-Z\s]+[A-Z]|$)'
        matches = re.finditer(caps_pattern, mop_content)
        
        for match in matches:
            found_sections = True
            name = match.group(1).strip()
            content = match.group(2).strip()
            sections.append({
                'name': name,
                'content': content
            })
    
    # If no patterns match, create a single section
    if not found_sections:
        sections.append({
            'name': 'Execute MOP',
            'content': mop_content
        })
    
    return sections


def convert_to_shell_steps(content: str) -> List[str]:
    """
    Convert text content to shell script steps
    """
    steps = []
    lines = content.split('\n')
    current_step = []
    
    for line in lines:
        trimmed_line = line.strip()
        if not trimmed_line:
            # Empty line could indicate a step boundary
            if current_step:
                steps.append('\n'.join(current_step))
                current_step = []
            continue
        
        # Check if this looks like a command (starts with word followed by space, and not a bullet point)
        if (re.match(r'^[a-zA-Z0-9_\-\.]+\s', trimmed_line) and 
            not trimmed_line.startswith('•') and 
            not trimmed_line.startswith('·') and 
            not trimmed_line.startswith('-') and 
            not trimmed_line.startswith('*') and 
            not trimmed_line.startswith('>')):
            # This could be a command - add it as a separate step
            if current_step:
                steps.append('\n'.join(current_step))
                current_step = []
            current_step.append(trimmed_line)
        else:
            # This is likely a description or continuation - echo as comment
            escaped_line = trimmed_line.replace("'", "\\'")
            current_step.append(f"echo '{escaped_line}'")
    
    # Add the last step if any
    if current_step:
        steps.append('\n'.join(current_step))
    
    # If no steps were identified, add a placeholder
    if not steps:
        steps.append("echo 'Executing MOP instructions'")
    
    return steps


def get_basic_pipeline_template() -> str:
    """
    Get a basic Jenkins pipeline template
    """
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