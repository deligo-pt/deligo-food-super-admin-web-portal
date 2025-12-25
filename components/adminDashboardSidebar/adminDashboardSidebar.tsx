"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BadgeEuro,
  Bike,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid,
  LayoutDashboard,
  LayoutList,
  Menu,
  MessageCircleMore,
  NotepadText,
  Package,
  Settings,
  ShieldUser,
  ShoppingBag,
  SquareChartGantt,
  Ticket,
  ToolCase,
  Users,
  Utensils,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Image from "next/image";

interface IProps {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const PRIMARY = "#DC3173";

const MENU = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/admin/dashboard",
  },
  {
    id: "vendors",
    title: "Vendors",
    icon: <Utensils size={18} />,
    items: [
      { name: "All vendors", path: "/admin/all-vendors" },
      { name: "Pending Approvals", path: "/admin/pending-approvals" },
      { name: "Active Vendors", path: "/admin/active-vendors" },
      { name: "Suspended Vendors", path: "/admin/suspended-vendors" },
      { name: "Add New Vendor", path: "/admin/add-vendor" },
      { name: "Vendor Payouts", path: "/admin/vendor-payouts" },
    ],
  },
  {
    id: "fleets",
    title: "Fleet Managers",
    icon: <Users size={18} />,
    items: [
      { name: "All Fleet Managers", path: "/admin/all-fleet-managers" },
      { name: "Add New Fleet Manager", path: "/admin/add-fleet-manager" },
      { name: "Fleet Manager Wallet", path: "/admin/fleet-manager-wallet" },
      { name: "Payout Requests", path: "/admin/fleet-manager-withdrawals" },
      { name: "Zones & Coverage Areas", path: "/admin/fleet-zones" },
      { name: "Fleet Performance Analytics", path: "/admin/fleet-performance" },
      { name: "Activity Logs", path: "/admin/fleet-activity-logs" },
      { name: "In-App Notifications", path: "/admin/send-notification-fleet" },
      {
        name: "Suspended / Blocked Fleet Managers",
        path: "/admin/blocked-fleet-managers",
      },
    ],
  },
  {
    id: "customers",
    title: "Customers",
    icon: <Users size={18} />,
    items: [
      { name: "All Customers", path: "/admin/all-customers" },
      { name: "Active Customers", path: "/admin/active-customers" },
      { name: "Blocked Customers", path: "/admin/blocked-customers" },
      { name: "Customer Feedback", path: "/admin/customer-feedback" },
      { name: "Customer Orders", path: "/admin/customer-orders" },
    ],
  },
  {
    id: "driverss",
    title: "Delivery Partners",
    icon: <Bike size={18} />,
    items: [
      { name: "All Delivery Partners", path: "/admin/all-delivery-partners" },
      {
        name: "Delivery Partner Onboarding Requests",
        path: "/admin/delivery-partner-onboarding-requests",
      },
      {
        name: "Active Delivery Partners",
        path: "/admin/active-delivery-partners",
      },
      {
        name: "Suspended Delivery Partners",
        path: "/admin/suspended-delivery-partners",
      },
      {
        name: "Delivery Partner Performance",
        path: "/admin/delivery-partner-performance",
      },
      {
        name: "Delivery Partner Payouts",
        path: "/admin/delivery-partner-payouts",
      },
      {
        name: "Delivery Partner Analytics",
        path: "/admin/delivery-partner-analytics",
      },
    ],
  },
  {
    id: "business-categories",
    title: "Business Categories",
    icon: <Grid size={18} />,
    items: [
      {
        name: "Add Business Categories",
        path: "/admin/business-categories/add",
      },
      { name: "All Business Categories", path: "/admin/business-categories" },
    ],
  },
  {
    id: "product-categories",
    title: "Product Categories",
    icon: <SquareChartGantt size={18} />,
    items: [
      {
        name: "Add Product Categories",
        path: "/admin/product-categories/add",
      },
      { name: "All Product Categories", path: "/admin/product-categories" },
    ],
  },
  {
    id: "products",
    title: "All Products",
    icon: <LayoutList size={18} />,
    items: [{ name: "All Products", path: "/admin/all-products" }],
  },
  {
    id: "orders",
    title: "Orders Management",
    icon: <ShoppingBag size={18} />,
    items: [
      { name: "All Orders", path: "/admin/all-orders" },
      { name: "Pending Orders", path: "/admin/pending-orders" },
      { name: "Preparing Orders", path: "/admin/preparing-orders" },
      { name: "On the Way Orders", path: "/admin/on-the-way-orders" },
      { name: "Delivered Orders", path: "/admin/delivered-orders" },
      { name: "Cancelled Orders", path: "/admin/cancelled-orders" },
      { name: "Refund Requests", path: "/admin/refund-requests" },
    ],
  },
  {
    id: "payments-earnings",
    title: "Payments & Earnings",
    icon: <BadgeEuro size={18} />,
    items: [
      { name: "Platform Earnings", path: "/admin/platform-earnings" },
      { name: "Vendor Payouts", path: "/admin/vendor-payouts" },
      { name: "Driver Payouts", path: "/admin/driver-payouts" },
      { name: "Transaction History", path: "/admin/transaction-history" },
      { name: "Payment Disputes", path: "/admin/payment-disputes" },
      { name: "Tax Management", path: "/admin/tax-management" },
    ],
  },
  {
    id: "inventory-control",
    title: "Inventory & Menu Control",
    icon: <Package size={18} />,
    items: [
      { name: "All Items", path: "/admin/all-products" },
      { name: "Out-of-Stock Alerts", path: "/admin/out-of-stock-alerts" },
      { name: "Restricted Items", path: "/admin/restricted-items" },
    ],
  },
  {
    id: "promotions-and-coupons",
    title: "Promotions & Coupons",
    icon: <Ticket size={18} />,
    items: [
      { name: "Active Campaigns", path: "/admin/active-campaigns" },
      { name: "Create New Offer", path: "/admin/create-new-offer" },
      { name: "Coupon Analytics", path: "/admin/coupon-analytics" },
    ],
  },
  {
    id: "analytics-and-insights",
    title: "Analytics & Insights",
    icon: <ChartNoAxesCombined size={18} />,
    items: [
      { name: "Sales Analytics", path: "/admin/sales-analytics" },
      { name: "Delivery Insights", path: "/admin/delivery-insights" },
      { name: "Customer Insights", path: "/admin/customer-insights" },
      { name: "Top Vendors", path: "/admin/top-vendors" },
      { name: "Peak Hours Analysis", path: "/admin/peak-hours-analysis" },
    ],
  },
  {
    id: "system-management",
    title: "System Management",
    icon: <ToolCase size={18} />,
    items: [
      {
        name: "Email & Notification Settings",
        path: "/admin/email-notification-settings",
      },
      { name: "Maintenance Mode", path: "/admin/maintenance-mode" },
    ],
  },
  {
    id: "admin-management",
    title: "Admin Management",
    icon: <ShieldUser size={18} />,
    items: [
      { name: "All Admins", path: "/admin/all-admins" },
      { name: "Roles & Permissions", path: "/admin/roles-permissions" },
      { name: "Activity Logs", path: "/admin/activity-logs" },
      { name: "Login History", path: "/admin/login-history" },
    ],
  },
  {
    id: "support-communication",
    title: "Support & Communication",
    icon: <MessageCircleMore size={18} />,
    items: [
      { name: "Support Tickets", path: "/admin/support-tickets" },
      { name: "Chat With Vendors", path: "/admin/chat-with-vendors" },
      { name: "Chat With Drivers", path: "/admin/chat-with-drivers" },
      { name: "Chat With Customers", path: "/admin/chat-with-customers" },
    ],
  },
  {
    id: "reports",
    title: "Reports",
    icon: <NotepadText size={18} />,
    items: [
      { name: "Sales Report", path: "/admin/sales-report" },
      { name: "Order Report", path: "/admin/order-report" },
      {
        name: "Driver Performance Report",
        path: "/admin/drivers-performance-report",
      },
      { name: "Vendor Report", path: "/admin/vendor-report" },
    ],
  },

  {
    id: "settings",
    title: "Settings",
    icon: <Settings size={18} />,
    items: [
      { name: "Business Info", path: "/admin/business-info" },
      { name: "Branding & Theme", path: "/admin/branding-theme" },
      {
        name: "Localization (Language & Currency)",
        path: "/admin/localization",
      },
      {
        name: "Notification Preferences",
        path: "/admin/notification-preferences",
      },
      {
        name: "Legal Documents (Terms, Privacy)",
        path: "/admin/legal-documents",
      },
    ],
  },
  {
    id: "sos",
    title: "SOS / Emergency",
    icon: <AlertCircle size={18} />,
    items: [
      { name: "Critical Alerts", path: "/admin/critical-alerts" },
      { name: "Contact Support Team", path: "/admin/contact-support-team" },
      { name: "System Health Status", path: "/admin/system-health-status" },
    ],
  },
];

