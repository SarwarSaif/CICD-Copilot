import yaml
import json
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PipelineStep(BaseModel):
    """A step in the pipeline with configuration details."""
    name: str = Field(description="Name of the pipeline step")
    type: str = Field(description="Type of the step (data_import, transform, etc.)")
    config: Dict[str, Any] = Field(description="Configuration for the step")
    position: int = Field(description="Position of the step in the pipeline")

class PipelineConfig(BaseModel):
    """Configuration for the entire pipeline."""
    steps: List[PipelineStep] = Field(description="List of pipeline steps")

class MopProcessor:
    """
    Process Manual Operation Procedure (MOP) files using LangChain to convert them into executable pipelines.
    """
    
    def __init__(self, api_key=None):
        """Initialize the MOP processor with an optional API key."""
        # Use provided API key or get from environment
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Provide it as an argument or set OPENAI_API_KEY environment variable.")
        
        self.llm = ChatOpenAI(
            temperature=0,
            model="gpt-3.5-turbo",
            api_key=self.api_key
        )
        
        # Setup the parser
        self.parser = JsonOutputParser(pydantic_object=PipelineConfig)
        
        # Setup the prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at converting Manual Operation Procedure (MOP) files into executable pipeline configurations.
            
Your task is to parse the provided MOP file and extract a structured pipeline configuration.
Each pipeline should contain steps with:
- A name
- A type (e.g., data_import, transform, data_export, etc.)
- Configuration parameters specific to the step type
- A position in the sequence

Parse the MOP file carefully, understanding the intended sequence of operations. 
Ensure all configuration parameters are preserved.
If the MOP file format is YAML, parse it correctly.
If the format is a text description, extract the important elements and create a logical pipeline structure.

Output ONLY a JSON response with the PipelineConfig schema."""),
            ("human", """Here's the MOP file content:
            
{mop_content}

Convert this into a structured pipeline configuration.""")
        ])
        
        # Create the chain
        self.chain = self.prompt | self.llm | self.parser
    
    def process_mop_file(self, mop_content):
        """
        Process the content of a MOP file and convert it to a pipeline configuration.
        
        Args:
            mop_content (str): The content of the MOP file
            
        Returns:
            dict: A pipeline configuration with steps
        """
        try:
            # First try to parse as YAML if it looks like YAML
            if ":" in mop_content and ("-" in mop_content or "  " in mop_content):
                try:
                    # Check if it's already a valid YAML with steps
                    yaml_content = yaml.safe_load(mop_content)
                    if isinstance(yaml_content, dict) and "steps" in yaml_content:
                        # Add position information if missing
                        for i, step in enumerate(yaml_content["steps"]):
                            if "position" not in step:
                                step["position"] = i + 1
                        return yaml_content
                except Exception:
                    # Not valid YAML or doesn't have the expected structure
                    pass
            
            # Use LangChain to process the MOP file
            result = self.chain.invoke({"mop_content": mop_content})
            return result
        
        except Exception as e:
            raise Exception(f"Error processing MOP file: {str(e)}")
    
    def validate_pipeline_config(self, config):
        """
        Validate a pipeline configuration against the expected schema.
        
        Args:
            config (dict): The pipeline configuration to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        try:
            PipelineConfig(**config)
            return True
        except Exception:
            return False