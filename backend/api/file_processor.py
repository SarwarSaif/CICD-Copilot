"""
Utility for processing different file types and extracting text content.
Supports TXT, Word (DOCX, DOC), and PDF files.
"""

import os
import io
import logging
from typing import Optional

# Initialize logger
logger = logging.getLogger(__name__)

class FileProcessor:
    """
    Process various file types and extract text content.
    Supports: TXT, Word (DOCX, DOC), and PDF files.
    """
    
    @staticmethod
    def extract_text_from_file(file_path: str, file_type: str) -> Optional[str]:
        """
        Extract text content from a file based on its type.
        
        Args:
            file_path: Path to the file
            file_type: Type of the file (txt, docx, doc, pdf)
            
        Returns:
            String containing the extracted text, or None if extraction failed
        """
        try:
            if file_type == 'txt':
                return FileProcessor._extract_text_from_txt(file_path)
            elif file_type == 'docx':
                return FileProcessor._extract_text_from_docx(file_path)
            elif file_type == 'doc':
                return FileProcessor._extract_text_from_doc(file_path)
            elif file_type == 'pdf':
                return FileProcessor._extract_text_from_pdf(file_path)
            else:
                logger.warning(f"Unsupported file type: {file_type}")
                return None
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            return None
    
    @staticmethod
    def _extract_text_from_txt(file_path: str) -> str:
        """Extract text from a TXT file"""
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    
    @staticmethod
    def _extract_text_from_docx(file_path: str) -> str:
        """Extract text from a DOCX file"""
        try:
            from docx import Document
            document = Document(file_path)
            return '\n'.join([paragraph.text for paragraph in document.paragraphs])
        except ImportError:
            logger.error("python-docx package is not installed. Install with: pip install python-docx")
            raise
    
    @staticmethod
    def _extract_text_from_doc(file_path: str) -> str:
        """Extract text from a DOC file"""
        try:
            # Try using textract for DOC files
            import textract
            return textract.process(file_path).decode('utf-8')
        except ImportError:
            logger.error("textract package is not installed. Install with: pip install textract")
            raise
    
    @staticmethod
    def _extract_text_from_pdf(file_path: str) -> str:
        """Extract text from a PDF file"""
        try:
            import PyPDF2
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page_num in range(len(reader.pages)):
                    text += reader.pages[page_num].extract_text() + "\n"
                return text
        except ImportError:
            logger.error("PyPDF2 package is not installed. Install with: pip install PyPDF2")
            raise
    
    @staticmethod
    def process_file_upload(file, file_name: str) -> tuple:
        """
        Process an uploaded file and extract content
        
        Args:
            file: The uploaded file object
            file_name: The name of the uploaded file
            
        Returns:
            Tuple of (file_type, content)
        """
        # Determine file type from filename
        file_type = FileProcessor._get_file_type_from_filename(file_name)
        
        # Save uploaded file temporarily
        temp_path = f"/tmp/{file_name}"
        with open(temp_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        # Extract content based on file type
        content = FileProcessor.extract_text_from_file(temp_path, file_type)
        
        # Clean up temporary file
        try:
            os.remove(temp_path)
        except:
            pass
            
        return file_type, content
    
    @staticmethod
    def _get_file_type_from_filename(filename: str) -> str:
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