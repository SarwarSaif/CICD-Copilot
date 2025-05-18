import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function UploadSection() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Move to next file or complete upload
      if (currentFileIndex < uploadingFiles.length - 1) {
        setCurrentFileIndex(prev => prev + 1);
        setUploadProgress(Math.floor(((currentFileIndex + 1) / uploadingFiles.length) * 100));
      } else {
        // All files uploaded
        setUploadingFiles([]);
        setCurrentFileIndex(0);
        setUploadProgress(0);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
        queryClient.invalidateQueries({ queryKey: ['/api/photos/recent'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        
        toast({
          title: 'Upload complete',
          description: `Successfully uploaded ${uploadingFiles.length} photos.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
      
      // Reset upload state
      setUploadingFiles([]);
      setCurrentFileIndex(0);
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadingFiles(acceptedFiles);
      setCurrentFileIndex(0);
      setUploadProgress(0);
      
      // Start upload process
      uploadMutation.mutate(acceptedFiles[0]);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.heic']
    }
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Upload Photos</h2>
        <a href="/photos" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all uploads</a>
      </div>
      
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-all duration-200",
          isDragActive ? "border-primary-500 bg-primary-50" : ""
        )}
      >
        <i className="ri-upload-cloud-2-line text-5xl text-gray-400 mb-3"></i>
        <h3 className="text-lg font-medium text-gray-700 mb-1">Drag & drop your photos here</h3>
        <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
        <Button>
          <i className="ri-add-line mr-2"></i> Select Files
        </Button>
        <input {...getInputProps()} />
        <p className="text-xs text-gray-500 mt-3">Supported formats: JPEG, PNG, GIF, HEIC</p>
      </div>
      
      {uploadingFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Uploading {uploadingFiles.length} photos...
            </span>
            <span className="text-sm text-gray-500">
              {currentFileIndex + 1}/{uploadingFiles.length}
            </span>
          </div>
          <Progress value={uploadProgress} className="h-2 w-full" />
        </div>
      )}
    </div>
  );
}
