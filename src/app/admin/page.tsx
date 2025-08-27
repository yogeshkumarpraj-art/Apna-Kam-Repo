
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Workflow, HandCoins, Star, Briefcase } from "lucide-react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OverviewChart } from "./overview-chart";
import { subMonths, format } from 'date-fns';


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

async function getMonthlyBookingData() {
    const today = new Date();
    const sixMonthsAgo = subMonths(today, 5); // 5 to include the current month fully
    sixMonthsAgo.setDate(1); // Start from the beginning of the month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, "bookings"),
        where("createdAt", ">=", Timestamp.fromDate(sixMonthsAgo))
    );

    const querySnapshot = await getDocs(q);

    // Initialize months data
    const monthlyData: { [key: string]: number } = {};
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(today, i);
        const monthName = format(date, 'MMM');
        monthlyData[monthName] = 0;
    }
    
    querySnapshot.forEach(doc => {
        const booking = doc.data();
        const bookingDate = booking.createdAt.toDate();
        const monthName = format(bookingDate, 'MMM');
        if (monthName in monthlyData) {
            monthlyData[monthName]++;
        }
    });

    return Object.entries(monthlyData).map(([name, total]) => ({ name, total }));
}


export default async function AdminDashboard() {
  const { totalUsers, totalWorkers, totalBookings, totalReviews } = await getStats();
  const bookingData = await getMonthlyBookingData();

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
            <CardTitle>Overview</CardTitle>
            <CardDescription>Monthly booking trends for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={bookingData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
