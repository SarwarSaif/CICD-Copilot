import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateInitials } from '@/lib/utils';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  initials?: string;
}

interface ShareSectionProps {
  teamMembers: TeamMember[];
}

export default function ShareSection({ teamMembers }: ShareSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Share Your Memories</h2>
      </div>
      
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Quick Share</h3>
            <p className="text-sm text-gray-600 mb-4">Easily share your photos to popular platforms</p>
            
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <i className="ri-twitter-fill text-xl text-blue-400 mb-1"></i>
                <span className="text-xs text-gray-700">Twitter</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <i className="ri-instagram-line text-xl text-pink-500 mb-1"></i>
                <span className="text-xs text-gray-700">Instagram</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <i className="ri-linkedin-box-fill text-xl text-blue-600 mb-1"></i>
                <span className="text-xs text-gray-700">LinkedIn</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <i className="ri-slack-fill text-xl text-purple-500 mb-1"></i>
                <span className="text-xs text-gray-700">Slack</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <i className="ri-whatsapp-line text-xl text-green-500 mb-1"></i>
                <span className="text-xs text-gray-700">WhatsApp</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <i className="ri-more-2-fill text-xl text-gray-500 mb-1"></i>
                <span className="text-xs text-gray-700">More</span>
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Share with Team</h3>
            <p className="text-sm text-gray-600 mb-4">Collaborate with your colleagues</p>
            
            <div className="space-y-3">
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium text-xs">
                        {member.initials || generateInitials(member.name)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="px-3 py-1 text-xs font-medium text-primary-600 border border-primary-600 rounded-full hover:bg-primary-50">
                      Share
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">No team members to share with</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
