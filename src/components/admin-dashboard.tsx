"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export default function AdminDashboardPage() {
  const { user } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const checkPermission = async () => {
        const permission = await hasPermission(user.id, PERMISSIONS.ADMIN_DASHBOARD);
        setHasAccess(permission);
        setLoading(false);
      };
      checkPermission();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Admin Dashboard</h1>
      <p>Welcome to the admin dashboard. Here you can manage users, settings, and other administrative tasks.</p>
    </div>
  );
}
