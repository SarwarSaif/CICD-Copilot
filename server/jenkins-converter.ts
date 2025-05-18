/**
 * Jenkins Pipeline Converter
 * Utility for converting MOP content to Jenkins Pipeline format
 */

import { MopFile, Pipeline } from "@shared/schema";

/**
 * Convert MOP content or pipeline configuration to Jenkins Pipeline format
 */
export function convertToJenkinsPipeline(mopContent: string, pipeline?: Pipeline): string {
  try {
    // If there's an existing Jenkins code in the pipeline config, return it
    if (pipeline?.config && typeof pipeline.config === 'object' && pipeline.config !== null && 'jenkins_code' in pipeline.config) {
      return pipeline.config.jenkins_code as string;
    }
    
    // Otherwise, convert MOP content to Jenkins pipeline
    return generateJenkinsPipeline(mopContent);
  } catch (error) {
    console.error('Error converting to Jenkins pipeline:', error);
    return getBasicPipelineTemplate();
  }
}

/**
 * Generate Jenkins pipeline from MOP content
 */
function generateJenkinsPipeline(mopContent: string): string {
  // Parse MOP content to identify sections/steps
  const sections = identifySections(mopContent);
  
  let pipeline = "pipeline {\n";
  pipeline += "    agent any\n\n";
  pipeline += "    stages {\n";
  
  // Create a stage for each identified section
  for (const section of sections) {
    pipeline += `        stage('${section.name}') {\n`;
    pipeline += "            steps {\n";
    
    // Convert section content to shell steps
    const shellSteps = convertToShellSteps(section.content);
    for (const step of shellSteps) {
      pipeline += `                sh '''\n${step}\n                '''\n`;
    }
    
    pipeline += "            }\n";
    pipeline += "        }\n\n";
  }
  
  pipeline += "    }\n";
  
  // Add post section for notifications
  pipeline += `
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
`;
  
  pipeline += "}\n";
  return pipeline;
}

/**
 * Identify sections in MOP content based on various patterns
 */
function identifySections(mopContent: string): Array<{ name: string, content: string }> {
  const sections: Array<{ name: string, content: string }> = [];
  
  // Pattern 1: Numbered sections (e.g. "1. Section Name")
  const numberedPattern = /(\d+\.\s*([^\n]+))([\s\S]*?)(?=\d+\.\s*[^\n]+|$)/g;
  let match;
  let foundSections = false;
  
  while ((match = numberedPattern.exec(mopContent)) !== null) {
    foundSections = true;
    const [_, __, name, content] = match;
    sections.push({
      name: name.trim(),
      content: content.trim()
    });
  }
  
  // If we didn't find numbered sections, try heading-based sections
  if (!foundSections) {
    const headingPattern = /(#+\s*([^\n]+))([\s\S]*?)(?=#+\s*[^\n]+|$)/g;
    while ((match = headingPattern.exec(mopContent)) !== null) {
      foundSections = true;
      const [_, __, name, content] = match;
      sections.push({
        name: name.trim(),
        content: content.trim()
      });
    }
  }
  
  // If still no sections found, try ALL CAPS headings
  if (!foundSections) {
    const capsPattern = /([A-Z][A-Z\s]+[A-Z])([\s\S]*?)(?=[A-Z][A-Z\s]+[A-Z]|$)/g;
    while ((match = capsPattern.exec(mopContent)) !== null) {
      foundSections = true;
      const [_, name, content] = match;
      sections.push({
        name: name.trim(),
        content: content.trim()
      });
    }
  }
  
  // If no patterns match, create a single section
  if (!foundSections) {
    sections.push({
      name: 'Execute MOP',
      content: mopContent
    });
  }
  
  return sections;
}

/**
 * Convert text content to shell script steps
 */
function convertToShellSteps(content: string): string[] {
  const steps: string[] = [];
  const lines = content.split('\n');
  let currentStep: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      // Empty line could indicate a step boundary
      if (currentStep.length > 0) {
        steps.push(currentStep.join('\n'));
        currentStep = [];
      }
      continue;
    }
    
    // Check if this looks like a command (starts with word followed by space, and not a bullet point)
    if (/^[a-zA-Z0-9_\-\.]+\s/.test(trimmedLine) && 
        !trimmedLine.startsWith('•') && 
        !trimmedLine.startsWith('·') && 
        !trimmedLine.startsWith('-') && 
        !trimmedLine.startsWith('*') && 
        !trimmedLine.startsWith('>')) {
      // This could be a command - add it as a separate step
      if (currentStep.length > 0) {
        steps.push(currentStep.join('\n'));
        currentStep = [];
      }
      currentStep.push(trimmedLine);
    } else {
      // This is likely a description or continuation - echo as comment
      currentStep.push(`echo '${trimmedLine.replace(/'/g, "\\'")}'`);
    }
  }
  
  // Add the last step if any
  if (currentStep.length > 0) {
    steps.push(currentStep.join('\n'));
  }
  
  // If no steps were identified, add a placeholder
  if (steps.length === 0) {
    steps.push("echo 'Executing MOP instructions'");
  }
  
  return steps;
}

/**
 * Get a basic Jenkins pipeline template
 */
function getBasicPipelineTemplate(): string {
  return `pipeline {
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
`;
}