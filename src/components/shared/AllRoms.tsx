"use client";
import { useUser } from '@/hooks/useUser';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { Button } from '../ui/button';

const fetchRooms = async () => {
   const { data } = await axios.get("/api/rooms");
   return data.rooms;
};

const AllRoms = () => {
   const queryClient = useQueryClient();
   const { user, isLoading: userLoading } = useUser();

   const { data: rooms, isLoading: roomsLoading, error } = useQuery({
      queryKey: ["rooms"],
      queryFn: fetchRooms,
      
   });

   console.log(rooms);
   console.log(user);

   // Delete Mutation
   const { mutate: deleteRoomMutation, isPending: roomDeletePending } = useMutation({
      mutationFn: async (id: number) => {
         await axios.patch(`/api/rooms/${id}`);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["rooms"] })
      },
   })

   if (userLoading || roomsLoading) return <p>Loading...</p>;
   if (error) return <p>Failed to load rooms.</p>;
   if (!rooms || rooms.length === 0) return <p>No rooms found.</p>;

   return (
      <div className="grid grid-cols-3 gap-4">
         {rooms.map((room: any) => (
            <div key={room.id} className="border p-4 rounded-md shadow-md">
               <h3 className="text-xl font-bold">{room.name}</h3>
               <p>Location: {room.location}</p>
               <p>Capacity: {room.capacity}</p>

               {user?.role === 'ADMIN' && (
                  <Button
                     className="bg-red-500 text-white mt-2"
                     onClick={() => deleteRoomMutation(room.id)}
                     disabled={roomDeletePending}
                  >
                     Delete Room
                  </Button>
               )}

               {user?.role === 'USER' && (
                  <Button className="bg-blue-500 text-white mt-2">
                     Book Room
                  </Button>
               )}
            </div>
         ))}
      </div>
   );
};

export default AllRoms;