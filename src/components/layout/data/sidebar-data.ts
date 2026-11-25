import {
  LayoutDashboard,
  Package,
  Users,
  Newspaper,
  ShoppingBag,
  ShoppingCart,
  Building2,
  Trophy,
  BookOpen,
  FileText,
  MapPin,
  Heart,
  Shield,
  Mail,
  Command,
  Percent,
  Bike,
  Handshake,
  Inbox,
} from "lucide-react";
import { RALLY_TENANT_SLUG } from "@/lib/tenants";
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
      title: "Overview",
      audience: "everyone",
      items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
    },
    {
      title: "Rally for Rangers",
      tenantSlug: RALLY_TENANT_SLUG,
      items: [
        { title: "Rallies", url: "/rallies", icon: Trophy },
        { title: "Applications", url: "/applications", icon: FileText },
        { title: "Riders", url: "/participant-profiles", icon: Bike },
        { title: "Ranger Profiles", url: "/ranger-profiles", icon: Shield },
        { title: "Team", url: "/team", icon: Heart },
        { title: "Stories", url: "/stories", icon: BookOpen },
        { title: "Nominations", url: "/nominations", icon: MapPin },
        { title: "Contact Messages", url: "/contact", icon: Inbox },
        { title: "Newsletter", url: "/newsletter", icon: Mail },
        { title: "Park Partners", url: "/rangers", icon: Handshake },
      ],
    },
    {
      title: "Merchandise",
      items: [
        { title: "Products", url: "/merch", icon: ShoppingBag },
        { title: "Orders", url: "/merch/orders", icon: ShoppingCart },
        { title: "Categories", url: "/merch/categories", icon: Package },
        { title: "Discounts", url: "/merch/discounts", icon: Percent },
      ],
    },
    {
      title: "Content",
      items: [{ title: "News", url: "/news", icon: Newspaper }],
    },
    {
      title: "Administration",
      audience: "super_admin",
      items: [
        { title: "Users", url: "/users", icon: Users },
        { title: "Tenants", url: "/tenants", icon: Building2 },
      ],
    },
  ],
};
