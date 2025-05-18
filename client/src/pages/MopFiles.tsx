import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  FileCode, 
  GitBranch, 
  Search, 
  Plus, 
  Clock, 
  Download,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface MopFile {
  id: number;
  name: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function UploadMopFileDialog() {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-fill name from filename if not already set
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('mopFile', file);
      formData.append('name', name);
      formData.append('description', description);
      
      await apiRequest('/api/mop-files/upload', {
        method: 'POST',
        body: formData,
        headers: {},
      });
      
      // Reset form
      setName("");
      setDescription("");
      setFile(null);
      setOpen(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/mop-files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mop-files/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Success",
        description: "MOP file uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Upload MOP File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload MOP File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter a name for this MOP file"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter a description for this MOP file"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">MOP File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-all duration-200 cursor-pointer">
              <input 
                type="file" 
                id="file" 
                className="hidden" 
                accept=".txt,.yaml,.yml,.mop" 
                onChange={handleFileChange}
                required
              />
              <label htmlFor="file" className="cursor-pointer">
                <FileCode className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {file ? file.name : "Click to select or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: YAML, TXT, MOP
                </p>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MopFiles() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all MOP files
  const { data: mopFiles, isLoading } = useQuery({
    queryKey: ["/api/mop-files"],
  });
  
  // Filter files based on search query
  const filteredFiles = mopFiles ? 
    mopFiles.filter((file: MopFile) => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      file.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : 
    [];
  
  const handleCreatePipeline = (mopFileId: number) => {
    // This would navigate to pipeline creation page with the MOP file ID
    console.log(`Create pipeline from MOP file ${mopFileId}`);
  };
  
  const handleViewDetails = (mopFile: MopFile) => {
    // This would open a dialog or navigate to a detail page
    console.log(`View details for MOP file ${mopFile.id}`, mopFile);
  };
  
  return (
    <main className="pt-6 md:pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MOP Files</h1>
            <p className="text-gray-600 mt-1">Manage your Manual Operational Procedure files</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <UploadMopFileDialog />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search MOP files..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className="space-y-4">
            {filteredFiles.map((file: MopFile) => (
              <Card 
                key={file.id} 
                className="bg-white overflow-hidden hover:shadow-md transition-shadow border-gray-200"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-md mr-3 flex-shrink-0">
                        <FileCode className="h-5 w-5 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">{file.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {file.description || 'No description'}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Created {formatDate(new Date(file.createdAt))}</span>
                          {file.updatedAt !== file.createdAt && (
                            <span className="ml-3">
                              • Updated {formatDate(new Date(file.updatedAt))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleViewDetails(file)}
                      >
                        <FileCode className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleCreatePipeline(file.id)}
                      >
                        <GitBranch className="h-4 w-4 mr-1" /> Create Pipeline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <FileCode className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchQuery ? 'No matching MOP files found' : 'No MOP files yet'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term or clear the search' : 'Upload your first MOP file to get started'}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}