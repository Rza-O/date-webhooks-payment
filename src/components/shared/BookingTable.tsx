"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import TimezoneSelect from "react-timezone-select";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

interface Booking {
   id: number;
   roomName: string;
   startTime: string;
   endTime: string;
   timezone: string;
   dayOfWeek: string;
}

const BookingTable = () => {
   const { user } = useUser();
   const userId = user?.id;
   const clerkId = user?.clerkId
   const [bookings, setBookings] = useState<Booking[]>([]);
   const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);

   useEffect(() => {
      if (typeof window !== "undefined") {
         const storedTimezone = localStorage.getItem("timeZone") || Intl.DateTimeFormat().resolvedOptions().timeZone;
         setSelectedTimezone(storedTimezone);
      }
   }, []);

   useEffect(() => {
      if (!userId || !selectedTimezone) return;

      localStorage.setItem("timeZone", selectedTimezone);

      axios
         .get(`/api/bookings?userId=${userId}&timezone=${selectedTimezone}`)
         .then((res) => setBookings(res.data.bookings))
         .catch(() => console.error("Failed to fetch bookings"));
      axios.post("/api/updateTZ", { userId, timezone: selectedTimezone })
         .then(() => toast.success(`Timezone updated to ${selectedTimezone}`))
         .catch(() => toast.error("Failed to update timezone"));
   }, [selectedTimezone, userId]);

   return (
      <div className="p-4">
         <div className="mb-4">
            <TimezoneSelect value={selectedTimezone} onChange={(tz) => setSelectedTimezone(tz.value)} />
         </div>
         <table className="w-full border-collapse border border-gray-300">
            <thead>
               <tr className="bg-gray-100">
                  <th className="border p-2">Room Name</th>
                  <th className="border p-2">Day of Week</th>
                  <th className="border p-2">Start Time</th>
                  <th className="border p-2">End Time</th>
                  <th className="border p-2">Timezone</th>
               </tr>
            </thead>
            <tbody>
               {bookings.length > 0 ? (
                  bookings.map((booking) => (
                     <tr key={booking.id} className="border">
                        <td className="border p-2">{booking.roomName}</td>
                        <td className="border p-2">{booking.dayOfWeek}</td>
                        <td className="border p-2">{booking.startTime}</td>
                        <td className="border p-2">{booking.endTime}</td>
                        <td className="border p-2">{booking.timezone}</td>
                     </tr>
                  ))
               ) : (
                  <tr>
                     <td colSpan={4} className="text-center p-4">
                        No bookings found.
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
   );
};

export default BookingTable;
