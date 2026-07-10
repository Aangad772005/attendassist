import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from './dashboard.service';

export interface SafeAbsencesResult {
  subjectId: string;
  name: string;
  requiredAttendance: number;
  currentPercentage: number | null;
  status: string;
  safeAbsences: number;
  consecutiveClassesNeeded: number;
}

export interface ProjectionResult {
  subjectId: string;
  name: string;
  requiredAttendance: number;
  currentPercentage: number | null;
  projectedPercentage: number;
  projectedStatus: string;
  willMeetRequirement: boolean;
  totalClassesAfterProjection: number;
  attendedClassesAfterProjection: number;
}

@Injectable({
  providedIn: 'root',
})
export class SubjectApiService {
  private http = inject(HttpClient);

  getSubjects(filters: { includeArchived?: boolean } = {}): Observable<{ success: boolean; data: Subject[] }> {
    let params = new HttpParams();
    if (filters.includeArchived !== undefined) {
      params = params.set('includeArchived', filters.includeArchived.toString());
    }
    return this.http.get<{ success: boolean; data: Subject[] }>('/api/v1/subjects', { params });
  }

  getSubjectById(subjectId: string): Observable<{ success: boolean; data: Subject }> {
    return this.http.get<{ success: boolean; data: Subject }>(`/api/v1/subjects/${subjectId}`);
  }

  createSubject(subjectData: {
    name: string;
    code?: string;
    color?: string;
    requiredAttendance?: number;
    semesterTag?: string;
  }): Observable<{ success: boolean; data: Subject }> {
    return this.http.post<{ success: boolean; data: Subject }>('/api/v1/subjects', subjectData);
  }

  updateSubject(
    subjectId: string,
    subjectData: {
      name?: string;
      code?: string;
      color?: string;
      requiredAttendance?: number;
      semesterTag?: string;
      totalClasses?: number;
      attendedClasses?: number;
    }
  ): Observable<{ success: boolean; data: Subject }> {
    return this.http.patch<{ success: boolean; data: Subject }>(`/api/v1/subjects/${subjectId}`, subjectData);
  }

  deleteSubject(subjectId: string): Observable<any> {
    return this.http.delete<any>(`/api/v1/subjects/${subjectId}`);
  }

  toggleArchive(subjectId: string): Observable<{ success: boolean; data: Subject }> {
    return this.http.patch<{ success: boolean; data: Subject }>(`/api/v1/subjects/${subjectId}/archive`, {});
  }

  quickMark(subjectId: string, attended: boolean): Observable<{ success: boolean; data: Subject }> {
    return this.http.post<{ success: boolean; data: Subject }>(`/api/v1/subjects/${subjectId}/quick-mark`, { attended });
  }

  // Calculator Endpoint calls
  getSafeAbsences(subjectId: string): Observable<{ success: boolean; data: SafeAbsencesResult }> {
    return this.http.get<{ success: boolean; data: SafeAbsencesResult }>(`/api/v1/calculator/safe-absences/${subjectId}`);
  }

  calculateProjection(
    subjectId: string,
    futureTotal: number,
    futurePlanned: number
  ): Observable<{ success: boolean; data: ProjectionResult }> {
    return this.http.post<{ success: boolean; data: ProjectionResult }>(`/api/v1/calculator/projection/${subjectId}`, {
      futureTotal,
      futurePlanned,
    });
  }

  // AI Advice Endpoint calls
  getCourseAdvice(subjectId: string): Observable<{ success: boolean; data: { advice: string } }> {
    return this.http.get<{ success: boolean; data: { advice: string } }>(`/api/v1/ai/advice/${subjectId}`);
  }
}
