"use client";
import { SignOutButton, useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import { IoAdd } from "react-icons/io5";
import DetectTimezone from "../../components/sideEffects/DetectTimezone";
import { useUser } from "../../hooks/useUser";
import RoomForm from "../../components/admin/AddForm";
import AllRooms from "../../components/shared/AllRoms";

export default function Home() {
   const ianaTZ = DetectTimezone();
   console.log(typeof ianaTZ)
   const [isFormShown, setIsFormShown] = useState(false);
   const { user } = useUser();
   const { userId } = useAuth();
   useEffect(() => {
      if (userId) {
         // const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
         try {
            axios.post("/api/updateTZ", { userId, ianaTZ });
         } catch (error) {
            console.error("Error updating time zone:", error);
         }
      }
   }, [userId, ianaTZ]);
   return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
         <h1 className="text-4xl font-bold">Welcome Room Booking</h1>
         <SignOutButton />
         <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
            {user?.role === "ADMIN" && <button onClick={() => setIsFormShown(!isFormShown)} className="btn"><IoAdd />Add Room</button>}
            {isFormShown && <RoomForm />}
            <div>
               <h1>Here are all the room added</h1>
               <AllRooms />
            </div>
         </main>
      </div>
   );
}
