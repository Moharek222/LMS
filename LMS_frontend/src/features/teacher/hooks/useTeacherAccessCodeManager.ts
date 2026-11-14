import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTeacherAccessCodes } from './useTeacherAccessCodes';
import { useTeacherGroups } from './useTeacherGroups';
import { getAllStudentsApi, type PlatformStudentItem } from '../api/teacherAccessCodesApi';
import { isAccessCodeExpired } from '../utils/accessCodeUtils';
import { Grade } from '../../../types/grade';
import { AcademicTrack } from '../../../types/academicTrack';
import type { AccessCode, Group } from '../types/groupManagement';

export type GradeFilterValue = 'ALL' | Grade;
export type TrackFilterValue = 'ALL' | AcademicTrack;
export type StatusFilterValue = 'all' | 'active' | 'expired';

export interface AccessCodeCounts {
  firstSec: number;
  secondSec: number;
  secondSecGeneral: number;
  secondSecBac: number;
  thirdSec: number;
}

export const useTeacherAccessCodeManager = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 50;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [gradeFilter, setGradeFilter] = useState<GradeFilterValue>('ALL');
  const [trackFilter, setTrackFilter] = useState<TrackFilterValue>('ALL');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  // 1. Fetch access codes (limit 1000 for comprehensive search and statistics)
  const { data, isLoading, isError, error, refetch } = useTeacherAccessCodes({
    page: 1,
    limit: 1000,
  });

  // 2. Fetch platform students lookup for grade & track enrichment
  const { data: studentsLookup } = useQuery({
    queryKey: ['platform-students-lookup'],
    queryFn: getAllStudentsApi,
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch groups list for center groups filtering
  const { data: groupsData } = useTeacherGroups({ limit: 100 });

  const activeGroups = useMemo<Group[]>(() => {
    const list: Group[] = Array.isArray(groupsData?.data) ? groupsData.data : [];
    return list.filter((g) => Boolean(g && g._id && g.isActive !== false));
  }, [groupsData]);

  // Fast mapping of students by _id and phone
  const studentsMap = useMemo(() => {
    const map = new Map<string, PlatformStudentItem>();
    if (Array.isArray(studentsLookup)) {
      studentsLookup.forEach((s) => {
        if (s?._id) {
          map.set(String(s._id), s);
        }
        if (s?.phone) {
          map.set(s.phone.trim(), s);
        }
      });
    }
    return map;
  }, [studentsLookup]);

  const rawAccessCodes = useMemo<AccessCode[]>(() => data?.data || [], [data]);
  const totalItems = data?.total || rawAccessCodes.length;

  // Enrich access codes with student grade, academicTrack, and groupName
  const enrichedAccessCodes = useMemo<AccessCode[]>(() => {
    return rawAccessCodes.map((code) => {
      const studentObj =
        typeof code.studentID === 'object' && code.studentID !== null ? code.studentID : null;
      const studentId =
        studentObj && '_id' in studentObj ? String((studentObj as { _id?: string })._id) : '';
      const phone = studentObj?.phone?.trim() || '';

      const matchedStudent =
        (studentId ? studentsMap.get(studentId) : null) ||
        (phone ? studentsMap.get(phone) : null);

      const grade =
        (matchedStudent?.grade as Grade) || (studentObj?.grade as Grade) || undefined;
      const academicTrack =
        (matchedStudent?.academicTrack as AcademicTrack) ||
        (studentObj?.academicTrack as AcademicTrack) ||
        undefined;

      let groupName = '';
      if (matchedStudent?.groupID) {
        if (typeof matchedStudent.groupID === 'object' && 'name' in matchedStudent.groupID) {
          groupName = matchedStudent.groupID.name;
        } else if (typeof matchedStudent.groupID === 'string') {
          const foundGroup = activeGroups.find((g) => String(g._id) === String(matchedStudent.groupID));
          if (foundGroup) groupName = foundGroup.name;
        }
      }

      return {
        ...code,
        enrichedStudent: {
          _id: matchedStudent?._id || studentId,
          name: studentObj?.name || matchedStudent?.name || 'طالب مسجل',
          phone: studentObj?.phone || matchedStudent?.phone || '',
          grade,
          academicTrack,
          groupName,
        },
      };
    });
  }, [rawAccessCodes, studentsMap, activeGroups]);

  const normalizeArabic = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\u064B-\u065F]/g, '');
  };

  // Grade and Track counts across all codes
  const counts = useMemo<AccessCodeCounts>(() => {
    let firstSec = 0;
    let secondSec = 0;
    let secondSecGeneral = 0;
    let secondSecBac = 0;
    let thirdSec = 0;

    enrichedAccessCodes.forEach((c) => {
      const grade = c.enrichedStudent?.grade;
      const track = c.enrichedStudent?.academicTrack;

      if (grade === Grade.FirstSecondary || grade === 'first_secondary') {
        firstSec++;
      } else if (grade === Grade.SecondSecondary || grade === 'second_secondary') {
        secondSec++;
        if (track === AcademicTrack.General || track === 'general') {
          secondSecGeneral++;
        } else if (track === AcademicTrack.Baccalaureate || track === 'baccalaureate') {
          secondSecBac++;
        }
      } else if (grade === Grade.ThirdSecondary || grade === 'third_secondary') {
        thirdSec++;
      }
    });

    return {
      firstSec,
      secondSec,
      secondSecGeneral,
      secondSecBac,
      thirdSec,
    };
  }, [enrichedAccessCodes]);

  // True active and expired counts
  const activeCount = useMemo(() => {
    return enrichedAccessCodes.filter((c) => !isAccessCodeExpired(c)).length;
  }, [enrichedAccessCodes]);

  const expiredCount = useMemo(() => {
    return enrichedAccessCodes.filter((c) => isAccessCodeExpired(c)).length;
  }, [enrichedAccessCodes]);

  // Comprehensive filter across ALL enriched access codes
  const filteredAccessCodes = useMemo(() => {
    let result = enrichedAccessCodes;

    // 1. Grade filter
    if (gradeFilter !== 'ALL') {
      result = result.filter((code) => {
        const g = code.enrichedStudent?.grade;
        if (gradeFilter === Grade.FirstSecondary) {
          return g === Grade.FirstSecondary || g === 'first_secondary';
        }
        if (gradeFilter === Grade.SecondSecondary) {
          return g === Grade.SecondSecondary || g === 'second_secondary';
        }
        if (gradeFilter === Grade.ThirdSecondary) {
          return g === Grade.ThirdSecondary || g === 'third_secondary';
        }
        return true;
      });

      // 1.1 Track filter (only applicable for 2nd secondary)
      if (gradeFilter === Grade.SecondSecondary && trackFilter !== 'ALL') {
        result = result.filter((code) => {
          const t = code.enrichedStudent?.academicTrack;
          if (trackFilter === AcademicTrack.General) {
            return t === AcademicTrack.General || t === 'general';
          }
          if (trackFilter === AcademicTrack.Baccalaureate) {
            return t === AcademicTrack.Baccalaureate || t === 'baccalaureate';
          }
          return true;
        });
      }

      // 1.2 Center Group filter (for 1st and 3rd secondary)
      if (
        (gradeFilter === Grade.FirstSecondary || gradeFilter === Grade.ThirdSecondary) &&
        selectedGroupId
      ) {
        const targetGroup = activeGroups.find((g) => g._id === selectedGroupId);
        if (targetGroup) {
          result = result.filter((code) => code.enrichedStudent?.groupName === targetGroup.name);
        }
      }
    }

    // 2. Status filter
    if (statusFilter === 'active') {
      result = result.filter((code) => !isAccessCodeExpired(code));
    } else if (statusFilter === 'expired') {
      result = result.filter((code) => isAccessCodeExpired(code));
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery);
      const rawQuery = searchQuery.trim().toLowerCase();

      result = result.filter((code) => {
        const student = code.enrichedStudent;
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
  }, [
    enrichedAccessCodes,
    gradeFilter,
    trackFilter,
    selectedGroupId,
    statusFilter,
    searchQuery,
    activeGroups,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredAccessCodes.length / pageSize));

  // Current page slice for rendering
  const paginatedAccessCodes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccessCodes.slice(start, start + pageSize);
  }, [filteredAccessCodes, currentPage, pageSize]);

  // Center groups available for currently selected grade
  const gradeGroups = useMemo(() => {
    if (gradeFilter === Grade.FirstSecondary) {
      return activeGroups.filter((g) => g.grade === Grade.FirstSecondary || !g.grade);
    }
    if (gradeFilter === Grade.ThirdSecondary) {
      return activeGroups.filter((g) => g.grade === Grade.ThirdSecondary || !g.grade);
    }
    return [];
  }, [activeGroups, gradeFilter]);

  // Handlers with automatic page resetting
  const handleSetGradeFilter = (val: GradeFilterValue) => {
    setGradeFilter(val);
    setTrackFilter('ALL');
    setSelectedGroupId('');
    setCurrentPage(1);
  };

  const handleSetTrackFilter = (val: TrackFilterValue) => {
    setTrackFilter(val);
    setCurrentPage(1);
  };

  const handleSetSelectedGroupId = (id: string) => {
    setSelectedGroupId(id);
    setCurrentPage(1);
  };

  const handleSetStatusFilter = (val: StatusFilterValue) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setGradeFilter('ALL');
    setTrackFilter('ALL');
    setSelectedGroupId('');
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return {
    state: {
      currentPage,
      searchQuery,
      statusFilter,
      gradeFilter,
      trackFilter,
      selectedGroupId,
    },
    handlers: {
      setCurrentPage,
      setSearchQuery: handleSetSearchQuery,
      setStatusFilter: handleSetStatusFilter,
      setGradeFilter: handleSetGradeFilter,
      setTrackFilter: handleSetTrackFilter,
      setSelectedGroupId: handleSetSelectedGroupId,
      resetFilters,
    },
    data: {
      totalItems,
      rawAccessCodes,
      enrichedAccessCodes,
      filteredAccessCodes,
      paginatedAccessCodes,
      totalPages,
      counts,
      activeCount,
      expiredCount,
      gradeGroups,
    },
    status: {
      isLoading,
      isError,
      error,
      refetch,
    },
  };
};

export default useTeacherAccessCodeManager;

