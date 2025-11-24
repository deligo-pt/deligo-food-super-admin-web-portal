"use client"
import React, { useState } from "react";
import { ShieldCheck, LockKeyhole, UserCog, PlusCircle, Check, X, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface PermissionGroup {
  id: string;
  title: string;
  permissions: { id: string; label: string }[];
}

interface Role {
  id: string;
  name: string;
  color: string;
  permissions: string[]; // permission IDs
}

// Mock data
type PG = PermissionGroup;
const permissionGroups: PG[] = [
  {
    id: "pg-users",
    title: "User Management",
    permissions: [
      { id: "p-user-view", label: "View Users" },
      { id: "p-user-edit", label: "Edit Users" },
      { id: "p-user-delete", label: "Delete Users" },
      { id: "p-user-suspend", label: "Suspend Users" },
    ],
  },
  {
    id: "pg-orders",
    title: "Order Management",
    permissions: [
      { id: "p-order-view", label: "View Orders" },
      { id: "p-order-update", label: "Update Orders" },
      { id: "p-order-refund", label: "Process Refunds" },
    ],
  },
  {
    id: "pg-admin",
    title: "Admin Management",
    permissions: [
      { id: "p-admin-view", label: "View Admins" },
      { id: "p-admin-edit", label: "Edit Admins" },
      { id: "p-admin-create", label: "Create Admins" },
      { id: "p-admin-remove", label: "Remove Admins" },
    ],
  },
];

const initialRoles: Role[] = [
  {
    id: "r-super",
    name: "Super Admin",
    color: "#DC3173",
    permissions: permissionGroups.flatMap((pg) => pg.permissions.map((p) => p.id)),
  },
  {
    id: "r-admin",
    name: "Admin",
    color: "#3b82f6",
    permissions: ["p-user-view", "p-user-edit", "p-order-view", "p-order-update", "p-admin-view"],
  },
  {
    id: "r-moderator",
    name: "Moderator",
    color: "#22c55e",
    permissions: ["p-user-view", "p-order-view"],
  },
];

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showModal, setShowModal] = useState(false);

  const togglePermission = (roleId: string, permId: string) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? {
              ...r,
              permissions: r.permissions.includes(permId)
                ? r.permissions.filter((p) => p !== permId)
                : [...r.permissions, permId],
            }
          : r
      )
    );
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const saveRole = (updated: Role) => {
    setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setShowModal(false);
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">Control access levels and permissions across the Deligo platform.</p>
        </div>

        {/* ROLES LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: role.color }} /> {role.name}
                </h2>
                <button
                  onClick={() => openEdit(role)}
                  className="p-2 rounded-full hover:bg-gray-50 border border-gray-200"
                >
                  <PenLine size={16} />
                </button>
              </div>

              <div className="text-sm text-gray-500 mb-2">Permissions:</div>

              <div className="flex flex-wrap gap-2">
                {role.permissions.map((pid) => (
                  <span
                    key={pid}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border"
                  >
                    {pid.replace("p-", "")}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* PERMISSION MATRIX */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="text-[#DC3173]" /> Permissions Matrix
          </h3>

          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 text-left">Permission</th>
                  {roles.map((r) => (
                    <th key={r.id} className="p-4 text-center">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionGroups.map((pg) => (
                  <React.Fragment key={pg.id}>
                    <tr className="bg-gray-100">
                      <td colSpan={roles.length + 1} className="p-3 font-medium text-gray-700">
                        {pg.title}
                      </td>
                    </tr>

                    {pg.permissions.map((perm) => (
                      <tr key={perm.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-700">{perm.label}</td>
                        {roles.map((role) => (
                          <td key={role.id} className="text-center p-4">
                            <button
                              onClick={() => togglePermission(role.id, perm.id)}
                              className={`mx-auto w-8 h-8 flex items-center justify-center rounded-md border transition ${
                                role.permissions.includes(perm.id)
                                  ? "bg-[#DC3173] border-[#DC3173] text-white"
                                  : "bg-white border-gray-300 text-gray-400 hover:bg-gray-100"
                              }`}
                            >
                              {role.permissions.includes(perm.id) ? <Check size={16} /> : <X size={16} />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EDIT ROLE MODAL */}
        <AnimatePresence>
          {showModal && editingRole && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />

              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10"
              >
                <h2 className="text-xl font-semibold mb-3">Edit Role - {editingRole.name}</h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                    const color = (form.elements.namedItem("color") as HTMLInputElement).value;
                    saveRole({ ...editingRole, name, color });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium">Role Name</label>
                    <input
                      name="name"
                      defaultValue={editingRole.name}
                      className="w-full px-3 py-2 border rounded-lg mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Role Color</label>
                    <input
                      name="color"
                      type="color"
                      defaultValue={editingRole.color}
                      className="w-16 h-10 p-1 border rounded-lg mt-1"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#DC3173] text-white rounded-lg shadow hover:brightness-95"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
