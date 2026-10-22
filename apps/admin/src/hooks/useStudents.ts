import { useQuery, useQueryClient } from '@tanstack/react-query';
import { settleMutations } from '@carecraft/query-core';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/services/api-client';

export interface IStudent {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  admissionDate: string;
  profileImage?: string;
  parentId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  } | null;
  enrollmentId?: {
    _id: string;
    gradeId: {
      _id: string;
      level: string;
    };
    schoolYear: string;
    isActive: boolean;
  } | null;
  createdAt?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseStudentsParams {
  gradeId?: string;
  pagination?: { page: number; pageSize: number };
  search?: string;
}

// Type guard for File
function isFile(value: unknown): value is File {
  return value instanceof File;
}

const STUDENT_SEARCH_FETCH_LIMIT = 1000;

interface StudentListPayload {
  success?: boolean;
  message?: string;
  data?: IStudent[];
  pagination?: PaginationMeta;
}

const normalizeSearchValue = (value?: string | null) =>
  (value ?? '').trim().toLowerCase();

const matchesStudentSearch = (student: IStudent, search: string) => {
  const term = normalizeSearchValue(search);
  if (!term) return true;

  const firstName = normalizeSearchValue(student.firstName);
  const middleName = normalizeSearchValue(student.middleName);
  const lastName = normalizeSearchValue(student.lastName);
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
  const firstLastName = [firstName, lastName].filter(Boolean).join(' ');
  const haystacks = [firstName, middleName, lastName, fullName, firstLastName];

  if (haystacks.some((value) => value.includes(term))) return true;

  const tokens = term.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return false;

  return tokens.every((token) =>
    haystacks.some((value) => value.includes(token)),
  );
};

const fetchAllStudents = async (gradeId?: string): Promise<IStudent[]> => {
  const fetchPage = async (page: number, limit: number) => {
    const params = new URLSearchParams();
    if (gradeId) params.set('gradeId', gradeId);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const response = await apiClient.get<StudentListPayload>(
      `/student?${params.toString()}`,
    );
    const payload = response.data;

    if (payload?.success === false) {
      throw new Error(payload.message || 'Failed to load students');
    }

    return payload;
  };

  const firstPage = await fetchPage(1, STUDENT_SEARCH_FETCH_LIMIT);
  const firstItems = firstPage?.data ?? [];
  const total = firstPage?.pagination?.total ?? firstItems.length;
  const pageLimit =
    firstPage?.pagination?.limit ||
    firstItems.length ||
    STUDENT_SEARCH_FETCH_LIMIT;
  const pageCount = Math.max(1, Math.ceil(total / pageLimit));

  if (pageCount === 1) return firstItems;

  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      fetchPage(index + 2, pageLimit),
    ),
  );

  return [
    ...firstItems,
    ...remainingPages.flatMap((page) => page?.data ?? []),
  ];
};

export const useStudents = ({
  gradeId,
  pagination = { page: 1, pageSize: 10 },
  search = '',
}: UseStudentsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const trimmedSearch = search.trim();
  const isSearching = trimmedSearch.length > 0;

  const params = new URLSearchParams();
  if (gradeId) params.set('gradeId', gradeId);
  if (pagination) {
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.pageSize));
  }
  if (trimmedSearch) params.set('search', trimmedSearch);

  const fetchUrl = `/student?${params.toString()}`;
  const queryKey = ['/student', { gradeId, pagination, search: trimmedSearch }];

  const serverQuery = get(fetchUrl, {
    queryKey,
    enabled: !isSearching,
    staleTime: 30_000,
  });

  const allStudentsQuery = useQuery({
    queryKey: ['/student', { gradeId, all: true }],
    queryFn: () => fetchAllStudents(gradeId),
    enabled: isSearching,
    staleTime: 30_000,
  });

  const raw = serverQuery.data;
  const serverStudents: IStudent[] = raw?.data || [];
  const paginationMeta: PaginationMeta =
    raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  const allStudents = allStudentsQuery.data ?? [];
  const filteredStudents = isSearching
    ? allStudents.filter((student) =>
        matchesStudentSearch(student, trimmedSearch),
      )
    : serverStudents;

  const students = isSearching
    ? filteredStudents.slice(
        (pagination.page - 1) * pagination.pageSize,
        pagination.page * pagination.pageSize,
      )
    : serverStudents;

  const total = isSearching ? filteredStudents.length : paginationMeta.total;
  const currentPage = isSearching ? pagination.page : paginationMeta.page;
  const pageSize = isSearching ? pagination.pageSize : paginationMeta.limit;
  const isLoading = isSearching
    ? allStudentsQuery.isLoading
    : serverQuery.isLoading;
  const isError = isSearching ? allStudentsQuery.isError : serverQuery.isError;
  const error = isSearching ? allStudentsQuery.error : serverQuery.error;
  const refetch = () =>
    isSearching ? allStudentsQuery.refetch() : serverQuery.refetch();


  const create = async (data: Omit<IStudent, '_id'> | FormData) => {

    let body: FormData;

    if (data instanceof FormData) {
      body = data;
    } else {
      body = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          if (key === 'profileImage' && isFile(value)) {
            body.append(key, value);
          } else {
            body.append(key, String(value));
          }
        }
      }
    }


    const result = await post({ url: '/student', body });
    queryClient.invalidateQueries({ queryKey: ['/student'] });
    return result;
  };


  const update = async (id: string, data: Partial<IStudent> | FormData) => {

    let body: FormData;

    if (data instanceof FormData) {
      body = data;
    } else {
      body = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          if (key === 'profileImage' && isFile(value)) {
            body.append(key, value);
          } else {
            body.append(key, String(value));
          }
        }
      }
    }


    const result = await put({ url: `/student/${id}`, body });
    queryClient.invalidateQueries({ queryKey: ['/student'] });
    return result;
  };

  const batchCreate = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const result = await post({
      url: '/student/batch',
      body: formData,
      toast: false,
    });

    queryClient.invalidateQueries({ queryKey: ['/student'] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/student/${id}` });
    queryClient.invalidateQueries({ queryKey: ['/student'] });
    return result;
  };

  const removeMany = (ids: string[]) =>
    settleMutations(
      ids.map(async (id) => {
        const result = await del({ url: `/student/${id}`, toast: false });
        queryClient.invalidateQueries({ queryKey: ['/student'] });
        return result;
      }),
    );

  return {
    // Data
    students,
    total,
    currentPage,
    pageSize,

    // Loading & Error
    isLoading,
    isError,
    fetchError: error as any,

    // Actions
    refetch,
    create,
    batchCreate,
    update,
    remove,
    removeMany,

    // Mutation loading states
    isCreating: postMutation.isPending,
    isBatchCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};