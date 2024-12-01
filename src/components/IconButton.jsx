function IconButton({ icon, label }) {
   const IconComponent = icon; // Use the icon component passed as prop

   if (!IconComponent) {
      console.error("No icon provided");
      return null;
   }

   return (
      <button>
         <div
            style={{
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
            }}
         >
            <IconComponent size={20} />
            <span style={{ marginLeft: "10px" }}>{label}</span>
         </div>
      </button>
   );
}
