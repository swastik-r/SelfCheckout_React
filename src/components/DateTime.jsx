import { useState, useEffect } from "react";

export default function DateTime() {
   // Data Variables
   const date = new Date();
   const year = date.getFullYear();
   const month = date.getMonth();
   const dateNum = date.getDate();
   const day = date.getDay();
   const dayName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][day];
   const monthName = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
   ][month];
   const currentTime = useRealTimeClock();

   // Real-Time Clock
   function useRealTimeClock() {
      const [currentDate, setCurrentDate] = useState(new Date());
      useEffect(() => {
         const intervalId = setInterval(() => {
            setCurrentDate(new Date());
         }, 1000);
         return () => clearInterval(intervalId);
      }, []);
      return currentDate;
   }

   // 24-to-12 Conversion
   function convertTo12HourFormat() {
      let date = new Date();
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = hours < 10 ? "0" + hours : hours;
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      const secondsStr = seconds < 10 ? "0" + seconds : seconds;
      const strTime = hoursStr + ":" + minutesStr + ":" + secondsStr;
      return [strTime, ampm];
   }

   return (
      <div className="dateTime" style={{ color: "black" }}>
         <div
            className="dateAndDay"
            style={{
               display: "flex",
               justifyContent: "space-between",
               margin: "5px",
               marginBottom: "5px",
            }}
         >
            {/* Date */}
            <div>
               {dateNum} {monthName}, {year}
            </div>

            {/* Day */}
            <div
               className="day"
               style={{
                  border: "1px solid black",
                  background: "black",
                  color: "white",
                  padding: "2px",
                  margin: "0 8px",
                  fontSize: "15px",
               }}
            >
               {dayName}
            </div>
         </div>
         {/* Horizontal Line (168px) */}
         <div style={{ borderBottom: "1px solid black", width: "100%" }}></div>
         {/* Time */}
         <div
            className="time"
            style={{
               display: "flex",
               justifyContent: "space-evenly",
               margin: "5px",
            }}
         >
            <div
               style={{
                  display: "flex",
                  marginRight: "10px",
               }}
            >
               <div
                  style={{
                     margin: "0 10px",
                     width: "75px",
                     textAlign: "right",
                  }}
               >
                  {convertTo12HourFormat(currentTime)[0]}
               </div>
               {convertTo12HourFormat(currentTime)[1]}
            </div>
         </div>
      </div>
   );
}
