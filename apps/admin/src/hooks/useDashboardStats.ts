import { useApi } from '@/hooks/useApi';

export interface EnrollmentTrendGrade {
  grade: string;
  gradeLevel: number | null;
  counts: number[];
}

export interface EnrollmentTrend {
  years: string[];
  grades: EnrollmentTrendGrade[];
}

export interface DashboardRecentActivity {
  id: string;
  type: string;
  message: string;
  actorName: string;
  actorRole: 'admin' | 'coordinator';
  createdAt: string;
}

/* ---------- Full dashboard response ---------- */
export interface DashboardStats {
  summary: {
    totalStudents: number;
    totalTeachers: number;
  };
  genderBreakdown: Array<{ name: 'M' | 'F'; value: number }>;
  enrollmentTrend: EnrollmentTrend;
  recentActivities: DashboardRecentActivity[];
}

/* ---------- Hook ---------- */
export const useDashboardStats = ({ enabled = true } = {}) => {
  const { get } = useApi();

  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get('/dashboard/stats', {
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const stats: DashboardStats | null = raw?.success
    ? (raw.data as DashboardStats)
    : null;

  const totalStudents = stats?.summary.totalStudents ?? 0;
  const totalTeachers = stats?.summary.totalTeachers ?? 0;
  const genderBreakdown = stats?.genderBreakdown ?? [];
  const enrollmentTrend = stats?.enrollmentTrend ?? null;
  const recentActivities = stats?.recentActivities ?? [];

  const totalInGenderChart = genderBreakdown.reduce(
    (sum, g) => sum + g.value,
    0
  );

  return {
    stats,
    totalStudents,
    totalTeachers,
    genderBreakdown,
    enrollmentTrend,
    totalInGenderChart,
    recentActivities,
    isLoading,
    isError,
    fetchError: error,
    refetch,
  };
};
