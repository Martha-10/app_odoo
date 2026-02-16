import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Oportunidad {
  id: number;
  name: string;
  expected_revenue: number;
  stage: string;
  stage_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class OportunidadesService {

  private apiUrl = 'http://127.0.0.1:8000/api/oportunidades/';

  constructor(private http: HttpClient) { }

  getOportunidades(): Observable<Oportunidad[]> {
    return this.http.get<Oportunidad[]>(this.apiUrl);
  }
  createOportunidad(oportunidad: Omit<Oportunidad, 'id'>): Observable<Oportunidad> {
    return this.http.post<Oportunidad>(this.apiUrl, oportunidad);
  }

  updateOportunidad(id: number, changes: Partial<Oportunidad>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/`, changes);
  }

  deleteOportunidad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }
}
