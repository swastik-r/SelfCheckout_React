import Welcome from "../pages/Welcome/Welcome";
import Login from "../pages/Login/Login";
import Cart from "../pages/Cart/Cart";
import Payment from "../pages/Payment/Payment";
import Feedback from "../pages/Feedback/Feedback";
import ErrorPage from "../pages/ErrorPage";

export const routeConfig = [
   {
      path: "",
      element: <Welcome />,
   },
   {
      path: "login",
      element: <Login />,
   },
   {
      path: "cart",
      element: <Cart />,
   },
   {
      path: "payment",
      element: <Payment />,
   },
   {
      path: "feedback",
      element: <Feedback />,
   },
   {
      path: "*",
      element: <ErrorPage />,
   },
];

export default routeConfig;
