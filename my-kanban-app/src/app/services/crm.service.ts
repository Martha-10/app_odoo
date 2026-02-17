import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Lead {
    id: number;
    name: string;
    expected_revenue: number;
    stage: string;
    stage_id: number | any[];
    create_date: string;
    type?: string; // Add type field
}

@Injectable({
    providedIn: 'root'
})
export class CrmService {

    private apiUrl = 'http://127.0.0.1:8000/api';

    constructor(private http: HttpClient) { }

    getLeads(): Observable<Lead[]> {
        return this.http.get<Lead[]>(`${this.apiUrl}/oportunidades/`).pipe(
            map(leads => {
                // DEBUG: Log raw data from Odoo
                console.log('===== DEBUG: Raw data from Odoo =====');
                console.log('Total records received:', leads.length);
                console.log('First record sample:', leads[0]);
                console.log('All records:', leads);

                // Check type field distribution
                const typeDistribution = leads.reduce((acc, lead) => {
                    const typeValue = lead.type || 'undefined';
                    acc[typeValue] = (acc[typeValue] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                console.log('Type field distribution:', typeDistribution);

                // LENIENT FILTER: Show records without type field OR with type='opportunity'
                const filtered = leads.filter(lead => !lead.type || lead.type === 'opportunity');
                console.log('After filtering:', filtered.length, 'records');
                console.log('===== END DEBUG =====');

                return filtered;
            })
        );
    }

    createLead(lead: Omit<Lead, 'id' | 'create_date'>): Observable<Lead> {
        // Ensure new leads are created as opportunities
        const opportunityLead = { ...lead, type: 'opportunity' };
        return this.http.post<Lead>(`${this.apiUrl}/oportunidades/`, opportunityLead);
    }

    updateLead(id: number, changes: Partial<Lead>): Observable<any> {
        if (!id) {
            console.error('updateLead called with invalid ID:', id);
            throw new Error('ID de lead no válido');
        }
        return this.http.patch(`${this.apiUrl}/oportunidades/${id}/`, changes);
    }

    deleteLead(id: number): Observable<any> {
        if (!id) {
            console.error('deleteLead called with invalid ID:', id);
            throw new Error('ID de lead no válido');
        }
        // Correct URL structure as per user request: /api/oportunidades/ID/
        return this.http.delete(`${this.apiUrl}/oportunidades/${id}/`);
    }
}
