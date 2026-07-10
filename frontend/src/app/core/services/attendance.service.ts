import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from './dashboard.service';

export interface RecentActivity {
  id: string;
  subjectId?: any;
  subject?: {
    id: string;
    name: string;
    code: string;
    color: string;
  };
  date: string;
  status: 'present' | 'absent' | 'cancelled';
  note?: string;
}

export interface HistoryFilters {
  subjectId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface HistoryResponse {
  success: boolean;
  data: RecentActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceApiService {
  private http = inject(HttpClient);

  getHistory(filters: HistoryFilters = {}, pagination: PaginationParams = {}): Observable<HistoryResponse> {
    let params = new HttpParams();

    // Map filters
    if (filters.subjectId) params = params.set('subjectId', filters.subjectId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);

    // Map pagination
    if (pagination.page) params = params.set('page', pagination.page.toString());
    if (pagination.limit) params = params.set('limit', pagination.limit.toString());

    return this.http.get<HistoryResponse>('/api/v1/attendance', { params });
  }

  logAttendance(data: {
    subjectId: string;
    date: string;
    status: 'present' | 'absent' | 'cancelled';
    note?: string;
  }): Observable<{ success: boolean; data: RecentActivity }> {
    return this.http.post<{ success: boolean; data: RecentActivity }>('/api/v1/attendance', data);
  }

  updateLog(
    recordId: string,
    data: {
      status?: 'present' | 'absent' | 'cancelled';
      note?: string;
    }
  ): Observable<{ success: boolean; data: RecentActivity }> {
    return this.http.patch<{ success: boolean; data: RecentActivity }>(`/api/v1/attendance/${recordId}`, data);
  }

  deleteLog(recordId: string): Observable<any> {
    return this.http.delete<any>(`/api/v1/attendance/${recordId}`);
  }
}
