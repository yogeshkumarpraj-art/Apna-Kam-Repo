
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Workflow, HandCoins, Star, Briefcase } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function getStats() {
    const usersQuery = collection(db, "users");
    const workersQuery = query(collection(db, "users"), where("isWorker", "==", true));
    const bookingsQuery = collection(db, "bookings");
    const reviewsQuery = collection(db, "reviews");

    const [userSnapshot, workerSnapshot, bookingSnapshot, reviewSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(workersQuery),
        getDocs(bookingsQuery),
        getDocs(reviewsQuery),
    ]);

    const totalUsers = userSnapshot.size;
    const totalWorkers = workerSnapshot.size;
    const totalBookings = bookingSnapshot.size;
    const totalReviews = reviewSnapshot.size;

    return { totalUsers, totalWorkers, totalBookings, totalReviews };
}


export default async function AdminDashboard() {
  const { totalUsers, totalWorkers, totalBookings, totalReviews } = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 font-headline">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users on the platform</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkers}</div>
            <p className="text-xs text-muted-foreground">Approved and pending workers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Across all statuses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">Submitted by customers</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>An overview of recent sign-ups and job postings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-muted-foreground">Recent activity feed will be shown here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
