import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  return (
    <main className="pt-6 md:pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={userData?.firstName || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={userData?.lastName || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={userData?.email || ""} />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive updates about your account via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">New Shares</h4>
                  <p className="text-sm text-gray-500">Get notified when someone shares photos with you</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Marketing</h4>
                  <p className="text-sm text-gray-500">Receive tips and updates about new features</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Accounts</CardTitle>
              <CardDescription>Connect your social media accounts for easy sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="ri-twitter-fill text-xl text-blue-400 mr-2"></i>
                  <div>
                    <h4 className="text-sm font-medium">Twitter</h4>
                    <p className="text-sm text-gray-500">{userData?.connectedAccounts?.twitter ? "Connected" : "Not connected"}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {userData?.connectedAccounts?.twitter ? "Disconnect" : "Connect"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="ri-instagram-line text-xl text-pink-500 mr-2"></i>
                  <div>
                    <h4 className="text-sm font-medium">Instagram</h4>
                    <p className="text-sm text-gray-500">{userData?.connectedAccounts?.instagram ? "Connected" : "Not connected"}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {userData?.connectedAccounts?.instagram ? "Disconnect" : "Connect"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="ri-linkedin-box-fill text-xl text-blue-600 mr-2"></i>
                  <div>
                    <h4 className="text-sm font-medium">LinkedIn</h4>
                    <p className="text-sm text-gray-500">{userData?.connectedAccounts?.linkedin ? "Connected" : "Not connected"}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {userData?.connectedAccounts?.linkedin ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
