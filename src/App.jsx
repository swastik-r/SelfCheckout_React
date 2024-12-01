import { useEffect } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import AuthProvider from "./contexts/AuthContext";
import StepProvider, { useStepContext } from "./contexts/StepContext";
import CartProvider from "./contexts/CartContext";
import routeConfig from "./config/routeConfig";
import IdlePrompt from "./components/IdlePrompt/IdlePrompt";
import {
   BrowserRouter as Router,
   Routes,
   Route,
   useLocation,
} from "react-router-dom";
import { ToastContainer, Zoom } from "react-toastify";

export default function App() {
   return (
      <Router>
         <StepProvider>
            <AuthProvider>
               <CartProvider>
                  <AppContent />
               </CartProvider>
            </AuthProvider>
         </StepProvider>
      </Router>
   );
}

function AppContent() {
   // useStepContext hook to access the context values
   const { idlePromptOpen, handleStillHere } = useStepContext();

   // To not show the idle prompt on the Welcome Screen
   const currentPath = useLocation().pathname;
   const shouldShowIdlePrompt = idlePromptOpen && currentPath !== "/";

   // Attach event listeners to close the idle prompt
   useEffect(() => {
      if (shouldShowIdlePrompt) {
         document.addEventListener("click", handleStillHere);
         document.addEventListener("touchstart", handleStillHere);
      }

      // Cleanup event listeners when the component unmounts
      return () => {
         document.removeEventListener("click", handleStillHere);
         document.removeEventListener("touchstart", handleStillHere);
      };
   }, [shouldShowIdlePrompt, handleStillHere]);

   return (
      <div className="app">
         <Header />
         <div className="page">
            {/* Routing to render a page */}
            <Routes>
               {routeConfig.map((route) => (
                  <Route
                     key={route.path}
                     path={route.path}
                     element={route.element}
                  />
               ))}
            </Routes>

            {/* Toast Container */}
            <ToastContainer
               position="top-center"
               autoClose={3000}
               hideProgressBar={false}
               newestOnTop={false}
               closeOnClick
               rtl={false}
               pauseOnFocusLoss={false}
               draggable={false}
               theme="dark"
               transition={Zoom}
            />

            {/* Idle Prompt */}
            {shouldShowIdlePrompt && <IdlePrompt />}
         </div>
      </div>
   );
}
