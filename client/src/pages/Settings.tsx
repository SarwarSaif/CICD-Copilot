import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Github, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define form schema for integration settings
const integrationSettingsSchema = z.object({
  jenkinsUrl: z.string().url("Please enter a valid Jenkins URL").or(z.string().length(0)),
  jenkinsUsername: z.string(),
  jenkinsToken: z.string(),
  jenkinsJobTemplate: z.string(),
  githubUrl: z.string().url("Please enter a valid GitHub URL").or(z.string().length(0)),
  githubUsername: z.string(),
  githubToken: z.string(),
  githubRepository: z.string(),
  githubBranch: z.string().default("main")
});

type IntegrationSettingsFormValues = z.infer<typeof integrationSettingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current user
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
  });
  
  // Fetch integration settings
  const { data: integrationSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/integration-settings", userData?.id],
    enabled: !!userData?.id,
    queryFn: async () => {
      const response = await fetch(`/api/integration-settings/${userData?.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch integration settings");
      }
      return response.json();
    }
  });

  // Set up form
  const form = useForm<IntegrationSettingsFormValues>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: {
      jenkinsUrl: "",
      jenkinsUsername: "",
      jenkinsToken: "",
      jenkinsJobTemplate: "",
      githubUrl: "",
      githubUsername: "",
      githubToken: "",
      githubRepository: "",
      githubBranch: "main"
    }
  });

  // Update form values when settings are loaded
  useEffect(() => {
    if (integrationSettings) {
      form.reset({
        jenkinsUrl: integrationSettings.jenkinsUrl || "",
        jenkinsUsername: integrationSettings.jenkinsUsername || "",
        jenkinsToken: integrationSettings.jenkinsToken || "",
        jenkinsJobTemplate: integrationSettings.jenkinsJobTemplate || "",
        githubUrl: integrationSettings.githubUrl || "",
        githubUsername: integrationSettings.githubUsername || "",
        githubToken: integrationSettings.githubToken || "",
        githubRepository: integrationSettings.githubRepository || "",
        githubBranch: integrationSettings.githubBranch || "main"
      });
    }
  }, [integrationSettings, form]);

  // Set up mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: IntegrationSettingsFormValues) => {
      return apiRequest(`/api/integration-settings/${userData?.id}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integration-settings", userData?.id] });
      toast({
        title: "Settings Updated",
        description: "Your integration settings have been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update integration settings. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating settings:", error);
    }
  });

  // Form submission handler
  function onSubmit(data: IntegrationSettingsFormValues) {
    updateSettingsMutation.mutate(data);
  }

  return (
    <main className="pt-6 md:pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and integrations</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                Jenkins and GitHub Integration
              </CardTitle>
              <CardDescription>Configure your Jenkins and GitHub integration settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs defaultValue="jenkins" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="jenkins" className="flex items-center">
                        <Server className="mr-2 h-4 w-4" />
                        Jenkins
                      </TabsTrigger>
                      <TabsTrigger value="github" className="flex items-center">
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="jenkins" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="jenkinsUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jenkins URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://jenkins.example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              The URL of your Jenkins server
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="jenkinsUsername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jenkins Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Jenkins username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="jenkinsToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jenkins API Token</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Jenkins API token" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="jenkinsJobTemplate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jenkins Job Template (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Jenkins job configuration XML template" 
                                className="min-h-[150px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Optional XML template for creating new Jenkins jobs
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="github" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="githubUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GitHub URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://github.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              For GitHub Enterprise, enter your custom domain. Leave empty for github.com
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="githubUsername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GitHub Username</FormLabel>
                              <FormControl>
                                <Input placeholder="GitHub username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="githubToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GitHub Personal Access Token</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="GitHub token" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="githubRepository"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Repository Name</FormLabel>
                              <FormControl>
                                <Input placeholder="username/repository" {...field} />
                              </FormControl>
                              <FormDescription>
                                Format: username/repository
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="githubBranch"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Branch</FormLabel>
                              <FormControl>
                                <Input placeholder="main" {...field} />
                              </FormControl>
                              <FormDescription>
                                Default branch for pushing pipeline files
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Integration Settings"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>
    </main>
  );
}
