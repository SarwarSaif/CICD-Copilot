import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UploadSection from "@/components/dashboard/UploadSection";
import RecentPhotos from "@/components/dashboard/RecentPhotos";
import CollectionsGrid from "@/components/dashboard/CollectionsGrid";
import ShareSection from "@/components/dashboard/ShareSection";
import { useQuery } from "@tanstack/react-query";

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

  // Fetch recent photos
  const { data: recentPhotos, isLoading: photosLoading } = useQuery({
    queryKey: ["/api/photos/recent"],
  });

  // Fetch collections
  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ["/api/collections"],
  });

  // Fetch team members
  const { data: teamMembers } = useQuery({
    queryKey: ["/api/team"],
  });

  return (
    <main className="pt-6 md:pt-0">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <DashboardHeader
          firstName={userData?.firstName || "User"}
          stats={statsData || { totalPhotos: 0, collections: 0, shared: 0 }}
        />

        <UploadSection />

        <RecentPhotos
          photos={recentPhotos || []}
          isLoading={photosLoading}
        />

        <CollectionsGrid
          collections={collections || []}
          isLoading={collectionsLoading}
        />

        <ShareSection
          teamMembers={teamMembers || []}
        />
      </div>
    </main>
  );
}
