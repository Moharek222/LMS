import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addAdmin,
  getAdmins,
  deleteAdminUser,
  type AdminUserItem,
  type GetAdminsResponse,
  type CreateStaffPayload,
} from '../api/adminUserApi';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';

export const useAdminManagement = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [adminToDelete, setAdminToDelete] = useState<AdminUserItem | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // 1. Fetch admins list
  const {
    data: adminsData,
    isLoading: isLoadingAdmins,
    isRefetching: isRefetchingAdmins,
    refetch,
  } = useQuery({
    queryKey: ['platform-admins-list'],
    queryFn: () => getAdmins(1, 50),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const adminsList = useMemo<AdminUserItem[]>(() => {
    return adminsData?.data || [];
  }, [adminsData]);

  const totalAdmins = adminsData?.total || adminsList.length;

  const filteredAdmins = useMemo(() => {
    if (!searchTerm.trim()) return adminsList;
    const q = searchTerm.trim().toLowerCase();
    return adminsList.filter((adm) => {
      const matchName = adm.name?.toLowerCase().includes(q);
      const matchEmail = adm.email?.toLowerCase().includes(q);
      return matchName || matchEmail;
    });
  }, [adminsList, searchTerm]);

  // 2. Add Admin Mutation
  const addAdminMutation = useMutation({
    mutationFn: (payload: CreateStaffPayload) => addAdmin(payload),
    onSuccess: (res, variables) => {
      toast.success(res.message || 'تم إنشاء حساب مدير النظام بنجاح! 🛡️');

      const createdAdmin: AdminUserItem = res?.adminWithoutPassword || res?.admin || {
        _id: String(Date.now()),
        name: variables.name,
        email: variables.email,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      // Optimistic cache update
      queryClient.setQueryData<GetAdminsResponse>(['platform-admins-list'], (old) => {
        if (!old) {
          return {
            message: 'success',
            page: 1,
            limit: 50,
            total: 1,
            totalPages: 1,
            data: [createdAdmin],
          };
        }
        return {
          ...old,
          total: (old.total || old.data.length) + 1,
          data: [
            createdAdmin,
            ...old.data.filter((a) => a._id !== createdAdmin._id && a.email !== createdAdmin.email),
          ],
        };
      });

      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ['platform-admins-list'] });
    },
    onError: (err) => {
      const msg = toArabicErrorMessage(err, 'فشل إنشاء حساب المدير الجديد.');
      setServerError(msg);
      toast.error(msg);
    },
  });

  // 3. Delete Admin Mutation
  const deleteAdminMutation = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: (res, deletedId) => {
      toast.success(res.message || 'تم حذف حساب المدير بنجاح 🗑️');

      queryClient.setQueryData<GetAdminsResponse>(['platform-admins-list'], (old) => {
        if (!old) return old;
        return {
          ...old,
          total: Math.max(0, (old.total || old.data.length) - 1),
          data: old.data.filter((a) => a._id !== deletedId),
        };
      });

      setAdminToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['platform-admins-list'] });
    },
    onError: (err) => {
      const msg = toArabicErrorMessage(err, 'تعذر حذف حساب المدير من السيرفر.');
      toast.error(msg);
      setAdminToDelete(null);
    },
  });

  return {
    searchTerm,
    setSearchTerm,
    adminToDelete,
    setAdminToDelete,
    serverError,
    setServerError,
    adminsList,
    filteredAdmins,
    totalAdmins,
    isLoadingAdmins,
    isRefetchingAdmins,
    refetch,
    addAdminMutation,
    deleteAdminMutation,
  };
};

