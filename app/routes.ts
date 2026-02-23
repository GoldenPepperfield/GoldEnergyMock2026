import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { MyGreenScore } from "./pages/MyGreenScore";
import { SmartPlugConnect } from "./pages/SmartPlugConnect";
import { PowerPredict } from "./pages/PowerPredict";
import { GoldRewards } from "./pages/GoldRewards";
import { EnergyChatbot } from "./pages/EnergyChatbot";
import { GoldCare } from "./pages/GoldCare";
import { SolarMatch } from "./pages/SolarMatch";
import { Notifications } from "./pages/Notifications";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "mygreen-score", Component: MyGreenScore },
      { path: "smartplug", Component: SmartPlugConnect },
      { path: "powerpredict", Component: PowerPredict },
      { path: "rewards", Component: GoldRewards },
      { path: "chatbot", Component: EnergyChatbot },
      { path: "goldcare", Component: GoldCare },
      { path: "solar", Component: SolarMatch },
      { path: "notifications", Component: Notifications },
      { path: "profile", Component: Profile },
    ],
  },
]);
