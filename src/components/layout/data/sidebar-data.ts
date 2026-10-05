import {
  LayoutDashboard,
  Package,
  Users,
  Newspaper,
  ShoppingBag,
  Building2,
  Trophy,
  BookOpen,
  FileText,
  MapPin,
  Heart,
  Shield,
  Mail,
  Command,
} from "lucide-react";
import { type SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "Admin User",
    email: "admin@mongolec.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "Mongolec CMS",
      logo: Command,
      plan: "Admin Dashboard",
    },
  ],
  navGroups: [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Rally",
          icon: Trophy,
          items: [
            {
              title: "Rallies",
              url: "/rallies",
              icon: Trophy,
            },
            {
              title: "Stories",
              url: "/stories",
              icon: BookOpen,
            },
            {
              title: "Applications",
              url: "/applications",
              icon: FileText,
            },
            {
              title: "Nominations",
              url: "/nominations",
              icon: MapPin,
            },
            {
              title: "Rangers",
              url: "/rangers",
              icon: Shield,
            },
            {
              title: "Contact",
              url: "/contact",
              icon: Mail,
            },
          ],
        },
        {
          title: "Ranger Profiles",
          url: "/ranger-profiles",
          icon: Shield,
        },
        {
          title: "Participant Profiles",
          url: "/participant-profiles",
          icon: Users,
        },
        {
          title: "Team",
          url: "/team",
          icon: Heart,
        },
        {
          title: "News",
          url: "/news",
          icon: Newspaper,
        },
        {
          title: "Merchandise",
          url: "/merch",
          icon: ShoppingBag,
        },
        {
          title: "Tenants",
          url: "/tenants",
          icon: Building2,
        },
        {
          title: "Users",
          url: "/users",
          icon: Users,
        },
        {
          title: "Newsletter",
          url: "/newsletter",
          icon: Mail,
        },
      ],
    },
  ],
};
