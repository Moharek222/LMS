import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Plus,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Printer,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useTeacherAccessCodes } from '../hooks/useTeacherAccessCodes';
import { AccessCodeCard } from './accessCodes/AccessCodeCard';
import { GenerateAccessCodeModal, type GenerationMode } from './accessCodes/GenerateAccessCodeModal';
import { PrintAccessCodesModal } from './accessCodes/PrintAccessCodesModal';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { isAccessCodeExpired } from '../utils/accessCodeUtils';

export const TeacherAccessCodeManager: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 50;

  const [isGenerateOpen, setIsGenerateOpen] = useState<boolean>(false);
  const [generateModalMode, setGenerateModalMode] = useState<GenerationMode>('single');
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');

  // Fetch all access codes (limit 1000) so search and counters cover ALL records
  const { data, isLoading, isError, error, refetch } = useTeacherAccessCodes({
    page: 1,
    limit: 1000,
  });

  const normalizeArabic = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\u064B-\u065F]/g, '');
  };

  const accessCodes = data?.data || [];
  const totalItems = data?.total || accessCodes.length;

  // True full counts across all access codes with real-time expiration awareness
  const activeCount = useMemo(() => {
    return accessCodes.filter((c) => !isAccessCodeExpired(c)).length;
  }, [accessCodes]);

  const expiredCount = useMemo(() => {
    return accessCodes.filter((c) => isAccessCodeExpired(c)).length;
  }, [accessCodes]);

  // Comprehensive filter across ALL access codes
  const filteredAccessCodes = useMemo(() => {
    let result = accessCodes;

    if (statusFilter === 'active') {
      result = result.filter((code) => !isAccessCodeExpired(code));
    } else if (statusFilter === 'expired') {
      result = result.filter((code) => isAccessCodeExpired(code));
    }

    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery);
      const rawQuery = searchQuery.trim().toLowerCase();

      result = result.filter((code) => {
        const student = typeof code.studentID === 'object' && code.studentID !== null ? code.studentID : null;
        const studentName = normalizeArabic(student?.name || '');
        const studentPhone = student?.phone || '';
        const codeStr = (code.code || '').toLowerCase();

        return (
          codeStr.includes(rawQuery) ||
          studentName.includes(q) ||
          studentPhone.includes(searchQuery.trim())
        );
      });
    }

    return result;
  }, [accessCodes, statusFilter, searchQuery]);

  // Reset to first page when search query or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAccessCodes.length / pageSize));

  // Current page slice for smooth rendering
  const paginatedAccessCodes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccessCodes.slice(start, start + pageSize);
  }, [filteredAccessCodes, currentPage, pageSize]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-65">
        <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
        <p className="text-xs font-bold text-slate-600">جاري تحميل كافة أكواد التفعيل...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl p-8 border border-red-200 bg-red-50/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل أكواد التفعيل</h4>
        <p className="text-xs text-slate-600 font-semibold max-w-md">
          {toArabicErrorMessage(error, 'تعذر تحميل أكواد التفعيل حالياً.')}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
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
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
            <KeyRound size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-800">أكواد التفعيل</h3>
              <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0D8A82] text-xs font-bold border border-teal-100">
                إجمالي الأكواد: {totalItems}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                الأكواد النشطة الحالية: {activeCount}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              توليد ومتابعة أكواد شحن تفعيل حسابات وإشتراكات الطلاب والبحث في كامل السجلات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filteredAccessCodes.length > 0 && (
            <button
              type="button"
              onClick={() => setIsPrintOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-50 text-[#0D8A82] border border-teal-200 hover:bg-teal-100 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <Printer size={16} />
              <span>طباعة كشف الأكواد (PDF) 🖨️ ({filteredAccessCodes.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setGenerateModalMode('group');
              setIsGenerateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition cursor-pointer shadow-xs"
          >
            <Sparkles size={16} />
            <span>توليد أكواد جماعية</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGenerateModalMode('single');
              setIsGenerateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
          >
            <Plus size={16} />
            <span>إنشاء كود فردي</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      {accessCodes.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Instant Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في جميع الأكواد (الكود، اسم الطالب، رقم الهاتف)..."
              className="w-full pr-10 pl-9 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] bg-slate-50/70 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="مسح البحث"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#0D8A82] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({accessCodes.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>النشطة ({activeCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('expired')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                statusFilter === 'expired'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <XCircle size={13} />
              <span>المنتهية ({expiredCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Access Codes List */}
      {accessCodes.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
            <KeyRound size={28} />
          </div>
          <h4 className="text-base font-bold text-slate-800">لا توجد أكواد تفعيل حتى الآن</h4>
          <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
            قم بإنشاء كود تفعيل مخصص للطلاب لتفعيل صلاحيات الوصول بالمنصة.
          </p>
        </div>
      ) : filteredAccessCodes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
            <Search size={22} />
          </div>
          <h4 className="text-sm font-bold text-slate-700">لا توجد أكواد مطابقة لمعايير البحث</h4>
          <p className="text-xs text-slate-400">
            {searchQuery ? `البحث: "${searchQuery}"` : ''} {statusFilter !== 'all' ? `(الحالة: ${statusFilter})` : ''}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="text-xs text-[#0D8A82] font-bold hover:underline cursor-pointer"
          >
            إعادة تعيين الفلاتر وعرض جميع الأكواد ({accessCodes.length})
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedAccessCodes.map((code) => (
            <AccessCodeCard key={code._id} accessCode={code} />
          ))}
        </div>
      )}

      {/* Smooth Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight size={16} />
            <span>السابق</span>
          </button>

          <span className="text-xs font-bold text-slate-600">
            صفحة {currentPage} من {totalPages} (معروض {paginatedAccessCodes.length} من {filteredAccessCodes.length} كود)
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <span>التالي</span>
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      <GenerateAccessCodeModal
        key={isGenerateOpen ? `modal-${generateModalMode}` : 'modal-closed'}
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        initialMode={generateModalMode}
      />

      <PrintAccessCodesModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        accessCodes={filteredAccessCodes}
      />
    </div>
  );
};

export default TeacherAccessCodeManager;
