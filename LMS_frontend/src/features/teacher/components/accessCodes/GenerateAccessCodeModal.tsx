import React from 'react';
import { KeyRound, X, AlertTriangle, Users, User, Globe } from 'lucide-react';
import { PrintAccessCodesModal } from './PrintAccessCodesModal';
import { AccessCodeResultViews } from './AccessCodeResultViews';
import { AccessCodeGenerationForms } from './AccessCodeGenerationForms';
import {
  useGenerateAccessCodeModalLogic,
  type GenerationMode,
} from '../../hooks/useGenerateAccessCodeModalLogic';

export type { GenerationMode };

interface GenerateAccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: GenerationMode;
}

class ModalErrorBoundary extends React.Component<
  { children: React.ReactNode; onClose: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل النافذة</h4>
            <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
              تعذر تحميل بعض البيانات الخاصة بالطلاب أو المجموعات حالياً. يرجى إغلاق النافذة والمحاولة مرة أخرى.
            </p>
          </div>
          <button
            type="button"
            onClick={this.props.onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition cursor-pointer shadow-xs"
          >
            إغلاق النافذة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const GenerateAccessCodeModal: React.FC<GenerateAccessCodeModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'single',
}) => {
  const {
    mode,
    setMode,
    selectedGroupId,
    selectedStudentId,
    setSelectedStudentId,
    validationError,
    setValidationError,
    apiError,
    setApiError,
    singleResult,
    groupResult,
    copied,
    isPrintResultOpen,
    setIsPrintResultOpen,
    activeGroups,
    safeGroupStudents,
    safeAllStudents,
    studentMap,
    printableNewCodes,
    isLoadingGroups,
    isErrorGroups,
    errorGroups,
    refetchGroups,
    isLoadingStudents,
    isErrorStudents,
    errorStudents,
    refetchStudents,
    isLoadingAllStudents,
    isErrorAllStudents,
    errorAllStudents,
    refetchAllStudents,
    isPending,
    isGeneratingSingle,
    isGeneratingGroup,
    handleClose,
    handleGroupChange,
    handleSingleSubmit,
    handleBatchSubmit,
    handleGroupBulkSubmit,
    handleAllStudentsBulkSubmit,
    handleCopyCode,
    handleCopyAllGenerated,
  } = useGenerateAccessCodeModalLogic({ isOpen, onClose, initialMode });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <ModalErrorBoundary onClose={handleClose}>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">توليد أكواد التفعيل</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  توليد كود لطالب محدد (بما يشمل تانية ثانوي)، أو توليد جماعي للدفعات والمجموعات
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 space-y-5 pr-1">
            {/* Mode Selector Tabs */}
            {!singleResult && !groupResult && (
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMode('single');
                    setValidationError('');
                    setApiError('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'single'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User size={15} />
                  <span>طالب فردي</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('group');
                    setValidationError('');
                    setApiError('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'group'
                      ? 'bg-white text-[#0D8A82] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users size={15} />
                  <span>دفعات ومجموعات</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('all');
                    setValidationError('');
                    setApiError('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'all'
                      ? 'bg-white text-amber-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe size={15} />
                  <span>جميع الطلاب</span>
                </button>
              </div>
            )}

            {/* Results Views */}
            <AccessCodeResultViews
              singleResult={singleResult}
              groupResult={groupResult}
              studentMap={studentMap}
              copied={copied}
              onCopyCode={handleCopyCode}
              onCopyAllGenerated={handleCopyAllGenerated}
              onOpenPrintModal={() => setIsPrintResultOpen(true)}
              onClose={handleClose}
            />

            {/* Generation Input Forms */}
            {!singleResult && !groupResult && (
              <AccessCodeGenerationForms
                mode={mode}
                selectedGroupId={selectedGroupId}
                selectedStudentId={selectedStudentId}
                activeGroups={activeGroups}
                safeGroupStudents={safeGroupStudents}
                safeAllStudents={safeAllStudents}
                isLoadingGroups={isLoadingGroups}
                isErrorGroups={isErrorGroups}
                errorGroups={errorGroups}
                refetchGroups={refetchGroups}
                isLoadingStudents={isLoadingStudents}
                isErrorStudents={isErrorStudents}
                errorStudents={errorStudents}
                refetchStudents={refetchStudents}
                isLoadingAllStudents={isLoadingAllStudents}
                isErrorAllStudents={isErrorAllStudents}
                errorAllStudents={errorAllStudents}
                refetchAllStudents={refetchAllStudents}
                validationError={validationError}
                apiError={apiError}
                isPending={isPending}
                isGeneratingSingle={isGeneratingSingle}
                isGeneratingGroup={isGeneratingGroup}
                onGroupChange={handleGroupChange}
                onStudentChange={(id) => {
                  setSelectedStudentId(id);
                  setValidationError('');
                  setApiError('');
                }}
                onSingleSubmit={handleSingleSubmit}
                onGroupBulkSubmit={handleGroupBulkSubmit}
                onBatchSubmit={handleBatchSubmit}
                onAllStudentsBulkSubmit={handleAllStudentsBulkSubmit}
                onClose={handleClose}
              />
            )}
          </div>
        </ModalErrorBoundary>
      </div>

      {isPrintResultOpen && (
        <PrintAccessCodesModal
          isOpen={isPrintResultOpen}
          onClose={() => setIsPrintResultOpen(false)}
          accessCodes={printableNewCodes}
        />
      )}
    </div>
  );
};

export default GenerateAccessCodeModal;
