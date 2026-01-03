"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RoleBadge } from "./role-badge";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Key,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  balance: number | null;
  role: string;
  verified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  status: string;
  phone: string | null;
  address: string | null;
  profileImage: string | null;
  followers: number | null;
  winRate: number | null;
  wins: number | null;
  losses: number | null;
  traderTrades: number | null;
  minStartup: number | null;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  profileImage: string;
  role: string;
  status: string;
  password: string;
  balance: number;
  followers: number;
  winRate: number;
  wins: number;
  losses: number;
  traderTrades: number;
  minStartup: number;
}

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
    role: "USER",
    status: "active",
    password: "",
    balance: 0,
    followers: 0,
    winRate: 0,
    wins: 0,
    losses: 0,
    traderTrades: 0,
    minStartup: 0,
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addFormData, setAddFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
    role: "USER",
    status: "active",
    password: "",
    balance: 0,
    followers: 0,
    winRate: 0,
    wins: 0,
    losses: 0,
    traderTrades: 0,
    minStartup: 0,
  });
  const { toast } = useToast();

  const usersPerPage = 10;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      profileImage: user.profileImage || "",
      role: user.role,
      status: user.status,
      password: "",
      balance: user.balance || 0,
      followers: user.followers || 0,
      winRate: user.winRate || 0,
      wins: user.wins || 0,
      losses: user.losses || 0,
      traderTrades: user.traderTrades || 0,
      minStartup: user.minStartup || 0,
    });
    setShowEditDialog(true);
  };

  const handleAddUser = async () => {
    try {
      const createData: any = {
        firstName: addFormData.firstName,
        lastName: addFormData.lastName,
        username: addFormData.username,
        email: addFormData.email,
        phone: addFormData.phone,
        address: addFormData.address,
        profileImage: addFormData.profileImage,
        role: addFormData.role,
        status: addFormData.status,
        password: addFormData.password,
        balance: addFormData.balance,
      };

      // Add trader fields if role is TRADER
      if (addFormData.role === "TRADER") {
        createData.followers = addFormData.followers;
        createData.winRate = addFormData.winRate;
        createData.wins = addFormData.wins;
        createData.losses = addFormData.losses;
        createData.traderTrades = addFormData.traderTrades;
        createData.minStartup = addFormData.minStartup;
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "User created successfully.",
        });
        fetchUsers();
        setShowAddDialog(false);
        setAddFormData({
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          phone: "",
          address: "",
          profileImage: "",
          role: "USER",
          status: "active",
          password: "",
          balance: 0,
          followers: 0,
          winRate: 0,
          wins: 0,
          losses: 0,
          traderTrades: 0,
          minStartup: 0,
        });
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create user.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const updateData: any = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        username: editFormData.username,
        email: editFormData.email,
        phone: editFormData.phone,
        address: editFormData.address,
        profileImage: editFormData.profileImage,
        role: editFormData.role,
        status: editFormData.status,
        balance: editFormData.balance,
      };

      // Add trader fields if role is TRADER
      if (editFormData.role === "TRADER") {
        updateData.followers = editFormData.followers;
        updateData.winRate = editFormData.winRate;
        updateData.wins = editFormData.wins;
        updateData.losses = editFormData.losses;
        updateData.traderTrades = editFormData.traderTrades;
        updateData.minStartup = editFormData.minStartup;
      }

      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "User updated successfully.",
        });
        fetchUsers();
        setShowEditDialog(false);
        setEditingUser(null);
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update user.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully.",
        });
        fetchUsers();
        setShowDeleteDialog(false);
        setUserToDelete(null);
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.message || "Failed to delete user.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    try {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          userIds: selectedUsers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Success",
          description: data.message,
        });
        fetchUsers();
        setShowBulkDialog(false);
        setSelectedUsers([]);
        setBulkAction("");
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.message || "Bulk action failed.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Bulk action failed.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <UserCheck className="w-4 h-4 mr-2" />
            Add User
          </Button>
          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBulkAction("activate");
                  setShowBulkDialog(true);
                }}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Activate ({selectedUsers.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkAction("deactivate");
                  setShowBulkDialog(true);
                }}
              >
                <UserX className="w-4 h-4 mr-2" />
                Deactivate ({selectedUsers.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkAction("reset_passwords");
                  setShowBulkDialog(true);
                }}
              >
                <Key className="w-4 h-4 mr-2" />
                Reset Passwords ({selectedUsers.length})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="TRADER">Trader</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">
              {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profileImage || ""} />
                        <AvatarFallback>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${user.balance?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>{formatDate(user.lastLogin)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password field empty to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editFormData.username}
                onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="TRADER">Trader</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={editFormData.address}
                onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-balance">Balance</Label>
                <Input
                  id="edit-balance"
                  type="number"
                  step="0.01"
                  value={editFormData.balance}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave empty to keep current"
                />
              </div>
            </div>
            {editFormData.role === "TRADER" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-followers">Followers</Label>
                    <Input
                      id="edit-followers"
                      type="number"
                      value={editFormData.followers}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, followers: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-winRate">Win Rate (%)</Label>
                    <Input
                      id="edit-winRate"
                      type="number"
                      step="0.1"
                      value={editFormData.winRate}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, winRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-wins">Wins</Label>
                    <Input
                      id="edit-wins"
                      type="number"
                      value={editFormData.wins}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, wins: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-losses">Losses</Label>
                    <Input
                      id="edit-losses"
                      type="number"
                      value={editFormData.losses}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, losses: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-traderTrades">Trades</Label>
                    <Input
                      id="edit-traderTrades"
                      type="number"
                      value={editFormData.traderTrades}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, traderTrades: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minStartup">Min Startup</Label>
                  <Input
                    id="edit-minStartup"
                    type="number"
                    step="0.01"
                    value={editFormData.minStartup}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, minStartup: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-firstName">First Name</Label>
                <Input
                  id="add-firstName"
                  value={addFormData.firstName}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-lastName">Last Name</Label>
                <Input
                  id="add-lastName"
                  value={addFormData.lastName}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-username">Username</Label>
              <Input
                id="add-username"
                value={addFormData.username}
                onChange={(e) => setAddFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-role">Role</Label>
                <Select
                  value={addFormData.role}
                  onValueChange={(value) => setAddFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="TRADER">Trader</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-address">Address</Label>
              <Textarea
                id="add-address"
                value={addFormData.address}
                onChange={(e) => setAddFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-status">Status</Label>
                <Select
                  value={addFormData.status}
                  onValueChange={(value) => setAddFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password">Password</Label>
                <Input
                  id="add-password"
                  type="password"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-balance">Balance</Label>
                <Input
                  id="add-balance"
                  type="number"
                  step="0.01"
                  value={addFormData.balance}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            {addFormData.role === "TRADER" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-followers">Followers</Label>
                    <Input
                      id="add-followers"
                      type="number"
                      value={addFormData.followers}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, followers: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-winRate">Win Rate (%)</Label>
                    <Input
                      id="add-winRate"
                      type="number"
                      step="0.1"
                      value={addFormData.winRate}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, winRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-wins">Wins</Label>
                    <Input
                      id="add-wins"
                      type="number"
                      value={addFormData.wins}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, wins: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-losses">Losses</Label>
                    <Input
                      id="add-losses"
                      type="number"
                      value={addFormData.losses}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, losses: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-traderTrades">Trades</Label>
                    <Input
                      id="add-traderTrades"
                      type="number"
                      value={addFormData.traderTrades}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, traderTrades: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-minStartup">Min Startup</Label>
                  <Input
                    id="add-minStartup"
                    type="number"
                    step="0.01"
                    value={addFormData.minStartup}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, minStartup: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              for {userToDelete?.firstName} {userToDelete?.lastName} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkAction.replace('_', ' ')} {selectedUsers.length} selected users?
              {bulkAction === "reset_passwords" && " They will receive a temporary password."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

