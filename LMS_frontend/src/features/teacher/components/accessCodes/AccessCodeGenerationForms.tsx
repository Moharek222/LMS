import React from 'react';
import type { Group, GroupStudent } from '../../types/groupManagement';
import type { PlatformStudentItem } from '../../api/teacherAccessCodesApi';
import type { GenerationMode } from './GenerateAccessCodeModal';
import { SingleStudentGenerationForm } from './forms/SingleStudentGenerationForm';
import { CohortBatchGenerationForm } from './forms/CohortBatchGenerationForm';
import { AllStudentsGenerationForm } from './forms/AllStudentsGenerationForm';

export interface AccessCodeGenerationFormsProps {
  mode: GenerationMode;
  selectedGroupId: string;
  selectedStudentId: string;
  activeGroups: Group[];
  safeGroupStudents: GroupStudent[];
  safeAllStudents: PlatformStudentItem[];
  isLoadingGroups: boolean;
  isErrorGroups: boolean;
  errorGroups: unknown;
  refetchGroups: () => void;
  isLoadingStudents: boolean;
  isErrorStudents: boolean;
  errorStudents: unknown;
  refetchStudents: () => void;
  isLoadingAllStudents: boolean;
  isErrorAllStudents: boolean;
  errorAllStudents: unknown;
  refetchAllStudents: () => void;
  validationError: string;
  apiError: string;
  isPending: boolean;
  isGeneratingSingle: boolean;
  isGeneratingGroup: boolean;
  onGroupChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onStudentChange: (studentId: string) => void;
  onSingleSubmit: (e: React.FormEvent) => void;
  onGroupBulkSubmit: () => void;
  onBatchSubmit: (studentIDs: string[], cohortName: string) => void;
  onAllStudentsBulkSubmit: () => void;
  onClose: () => void;
}

export const AccessCodeGenerationForms: React.FC<AccessCodeGenerationFormsProps> = ({
  mode,
  selectedGroupId,
  selectedStudentId,
  activeGroups,
  safeGroupStudents,
  safeAllStudents,
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
  validationError,
  apiError,
  isPending,
  isGeneratingSingle,
  isGeneratingGroup,
  onGroupChange,
  onStudentChange,
  onSingleSubmit,
  onGroupBulkSubmit,
  onBatchSubmit,
  onAllStudentsBulkSubmit,
  onClose,
}) => {
  if (mode === 'single') {
    return (
      <SingleStudentGenerationForm
        selectedStudentId={selectedStudentId}
        selectedGroupId={selectedGroupId}
        safeAllStudents={safeAllStudents}
        activeGroups={activeGroups}
        safeGroupStudents={safeGroupStudents}
        isLoadingGroups={isLoadingGroups}
        isErrorGroups={isErrorGroups}
        errorGroups={errorGroups}
        refetchGroups={refetchGroups}
        isLoadingStudents={isLoadingStudents}
        isErrorStudents={isErrorStudents}
        errorStudents={errorStudents}
        refetchStudents={refetchStudents}
        isLoadingAllStudents={isLoadingAllStudents}
        validationError={validationError}
        apiError={apiError}
        isPending={isPending}
        isGeneratingSingle={isGeneratingSingle}
        onGroupChange={onGroupChange}
        onStudentChange={onStudentChange}
        onSingleSubmit={onSingleSubmit}
        onClose={onClose}
      />
    );
  }

  if (mode === 'group') {
    return (
      <CohortBatchGenerationForm
        safeAllStudents={safeAllStudents}
        isLoadingAllStudents={isLoadingAllStudents}
        activeGroups={activeGroups}
        selectedGroupId={selectedGroupId}
        safeGroupStudents={safeGroupStudents}
        isLoadingGroups={isLoadingGroups}
        isErrorGroups={isErrorGroups}
        errorGroups={errorGroups}
        refetchGroups={refetchGroups}
        isLoadingStudents={isLoadingStudents}
        isErrorStudents={isErrorStudents}
        errorStudents={errorStudents}
        refetchStudents={refetchStudents}
        validationError={validationError}
        apiError={apiError}
        isPending={isPending}
        isGeneratingGroup={isGeneratingGroup}
        onGroupChange={onGroupChange}
        onGroupBulkSubmit={onGroupBulkSubmit}
        onBatchSubmit={onBatchSubmit}
        onClose={onClose}
      />
    );
  }

  return (
    <AllStudentsGenerationForm
      safeAllStudents={safeAllStudents}
      isLoadingAllStudents={isLoadingAllStudents}
      isErrorAllStudents={isErrorAllStudents}
      errorAllStudents={errorAllStudents}
      refetchAllStudents={refetchAllStudents}
      validationError={validationError}
      apiError={apiError}
      isPending={isPending}
      isGeneratingGroup={isGeneratingGroup}
      onAllStudentsBulkSubmit={onAllStudentsBulkSubmit}
      onClose={onClose}
    />
  );
};

export default AccessCodeGenerationForms;
