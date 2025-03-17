"use client";
import DetectTimezone from "@/components/sideEffects/DetectTimezone";
import { SignOutButton, useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect } from "react";
import { IoAdd } from "react-icons/io5";

export default function Home() {
   const { userId } = useAuth();
   useEffect(() => {
      if (userId) {
         const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
         try {
            axios.post("/api/updateTZ", { userId, timezone });
         } catch (error) {
            console.error("Error updating time zone:", error);
         }
      }
   }, [userId]);
   DetectTimezone();
   return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
         <h1 className="text-4xl font-bold">Welcome Room Booking</h1>
         <SignOutButton />
         <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
            <button className="btn"><IoAdd />Add Room</button>
         </main>
      </div>
   );
}
