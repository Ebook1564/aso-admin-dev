"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { EyeIcon, PencilIcon, UserIcon, EnvelopeIcon, MailIcon, DownloadIcon, TrashBinIcon, AlertIcon } from "@/icons";
import Pagination from "../tables/Pagination";
import Badge from "../ui/badge/Badge";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";

// Shape of one row coming from /api/users (AWS RDS usertable)
interface User {
  id: number;
  username: string;
  useremail: string;
  phonenumber: number;
  countrycode: number;
  countryname: string;
  producturl: string;
  status?: string;
  admin_comment?: string;
}

const ITEMS_PER_PAGE = 10;

export default function RecentOrders() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all", "interested", "ongoing", "Hold", "Declined"
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [statusValue, setStatusValue] = useState("interested");
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/profile");
        const json = await res.json();

        if (json.success) {
          setUsers(json.data as User[]);
        } else {
          setError(json.error || "API returned error");
        }
      } catch {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setCommentText(user.admin_comment || "");
    setStatusValue(user.status || "interested");
    setIsCommentModalOpen(true);
  };

  const handleViewClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    handleRowClick(user);
  };

  const handleEditClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    handleRowClick(user);
  };

  const handleDeleteClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setUserToDelete(user);
    setDeleteError("");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/profile/${userToDelete.id}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (json.success) {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== userToDelete.id)
        );
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        setDeleteError("");
      } else {
        const errorMsg = json.error || "Failed to delete user";
        setDeleteError(errorMsg);
      }
    } catch (e) {
      console.error("Error deleting user:", e);
      setDeleteError("Failed to delete user. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSeeAllClick = () => {
    router.push("/basic-tables");
  };

  const filteredUsers = users.filter((user) => {
    if (statusFilter !== "all") {
      const userStatus = (user.status || "interested").toLowerCase();
      const filterStatus = statusFilter.toLowerCase();
      if (userStatus !== filterStatus) return false;
    }

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (user.username || "").toLowerCase().includes(query) ||
      (user.useremail || "").toLowerCase().includes(query) ||
      (user.countryname || "").toLowerCase().includes(query) ||
      (user.phonenumber || "").toString().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Username",
      "Email",
      "Phone Number",
      "Country Code",
      "Country Name",
      "Product URL",
      "Status",
      "Admin Comment",
    ];

    const rows = filteredUsers.map((user) => [
      user.id.toString(),
      user.username,
      user.useremail,
      user.phonenumber.toString(),
      user.countrycode.toString(),
      user.countryname,
      user.producturl,
      user.status || "interested",
      (user.admin_comment || "").replace(/"/g, '""'),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveComment = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/profile/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: statusValue,
          admin_comment: commentText,
        }),
      });

      const json = await response.json();

      if (json.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id
              ? { ...user, status: statusValue, admin_comment: commentText }
              : user
          )
        );
        setIsCommentModalOpen(false);
        setSelectedUser(null);
      } else {
        setError(json.error || "Failed to save comment");
      }
    } catch (e) {
      console.error("Error saving comment:", e);
      setError("Failed to save comment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    const statusLower = (status || "interested").toLowerCase();
    if (statusLower === "interested") return "info";
    if (statusLower === "ongoing") return "success";
    if (statusLower === "hold") return "warning";
    if (statusLower === "declined") return "error";
    return "info";
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading recent logins...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 mb-2">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-soft overflow-hidden">
      <div className="px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Recent Logins
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Detailed overview of recent user activity and management.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5 transition-all"
                title="Export to CSV"
              >
                <span className="w-4 h-4">
                  <DownloadIcon />
                </span>
                Export CSV
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition-all ${showSearch
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-400"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  }`}
              >
                Search
              </button>
              <button
                onClick={handleSeeAllClick}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5 transition-all"
              >
                See all
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-2">Status:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === "all"
                  ? "bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900"
                  : "bg-gray-50 text-gray-600 border border-transparent hover:border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:border-gray-700"
                  }`}
              >
                All ({users.length})
              </button>
              {["Interested", "Ongoing", "Hold", "Declined"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === status
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 border border-transparent hover:border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:border-gray-700"
                    }`}
                >
                  {status} ({users.filter(u => (u.status || "interested").toLowerCase() === status.toLowerCase()).length})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="px-5 pb-6 sm:px-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter users by name, email, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm shadow-inner placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:placeholder:text-gray-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto border-t border-gray-100 dark:border-gray-800">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/20">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest dark:text-gray-500">
                User Profile
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest dark:text-gray-500">
                Contact & URL
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest dark:text-gray-500">
                Location
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-bold text-gray-400 text-start text-[10px] uppercase tracking-widest dark:text-gray-500">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-bold text-gray-400 text-end text-[10px] uppercase tracking-widest dark:text-gray-500">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-gray-50 rounded-full dark:bg-gray-800">
                      <span className="w-6 h-6 text-gray-400">
                        <AlertIcon />
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {searchQuery ? "No matching records found." : "No entries matches your criteria."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all duration-200"
                  onClick={() => handleRowClick(user)}
                >
                  <TableCell className="px-5 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-105 shadow-brand-500/20">
                        {(user.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {user.username}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {user.useremail}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        +{user.countrycode} {user.phonenumber}
                      </span>
                      {user.producturl && (
                        <a
                          href={user.producturl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-brand-500 hover:text-brand-600 font-medium truncate max-w-[200px]"
                        >
                          {user.producturl.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-5">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {user.countryname}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-5 text-start">
                    <Badge
                      color={getStatusBadgeColor(user.status)}
                      variant="light"
                      size="sm"
                      className="capitalize px-3 py-1 font-bold"
                    >
                      {user.status || "interested"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-5 py-5">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleViewClick(e, user)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-all"
                        title="Quick View"
                      >
                         <span className="w-4.5 h-4.5">
                           <EyeIcon />
                         </span>
                      </button>
                      <button
                        onClick={(e) => handleEditClick(e, user)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-all"
                        title="Manage Record"
                      >
                         <span className="w-4.5 h-4.5">
                           <PencilIcon />
                         </span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, user)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all"
                        title="Remove Entry"
                      >
                         <span className="w-4.5 h-4.5">
                           <TrashBinIcon />
                         </span>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="px-5 py-5 sm:px-6 bg-gray-50/30 dark:bg-gray-800/10 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Showing <span className="text-gray-900 dark:text-white">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white">{Math.min(endIndex, filteredUsers.length)}</span> of <span className="text-gray-900 dark:text-white">{filteredUsers.length}</span> records
        </p>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Comment Modal */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setSelectedUser(null);
          setCommentText("");
        }}
        className="max-w-[700px] p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
      >
        {selectedUser && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-6 text-title-sm dark:text-white/90">
              User Details & Admin Management
            </h4>

            {/* User Information Section */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-5 h-5 text-gray-600 dark:text-gray-400">
                  <UserIcon />
                </span>
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  User Information
                </h5>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5">
                      <UserIcon />
                    </span>
                    Username
                  </Label>
                  <div className="mt-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedUser.username}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5">
                      <EnvelopeIcon />
                    </span>
                    Email
                  </Label>
                  <div className="mt-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <a
                      href={`mailto:${selectedUser.useremail}`}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 break-all flex items-center gap-1.5"
                    >
                      <span className="w-4 h-4">
                        <MailIcon />
                      </span>
                      {selectedUser.useremail}
                    </a>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Phone Number</Label>
                  <div className="mt-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <a
                      href={`tel:+${selectedUser.countrycode}${selectedUser.phonenumber}`}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      +{selectedUser.countrycode} {selectedUser.phonenumber}
                    </a>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Country</Label>
                  <div className="mt-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 text-sm text-gray-800 dark:text-white/90">
                    {selectedUser.countryname}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Product URL
                  </Label>
                  <div className="mt-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <a
                      href={selectedUser.producturl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 break-all underline flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {selectedUser.producturl}
                    </a>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">User ID</Label>
                  <div className="mt-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    #{selectedUser.id}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Management Section */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/30 p-5">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Admin Management
              </h5>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value)}
                    className="mt-2 w-full h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
                  >
                    <option value="interested" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">Interested</option>
                    <option value="ongoing" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">Ongoing</option>
                    <option value="Hold" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">Hold</option>
                    <option value="Declined" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">Declined</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Current status: <span className="font-medium">{statusValue}</span>
                  </p>
                </div>

                <div>
                  <Label htmlFor="comment">Admin Comment</Label>
                  <textarea
                    id="comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter your comment about this user..."
                    rows={5}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:placeholder:text-white/30 resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This comment is only visible to admins.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsCommentModalOpen(false);
                  setSelectedUser(null);
                  setCommentText("");
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveComment}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
          setDeleteError("");
        }}
        className="max-w-[500px] p-6 lg:p-8"
      >
        {userToDelete && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 text-title-sm dark:text-white/90">
              Delete User
            </h4>

            {deleteError && (
              <div className="mb-4 p-3 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-300">{deleteError}</p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <span className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0">
                  <AlertIcon />
                </span>
                <p className="text-sm text-red-800 dark:text-red-300">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 p-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Username:</span>
                    <p className="text-sm text-gray-800 dark:text-white/90 font-medium">{userToDelete.username}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Email:</span>
                    <p className="text-sm text-gray-800 dark:text-white/90">{userToDelete.useremail}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">User ID:</span>
                    <p className="text-sm text-gray-800 dark:text-white/90 font-mono">#{userToDelete.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Deleting..." : "Delete User"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
