import React from 'react';
import { useAdminManagement } from '../hooks/useAdminManagement';
import { AdminHeaderBanner } from './AdminHeaderBanner';
import { AddAdminForm } from './AddAdminForm';
import { AdminList } from './AdminList';
import { DeleteAdminModal } from './DeleteAdminModal';

export const AdminUserManagement: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    adminToDelete,
    setAdminToDelete,
    serverError,
    filteredAdmins,
    totalAdmins,
    isLoadingAdmins,
    isRefetchingAdmins,
    refetch,
    addAdminMutation,
    deleteAdminMutation,
  } = useAdminManagement();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Stats */}
      <AdminHeaderBanner
        totalAdmins={totalAdmins}
        isRefetching={isRefetchingAdmins}
        isLoading={isLoadingAdmins}
        onRefresh={() => void refetch()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 2. Add New Admin Form */}
        <div className="lg:col-span-5">
          <AddAdminForm
            isSubmitting={addAdminMutation.isPending}
            serverError={serverError}
            onSubmit={(data) => addAdminMutation.mutate(data)}
          />
        </div>

        {/* 3. Admins List & Search */}
        <div className="lg:col-span-7">
          <AdminList
            admins={filteredAdmins}
            isLoading={isLoadingAdmins}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onDeleteClick={setAdminToDelete}
            deletingId={adminToDelete?._id}
          />
        </div>
      </div>

      {/* 4. Delete Confirmation Dialog */}
      <DeleteAdminModal
        admin={adminToDelete}
        isDeleting={deleteAdminMutation.isPending}
        onClose={() => setAdminToDelete(null)}
        onConfirm={() => {
          if (adminToDelete) {
            deleteAdminMutation.mutate(adminToDelete._id);
          }
        }}
      />
    </div>
  );
};

export default AdminUserManagement;
