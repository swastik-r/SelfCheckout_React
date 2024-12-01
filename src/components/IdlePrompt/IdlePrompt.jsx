import "./IdlePrompt.css";
import React, { useRef } from "react";
import { useStepContext } from "../../contexts/StepContext";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

export default function IdlePrompt() {
   return (
      <div className="promptContainer slow">
         <div className="promptContent">
            <h1>Hey, are you still here?</h1>
            <div className="promptTimer">
               <CircleTimer />
            </div>
            <h2>Please tap anywhere to continue</h2>
         </div>
      </div>
   );
}

function CircleTimer() {
   const renderTime = ({ remainingTime }) => {
      const currentTime = useRef(remainingTime);
      const prevTime = useRef(null);
      const isNewTimeFirstTick = useRef(false);

      if (currentTime.current !== remainingTime) {
         isNewTimeFirstTick.current = true;
         prevTime.current = currentTime.current;
         currentTime.current = remainingTime;
      } else {
         isNewTimeFirstTick.current = false;
      }

      const isTimeUp = isNewTimeFirstTick.current;

      return (
         <div className="time-wrapper">
            <div key={remainingTime} className={`time ${isTimeUp ? "up" : ""}`}>
               {remainingTime}
            </div>
            {prevTime.current !== null && (
               <div
                  key={prevTime.current}
                  className={`time ${!isTimeUp ? "down" : ""}`}
               >
                  {prevTime.current}
               </div>
            )}
         </div>
      );
   };

   const { promptBeforeIdle } = useStepContext();
   const duration = promptBeforeIdle / 1000;
   const gap = duration / 3;
   const colorsTime = [duration, duration - gap, duration - 2 * gap, 0];
   const colors = ["#00CE00", "#FFE400", "#FFB900", "#FF0000"];

   return (
      <CountdownCircleTimer
         isPlaying
         duration={duration}
         colors={colors}
         colorsTime={colorsTime}
      >
         {renderTime}
      </CountdownCircleTimer>
   );
}
