import React from "react";

import CAF from "../pages/features/CAF";
import Services from "../pages/features/Services";
import Consulting from "../pages/features/Consulting";
import Strategy from "../pages/features/Strategy";
import Operations from "../pages/features/Operations";
import Development from "../pages/features/Development";
import Support from "../pages/features/Support";
import Features from "../pages/features/Features";
import Contact from "../pages/features/Contact";
import About from "../pages/features/About";

const Features = [
  { path: "/caf", component: CAF },
  { path: "/home", component: Home },
  { path: "/services", component: Services },
  { path: "/consulting", component: Consulting },
  { path: "/strategy", component: Strategy },
  { path: "/operations", component: Operations },
  { path: "/development", component: Development },
  { path: "/support", component: Support },
  { path: "/features", component: Features },
  { path: "/contact", component: Contact },
  { path: "/about", component: About },
  { path: "/caf", component: CAF }
];

export default Features;