export default function Sidebar({ open, setOpen }: IProps) {
  const pathname = usePathname();
  const currentMenuId = MENU.find((menu) =>
    menu.items?.some((item) => pathname.includes(item.path))
  )?.id;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    ...(currentMenuId ? { [currentMenuId]: true } : {}),
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#DC3173] overflow-hidden shadow-md">
            <Image
              src="/deligoLogo.png"
              alt="DeliGo Logo"
              width={36}
              height={36}
              className="object-cover"
              unoptimized
            />
          </div>
          <h1 className="font-bold text-xl text-[#DC3173]">DeliGo</h1>
        </div>
        <button onClick={() => setMobileOpen(true)}>
          <Menu size={24} className="text-gray-700" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: open ? 280 : 80 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="hidden md:flex h-screen bg-linear-to-b from-pink-50 via-white to-pink-100 shadow-xl flex-col border-r border-pink-200 overflow-hidden fixed left-0 top-0 z-40"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-pink-200">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: open ? 0 : 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white font-bold shadow-lg overflow-hidden"
              style={{ background: PRIMARY }}
            >
              <Image
                src="/deligoLogo.png"
                alt="DeliGo Logo"
                width={40}
                height={40}
                className="object-cover"
                unoptimized
              />
            </motion.div>
            {open && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl text-[#DC3173] transition-opacity duration-300"
              >
                DeliGo Admin
              </motion.h1>
            )}
          </div>

          <button
            onClick={() => setOpen && setOpen(!open)}
            className="p-2 rounded-lg hover:bg-pink-100 transition-colors"
          >
            {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto no-scrollbar">
          {MENU.map((menu) => (
            <div key={menu.id} className="mb-1">
              {menu.path ? (
                <Link
                  href={menu.path}
                  className={`flex items-center w-full justify-between p-2 rounded-lg transition-colors ${
                    pathname === menu.path
                      ? "bg-linear-to-r from-pink-200 to-pink-100 text-pink-700 font-semibold"
                      : "hover:bg-pink-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-pink-600">{menu.icon}</div>
                    {open && (
                      <span className="font-medium text-gray-700">
                        {menu.title}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(menu.id)}
                    className="flex items-center w-full justify-between p-2 rounded-lg hover:bg-pink-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-pink-600">{menu.icon}</div>
                      {open && (
                        <span className="font-medium text-gray-700 text-left">
                          {menu.title}
                        </span>
                      )}
                    </div>
                    {menu.items && open && (
                      <motion.div
                        animate={{ rotate: expanded[menu.id] ? 180 : 0 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    )}
                  </button>

                  <AnimatePresence>
                    {expanded[menu.id] && open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-9 mt-1 flex flex-col gap-1"
                      >
                        {menu.items?.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            className={`text-sm px-2 py-1 rounded-md transition-all duration-300 ${
                              pathname === sub.path
                                ? "bg-linear-to-r from-pink-200 to-pink-100 text-pink-700 font-semibold"
                                : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          ))}
        </nav>

        {open && (
          <div className="border-t border-pink-200 py-3 px-3 text-center text-xs text-gray-500">
            © 2025 <span style={{ color: PRIMARY }}>Admin</span> Dashboard
          </div>
        )}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden flex"
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white w-72 h-full p-4 shadow-xl overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: PRIMARY }}>
                  DeliGo Menu
                </h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-gray-600"
                >
                  <X size={22} />
                </button>
              </div>

              {MENU.map((menu) => (
                <div key={menu.id} className="mb-2">
                  {menu.path ? (
                    <Link
                      href={menu.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 py-2 ${
                        pathname === menu.path
                          ? "text-pink-700 font-semibold"
                          : "text-gray-800 hover:text-pink-600"
                      }`}
                    >
                      <div className="text-pink-600">{menu.icon}</div>
                      <span>{menu.title}</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleExpand(menu.id)}
                        className="flex items-center justify-between w-full py-2 text-gray-800 font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-pink-600">{menu.icon}</div>
                          <span>{menu.title}</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            expanded[menu.id] ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expanded[menu.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-8 mt-1 flex flex-col gap-1"
                          >
                            {menu.items?.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.path}
                                onClick={() => setMobileOpen(false)}
                                className={`text-sm py-1 transition-all ${
                                  pathname === sub.path
                                    ? "text-pink-700 font-semibold"
                                    : "text-gray-600 hover:text-pink-600"
                                }`}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
