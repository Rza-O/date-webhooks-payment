"use client";
import { useEffect } from 'react';

const DetectTimezone = () => {
   useEffect(() => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      localStorage.setItem("timeZone", timeZone);
   }, []);
};

export default DetectTimezone;