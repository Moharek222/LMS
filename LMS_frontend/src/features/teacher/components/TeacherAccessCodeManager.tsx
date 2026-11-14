import React, { useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTeacherAccessCodeManager } from '../hooks/useTeacherAccessCodeManager';
import { AccessCodeCard } from './accessCodes/AccessCodeCard';
import { GenerateAccessCodeModal, type GenerationMode } from './accessCodes/GenerateAccessCodeModal';
import { PrintAccessCodesModal } from './accessCodes/PrintAccessCodesModal';
import { AccessCodesHeader } from './accessCodes/AccessCodesHeader';
import { AccessCodesGradeTabs } from './accessCodes/AccessCodesGradeTabs';
import { AccessCodesToolbar } from './accessCodes/AccessCodesToolbar';
import { AccessCodesPagination } from './accessCodes/AccessCodesPagination';
import { AccessCodesEmptyState } from './accessCodes/AccessCodesEmptyState';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

export const TeacherAccessCodeManager: React.FC = () => {
  const manager = useTeacherAccessCodeManager();

  const [isGenerateOpen, setIsGenerateOpen] = useState<boolean>(false);
  const [generateModalMode, setGenerateModalMode] = useState<GenerationMode>('single');
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);

  if (manager.status.isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-65">
        <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
        <p className="text-xs font-bold text-slate-600">جاري تحميل كافة أكواد التفعيل والبيانات...</p>
      </div>
    );
  }

  if (manager.status.isError) {
    return (
      <div className="rounded-3xl p-8 border border-red-200 bg-red-50/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل أكواد التفعيل</h4>
        <p className="text-xs text-slate-600 font-semibold max-w-md">
          {toArabicErrorMessage(manager.status.error, 'تعذر تحميل أكواد التفعيل حالياً.')}
        </p>
        <button
          type="button"
          onClick={() => manager.status.refetch()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs mt-2"
        >
          <RefreshCw size={14} />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats & Actions */}
      <AccessCodesHeader
        totalItems={manager.data.totalItems}
        activeCount={manager.data.activeCount}
        filteredCount={manager.data.filteredAccessCodes.length}
        onOpenPrint={() => setIsPrintOpen(true)}
        onOpenGenerateGroup={() => {
          setGenerateModalMode('group');
          setIsGenerateOpen(true);
        }}
        onOpenGenerateSingle={() => {
          setGenerateModalMode('single');
          setIsGenerateOpen(true);
        }}
      />

      {/* 2. Academic Grade & Track Tabs */}
      <AccessCodesGradeTabs
        gradeFilter={manager.state.gradeFilter}
        trackFilter={manager.state.trackFilter}
        selectedGroupId={manager.state.selectedGroupId}
        counts={manager.data.counts}
        totalCodesCount={manager.data.rawAccessCodes.length}
        gradeGroups={manager.data.gradeGroups}
        onSelectGrade={manager.handlers.setGradeFilter}
        onSelectTrack={manager.handlers.setTrackFilter}
        onSelectGroup={manager.handlers.setSelectedGroupId}
      />

      {/* 3. Search and Status Toolbar */}
      {manager.data.rawAccessCodes.length > 0 && (
        <AccessCodesToolbar
          searchQuery={manager.state.searchQuery}
          statusFilter={manager.state.statusFilter}
          totalCount={manager.data.rawAccessCodes.length}
          activeCount={manager.data.activeCount}
          expiredCount={manager.data.expiredCount}
          onSearchChange={manager.handlers.setSearchQuery}
          onStatusChange={manager.handlers.setStatusFilter}
        />
      )}

      {/* 4. Codes List or Empty State */}
      {manager.data.rawAccessCodes.length === 0 ? (
        <AccessCodesEmptyState
          isEntirelyEmpty={true}
          totalCodesCount={0}
          onResetFilters={manager.handlers.resetFilters}
        />
      ) : manager.data.filteredAccessCodes.length === 0 ? (
        <AccessCodesEmptyState
          isEntirelyEmpty={false}
          totalCodesCount={manager.data.rawAccessCodes.length}
          gradeFilter={manager.state.gradeFilter}
          trackFilter={manager.state.trackFilter}
          searchQuery={manager.state.searchQuery}
          onResetFilters={manager.handlers.resetFilters}
        />
      ) : (
        <div className="space-y-3">
          {manager.data.paginatedAccessCodes.map((code) => (
            <AccessCodeCard key={code._id} accessCode={code} />
          ))}
        </div>
      )}

      {/* 5. Pagination */}
      {manager.data.totalPages > 1 && (
        <AccessCodesPagination
          currentPage={manager.state.currentPage}
          totalPages={manager.data.totalPages}
          paginatedCount={manager.data.paginatedAccessCodes.length}
          filteredCount={manager.data.filteredAccessCodes.length}
          onPageChange={manager.handlers.setCurrentPage}
        />
      )}

      {/* 6. Modals */}
      <GenerateAccessCodeModal
        key={isGenerateOpen ? `modal-${generateModalMode}` : 'modal-closed'}
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        initialMode={generateModalMode}
      />

      <PrintAccessCodesModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        accessCodes={manager.data.filteredAccessCodes}
      />
    </div>
  );
};

export default TeacherAccessCodeManager;
