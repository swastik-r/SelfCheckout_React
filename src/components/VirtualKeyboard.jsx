import React, { useState } from "react";

const VirtualKeyboard = ({ onKeyPress }) => {
   const [inputValue, setInputValue] = useState("");

   const handleKeyPress = (key) => {
      setInputValue((prevValue) => prevValue + key);
      onKeyPress(key);
   };

   const handleBackspace = () => {
      setInputValue((prevValue) => prevValue.slice(0, -1));
   };

   const handleClear = () => {
      setInputValue("");
   };

   const keyboardRows = [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Z", "X", "C", "V", "B", "N", "M"],
   ];

   return (
      <div>
         <input type="text" value={inputValue} readOnly />
         <div>
            {keyboardRows.map((row, rowIndex) => (
               <div key={rowIndex}>
                  {row.map((key) => (
                     <button key={key} onClick={() => handleKeyPress(key)}>
                        {key}
                     </button>
                  ))}
               </div>
            ))}
            <div>
               <button onClick={handleBackspace}>Backspace</button>
               <button onClick={handleClear}>Clear</button>
            </div>
         </div>
      </div>
   );
};

export default VirtualKeyboard;
