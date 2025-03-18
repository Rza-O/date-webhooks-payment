/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { format, isSameDay, isWeekend, } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Button } from '../ui/button';

interface BookingModalProps {
   room: any;
   onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ room, onClose }) => {
   const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
   const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

   const handleSlotSelection = (slotId: number) => setSelectedSlot(slotId);

   const isDateAvailable = (date: Date) => {
      return !isWeekend(date); // Allow all weekdays
   };

   const selectedAvailability = selectedDate
      ? room.availabilities.filter((availability: any) =>
         isSameDay(new Date(availability.date), selectedDate)
      )
      : [];

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
         <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">{room.name} - Booking</h2>

            <DayPicker
               mode="single"
               selected={selectedDate}
               onSelect={setSelectedDate}
               disabled={(date) => !isDateAvailable(date)}
            />

            {selectedDate && selectedAvailability.length > 0 && (
               <div className="mt-4">
                  <p className="font-semibold">Available Slots:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                     {selectedAvailability.flatMap((availability: any) =>
                        availability.slots.map((slot: any) => (
                           <Button
                              key={slot.id}
                              className={`px-4 py-2 ${selectedSlot === slot.id ? 'bg-green-500' : 'bg-gray-300'}`}
                              onClick={() => handleSlotSelection(slot.id)}
                           >
                              {format(new Date(slot.startTime), 'HH:mm')}
                           </Button>
                        ))
                     )}
                  </div>
               </div>
            )}

            <div className="flex justify-between mt-4">
               <Button className="bg-red-500 text-white" onClick={onClose}>Close</Button>

               {selectedSlot && (
                  <>
                     <Button
                        className="bg-yellow-500 text-white"
                        onClick={() => setSelectedSlot(null)}
                     >
                        Clear Slot
                     </Button>

                     <Button className="bg-blue-500 text-white">
                        Confirm Booking
                     </Button>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

export default BookingModal;