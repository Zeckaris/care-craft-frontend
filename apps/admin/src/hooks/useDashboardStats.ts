import { useApi } from '@/hooks/useApi';

export interface EnrollmentTrendItem {
  grade: string;
  '2023'?: number;
  '2024'?: number;
  '2025'?: number;
  [key: string]: string | number | undefined;
}

/* ---------- UI Activity ---------- */
export interface Activity {
  id: string;
  message: string;        
  timestamp: Date;
  actionInitial: string; 
}

/* ---------- Shape the backend actually returns ---------- */
interface BackendActivity {
  id: string;
  action: string;        
  entity: string;       
  user: string;
  timestamp: string;
}

/* ---------- Full dashboard response ---------- */
export interface DashboardStats {
  summary: {
    totalStudents: number;
    totalTeachers: number;
  };
  genderBreakdown: Array<{ name: 'M' | 'F'; value: number }>;
  enrollmentTrend: EnrollmentTrendItem[];
  recentActivities: BackendActivity[];
}

/* ---------- Hook ---------- */
export const useDashboardStats = () => {
  const { get } = useApi();

  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get('/dashboard/stats', {
    queryKey: ['/dashboard/stats'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats: DashboardStats | null = raw?.success
    ? (raw.data as DashboardStats)
    : null;

  const totalStudents = stats?.summary.totalStudents ?? 0;
  const totalTeachers = stats?.summary.totalTeachers ?? 0;
  const genderBreakdown = stats?.genderBreakdown ?? [];
  const enrollmentTrend = stats?.enrollmentTrend ?? [];

  const totalInGenderChart = genderBreakdown.reduce(
    (sum, g) => sum + g.value,
    0
  );

  /* ---------- Build UI-ready activities ---------- */
  const recentActivities: Activity[] = (stats?.recentActivities ?? []).map(
    (a) => {
      /* 1. Fix broken spacing */
      let entity = (a.entity ?? '').replace(/([a-z])([A-Z])/g, '$1 $2');
      const words = entity.trim().split(/\s+/);
      if (!words.length) words.push('Unknown');

      /* 2. Extract entity type & verb from action */
      const [type, verbKey] = a.action.split('_');               // e.g. ["student","create"]
      const entityType = type;                                   // "student"
      const verbMap: Record<string, string> = {
        create: 'created',
        update: 'updated',
        delete: 'deleted',
        enroll: 'enrolled',
      };
      const verb = verbMap[verbKey] ?? verbKey;

      /* 3. Actor (first 1-2 words) */
      let actor = words[0];
      if (
        words.length > 1 &&
        !['created', 'updated', 'deleted', 'enrolled'].includes(words[1].toLowerCase())
      ) {
        actor = `${words[0]} ${words[1]}`;
      }

      /* 4. Target (everything after the verb) */
      const verbIdx = words.findIndex((w) =>
        ['created', 'updated', 'deleted', 'enrolled'].includes(w.toLowerCase())
      );
      let target = '';
      if (verbIdx >= 0 && verbIdx < words.length - 1) {
        actor = words.slice(0, verbIdx).join(' ');
        target = words.slice(verbIdx + 1).join(' ');
      } else {
        target = words.slice(actor.split(' ').length).join(' ');
      }

      /* 5. Final message with entity type */
      const message = `${actor} ${verb} ${entityType} ${target}`.trim();

      const actionInitial = verb.charAt(0).toUpperCase();

      return {
        id: a.id,
        message,
        timestamp: new Date(a.timestamp),
        actionInitial,
      };
    }
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
    fetchError: error as any,
    refetch,
  };
};