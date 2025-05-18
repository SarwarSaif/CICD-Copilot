import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  CodeSquare, 
  FlowChart, 
  Share2, 
  Users,
  Plus,
  ArrowUpRight,
  FileCode,
  GitPullRequest,
  Clock3,
  CheckCircle,
  XCircle 
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DashboardHeaderProps {
  firstName: string;
  stats: {
    totalMopFiles: number;
    pipelines: number;
    shared: number;
  }
}

function DashboardHeader({ firstName, stats }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
      <p className="text-gray-600 mt-1">Convert Manual MOPs into executable pipelines</p>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md">
              <FileCode className="h-5 w-5 text-primary-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">MOP Files</p>
              <p className="text-xl font-semibold">{stats.totalMopFiles.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-md">
              <GitPullRequest className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pipelines</p>
              <p className="text-xl font-semibold">{stats.pipelines}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-md">
              <Share2 className="h-5 w-5 text-purple-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Shared</p>
              <p className="text-xl font-semibold">{stats.shared}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function UploadMopSection() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Upload MOP File</h2>
        <a href="/mop-files" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
          View all files <ArrowUpRight className="h-3 w-3 ml-1" />
        </a>
      </div>
      
      <Card className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-all duration-200">
        <CardContent className="p-0 flex flex-col items-center">
          <CodeSquare className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Drag & drop your MOP files here</h3>
          <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Upload MOP File
          </Button>
          <p className="text-xs text-gray-500 mt-3">Supported formats: YAML, TXT, MOP</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface MopFile {
  id: number;
  name: string;
  description: string;
  content: string;
  createdAt: string;
}

interface RecentMopFilesProps {
  mopFiles: MopFile[];
  isLoading: boolean;
}

function RecentMopFiles({ mopFiles, isLoading }: RecentMopFilesProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent MOP Files</h2>
        <a href="/mop-files" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
          View all files <ArrowUpRight className="h-3 w-3 ml-1" />
        </a>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : mopFiles.length > 0 ? (
        <div className="space-y-4">
          {mopFiles.map((file) => (
            <Card 
              key={file.id} 
              className="bg-white overflow-hidden hover:shadow-md transition-shadow border-gray-200"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-md mr-3">
                      <FileCode className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{file.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{file.description || 'No description'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <Clock3 className="h-3 w-3 inline-block mr-1" /> 
                        {formatDate(new Date(file.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="mr-2">
                      View
                    </Button>
                    <Button size="sm">
                      Create Pipeline
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
            <h3 className="text-lg font-medium text-gray-900">No MOP files yet</h3>
            <p className="text-sm text-gray-500 mt-1">Upload your first MOP file to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface Pipeline {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface RecentPipelinesProps {
  pipelines: Pipeline[];
  isLoading: boolean;
}

function RecentPipelines({ pipelines, isLoading }: RecentPipelinesProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Pipelines</h2>
        <a href="/pipelines" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
          View all pipelines <ArrowUpRight className="h-3 w-3 ml-1" />
        </a>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : pipelines.length > 0 ? (
        <div className="space-y-4">
          {pipelines.map((pipeline) => (
            <Card 
              key={pipeline.id} 
              className="bg-white overflow-hidden hover:shadow-md transition-shadow border-gray-200"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className={`${
                      pipeline.status === 'active' ? 'bg-green-100' : 
                      pipeline.status === 'draft' ? 'bg-yellow-100' : 
                      'bg-gray-100'
                    } p-2 rounded-md mr-3`}>
                      <FlowChart className={`h-5 w-5 ${
                        pipeline.status === 'active' ? 'text-green-500' : 
                        pipeline.status === 'draft' ? 'text-yellow-500' : 
                        'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{pipeline.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{pipeline.description || 'No description'}</p>
                      <div className="flex items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          pipeline.status === 'active' ? 'bg-green-100 text-green-800' : 
                          pipeline.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pipeline.status}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          <Clock3 className="h-3 w-3 inline-block mr-1" /> 
                          {formatDate(new Date(pipeline.createdAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="mr-2">
                      View
                    </Button>
                    <Button size="sm">
                      Execute
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
            <FlowChart className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No pipelines yet</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first pipeline to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TeamSectionProps {
  teamMembers: TeamMember[];
}

function TeamSection({ teamMembers }: TeamSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Team</h2>
      </div>
      
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-base font-medium text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-500 mt-1">Collaborate with your team on pipelines</p>
        </div>
        
        <div className="p-4">
          {teamMembers.length > 0 ? (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium text-xs">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-700">{member.name}</p>
                        <span className="text-xs ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Share
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base font-medium text-gray-700">No team members yet</h3>
              <p className="text-sm text-gray-500 mt-1">Invite team members to collaborate</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" /> Invite Team Member
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    staleTime: Infinity,
  });

  // Fetch stats data
  const { data: statsData } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch recent MOP files
  const { data: recentMopFiles, isLoading: mopFilesLoading } = useQuery({
    queryKey: ["/api/mop-files/recent"],
  });

  // Fetch recent pipelines
  const { data: pipelines, isLoading: pipelinesLoading } = useQuery({
    queryKey: ["/api/pipelines"],
  });

  // Fetch team members
  const { data: teamMembers } = useQuery({
    queryKey: ["/api/team"],
  });

  // Use only the first few pipelines for the dashboard
  const recentPipelines = pipelines ? pipelines.slice(0, 3) : [];

  return (
    <main className="pt-6 md:pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <DashboardHeader
          firstName={userData?.firstName || "User"}
          stats={statsData || { totalMopFiles: 0, pipelines: 0, shared: 0 }}
        />

        <UploadMopSection />

        <RecentMopFiles
          mopFiles={recentMopFiles || []}
          isLoading={mopFilesLoading}
        />

        <RecentPipelines
          pipelines={recentPipelines}
          isLoading={pipelinesLoading}
        />

        <TeamSection
          teamMembers={teamMembers || []}
        />
      </div>
    </main>
  );
}
