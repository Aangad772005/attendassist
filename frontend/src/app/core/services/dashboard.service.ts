import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SubjectStats {
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  cancelledClasses: number;
  percentage: number | null;
  status: 'safe' | 'warning' | 'critical' | 'danger' | 'no_data';
  safeAbsences: number;
  classesNeededToReachRequired: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  requiredAttendance: number;
  semesterTag?: string;
  isArchived: boolean;
  totalClasses: number;
  attendedClasses: number;
  stats: SubjectStats;
}

export interface DashboardData {
  aiInsight: {
    insight: string;
    generatedAt: string | null;
    cached: boolean;
  };
  overallStats: {
    overallPercentage: number | null;
    overallStatus: 'safe' | 'warning' | 'critical' | 'danger' | 'no_data';
    totalClasses: number;
    totalAttended: number;
    totalAbsent: number;
    totalCancelled: number;
    subjectCount: number;
    activeSubjectCount: number;
  };
  subjects: Subject[];
  weeklyTrend?: any[];
  recentActivity?: any[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private http = inject(HttpClient);

  getDashboard(): Observable<{ success: boolean; data: DashboardData }> {
    return this.http.get<{ success: boolean; data: DashboardData }>('/api/v1/dashboard');
  }

  regenerateAiInsight(): Observable<any> {
    return this.http.post<any>('/api/v1/ai/regenerate', {});
  }

  markAttendance(data: any): Observable<any> {
    return this.http.post<any>('/api/v1/attendance', data);
  }
}
