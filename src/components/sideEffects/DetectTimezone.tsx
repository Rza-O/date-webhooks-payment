"use client";
import { useEffect, useState } from 'react';

const DetectTimezone = () => {
   const [timeZone, setTimeZone] = useState(null);
   useEffect(() => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      localStorage.setItem("timeZone", timeZone);
      setTimeZone(timeZone)
   }, []);

   return timeZone;
};

export default DetectTimezone;