import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from './dashboard.service';

export interface TrendDayResult {
  date: string;
  present: number;
  absent: number;
  cancelled: number;
  total: number;
  percentage: number | null;
}

export interface DistributionResult {
  presentCount: number;
  absentCount: number;
  cancelledCount: number;
  totalCount: number;
  presentPercentage: number;
  absentPercentage: number;
}

export interface RankingResult {
  id: string;
  name: string;
  code: string;
  color: string;
  percentage: number;
  status: string;
  safeAbsences: number;
  classesNeeded: number;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsApiService {
  private http = inject(HttpClient);

  getSubjectOverview(): Observable<{ success: boolean; data: Subject[] }> {
    return this.http.get<{ success: boolean; data: Subject[] }>('/api/v1/analytics/subjects');
  }

  getTrend(filters: { rangeDays?: number } = {}): Observable<{ success: boolean; data: TrendDayResult[] }> {
    let params = new HttpParams();
    if (filters.rangeDays) {
      params = params.set('rangeDays', filters.rangeDays.toString());
    }
    return this.http.get<{ success: boolean; data: TrendDayResult[] }>('/api/v1/analytics/trend', { params });
  }

  getDistribution(): Observable<{ success: boolean; data: DistributionResult }> {
    return this.http.get<{ success: boolean; data: DistributionResult }>('/api/v1/analytics/distribution');
  }

  getSubjectRanking(): Observable<{ success: boolean; data: RankingResult[] }> {
    return this.http.get<{ success: boolean; data: RankingResult[] }>('/api/v1/analytics/ranking');
  }
}
