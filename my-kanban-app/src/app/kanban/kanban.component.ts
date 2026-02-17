import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService, Lead } from '../services/crm.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs'; // Import subscription and interval
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog'; // Import confirm dialog
import { LeadDialogComponent } from '../lead-dialog/lead-dialog';

interface Column {
    title: string;
    id: string; // This should match Odoo stage names or mapped IDs if possible
    items: Lead[];
    totalRevenue: number;
}

@Component({
    selector: 'app-kanban',
    standalone: true,
    imports: [
        CommonModule,
        DragDropModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatInputModule
    ],
    templateUrl: './kanban.component.html',
    styleUrl: './kanban.component.css'
})
export class KanbanComponent implements OnInit, OnDestroy {

    // Search control
    searchControl = new FormControl('');

    // All original leads
    allLeads: Lead[] = [];

    // Map to store stage names and their IDs found in data
    stageMap = new Map<string, number>();

    // Columns
    columns: Column[] = [
        { title: 'New', id: 'New', items: [], totalRevenue: 0 },
        { title: 'Qualified', id: 'Qualified', items: [], totalRevenue: 0 },
        { title: 'Proposition', id: 'Proposition', items: [], totalRevenue: 0 },
        { title: 'Won', id: 'Won', items: [], totalRevenue: 0 },
    ];

    // Polling Subscription
    private pollingSubscription: Subscription | undefined;
    // State flags
    isSyncing = false;
    isLoading = true;
    isDragging = false; // New flag to pause polling

    constructor(
        private crmService: CrmService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        console.log('CRM Express KanbanComponent v2.1 loaded');
        this.refreshData();

        // Reactive search
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(searchTerm => {
            this.filterLeads(searchTerm || '');
        });

        // Start Polling every 20 seconds
        this.pollingSubscription = interval(20000).subscribe(() => {
            // Pause polling if user is currently dragging an item
            if (!this.isDragging) {
                this.refreshData(true);
            }
        });
    }

    ngOnDestroy() {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
        }
    }

    refreshData(isPolling = false) {
        // Use setTimeout to avoid NG0100 if called during change detection
        setTimeout(() => {
            if (isPolling) {
                this.isSyncing = true;
            } else {
                this.isLoading = true;
            }
            this.cdr.detectChanges();
        }, 0);

        this.crmService.getLeads().subscribe({
            next: (data) => {
                this.allLeads = data;
                this.processStages(data);
                this.filterLeads(this.searchControl.value || '');

                setTimeout(() => {
                    if (isPolling) {
                        setTimeout(() => {
                            this.isSyncing = false;
                            this.cdr.detectChanges();
                        }, 1000); // Show "Syncing" for at least 1s
                    } else {
                        this.isLoading = false;
                        this.cdr.detectChanges();
                    }
                }, 0);
            },
            error: (err) => {
                if (!isPolling) this.showNotification('Error fetching data from Odoo', 'error');
                this.isSyncing = false;
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    processStages(leads: Lead[]) {
        console.log('===== processStages DEBUG =====');
        console.log('Processing', leads.length, 'leads');

        leads.forEach(lead => {
            if (Array.isArray(lead.stage_id) && lead.stage_id.length >= 2) {
                const id = lead.stage_id[0];
                const name = lead.stage_id[1];
                this.stageMap.set(name, id);

                // Normalizing local data for easier use
                lead.stage_id = id;
                lead.stage = name;
            } else if (typeof lead.stage_id === 'number') {
                // Try to map back if we know the name? Or assume title matches.
                // We can't easily map ID -> Name without master data. 
                // But we can map Name -> ID if we trust the current stage name.
                this.stageMap.set(lead.stage, lead.stage_id);
            }
        });

        console.log('Stage map built:', Array.from(this.stageMap.entries()));
        console.log('Sample lead after processing:', leads[0]);
        console.log('===== END processStages =====');
    }

    filterLeads(searchTerm: string) {
        console.log('===== filterLeads DEBUG =====');
        console.log('Search term:', searchTerm);
        console.log('Total leads to distribute:', this.allLeads.length);

        const term = searchTerm.toLowerCase();

        // preserve current scroll or focus? Angular handles elements well if tracked by ID.
        // We are rebuilding arrays, but CDK Drag Drop might lose state if dragging happens EXACTLY during update.
        // Risk is low for 30s interval.

        // Clear columns but keep reference
        this.columns.forEach(col => {
            col.items = [];
            col.totalRevenue = 0;
        });

        // Distribute and filter
        this.allLeads.forEach(lead => {
            if (lead.name.toLowerCase().includes(term)) {
                const column = this.columns.find(col => col.title === lead.stage);
                if (column) {
                    column.items.push(lead);
                    column.totalRevenue += lead.expected_revenue;
                } else {
                    console.warn('No column found for stage:', lead.stage, 'Available columns:', this.columns.map(c => c.title));
                }
            }
        });

        // Log column distribution
        this.columns.forEach(col => {
            console.log(`Column "${col.title}": ${col.items.length} items, revenue: $${col.totalRevenue}`);
        });
        console.log('===== END filterLeads =====');
    }

    public dragStarted = () => {
        console.log('Drag started, polling paused');
        this.isDragging = true;
    }

    public dragEnded = () => {
        console.log('Drag ended, polling resumed');
        this.isDragging = false;
    }

    drop(event: CdkDragDrop<Lead[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            const item = event.previousContainer.data[event.previousIndex];
            const previousStageName = event.previousContainer.id;
            const newStageName = event.container.id;

            // Business Rule: Confirm if moving from "Won" to other stages
            if (previousStageName === 'Won' && newStageName !== 'Won') {
                const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                    width: '400px',
                    data: {
                        message: '¿Deseas reabrir este negocio ganado?',
                        confirmText: 'Reabrir Oportunidad',
                        cancelText: 'Cancelar',
                        confirmColor: 'primary' as const
                    }
                });

                dialogRef.afterClosed().subscribe(confirmed => {
                    if (confirmed) {
                        // User confirmed - proceed with the move
                        this.performDrop(event, item, newStageName);
                    }
                    // If not confirmed, do nothing - card stays in original position
                });
                return;
            }

            // For all other moves, proceed directly
            this.performDrop(event, item, newStageName);
        }
    }

    private performDrop(event: CdkDragDrop<Lead[]>, item: Lead, newStageName: string) {
        // Resolve stage ID first
        let targetStageId = this.stageMap.get(newStageName);
        if (!targetStageId) {
            const fallbackMap: { [key: string]: number } = {
                'New': 1, 'Qualified': 2, 'Proposition': 3, 'Won': 4
            };
            targetStageId = fallbackMap[newStageName];
        }

        if (!targetStageId) {
            this.showNotification(`No se pudo identificar la etapa ${newStageName}`, 'error');
            return;
        }

        // SERVER-FIRST: Update Odoo, then move card on success only
        // Include type: 'opportunity' to ensure Odoo accepts the update
        this.crmService.updateLead(item.id, {
            stage_id: targetStageId,
            type: 'opportunity'
        }).subscribe({
            next: () => {
                // Wrap in setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    // Update successful - now move the card in UI
                    transferArrayItem(
                        event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex,
                    );

                    // Update item properties
                    item.stage = newStageName;
                    item.stage_id = targetStageId!;

                    // Recalculate totals
                    this.updateColumnTotals();

                    // Manually trigger change detection
                    this.cdr.detectChanges();
                }, 0);
            },
            error: (err) => {
                // Check for 404 errors specifically
                if (err.status === 404) {
                    this.showNotification('Error 404: La ruta de actualización no existe. Revisa la configuración del endpoint.', 'error');
                    console.error('Error 404: Endpoint not found');
                    console.error('Attempted URL:', `api/oportunidades/${item.id}/`);
                    console.error('Full error:', err);
                } else {
                    // Show detailed error message for other errors
                    const errorMsg = err?.error?.message || err?.message || 'Error desconocido';
                    this.showNotification(`Error de sincronización: ${errorMsg}`, 'error');
                }
                console.error('Odoo update failed:', err);
                console.error('Attempted update:', { id: item.id, stage_id: targetStageId, type: 'opportunity' });
                // Card never moved, so no rollback needed
            }
        });
    }

    updateColumnTotals() {
        this.columns.forEach(col => {
            col.totalRevenue = col.items.reduce((sum, item) => sum + item.expected_revenue, 0);
        });
    }

    openDialog(lead?: Lead) {
        const dialogRef = this.dialog.open(LeadDialogComponent, {
            width: '400px',
            data: lead || {},
            panelClass: 'custom-dialog-container'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (lead) {
                    this.crmService.updateLead(lead.id, result).subscribe({
                        next: () => {
                            this.showNotification('Lead actualizado', 'success');
                            this.refreshData(); // Refresh to ensure backend consistency
                        },
                        error: () => this.showNotification('Error updating lead', 'error')
                    });
                } else {
                    this.crmService.createLead(result).subscribe({
                        next: () => {
                            this.showNotification('Creación exitosa', 'success');
                            this.refreshData();
                        },
                        error: () => this.showNotification('Error creating lead', 'error')
                    });
                }
            }
        });
    }

    deleteLead(id: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                message: '¿Eliminar este lead permanentemente?',
                confirmText: 'Eliminar',
                cancelText: 'Cancelar',
                confirmColor: 'warn' as const
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.crmService.deleteLead(id).subscribe({
                    next: () => {
                        this.showNotification('Lead eliminado correctamente', 'success');
                        this.refreshData();
                    },
                    error: () => this.showNotification('Error deleting lead', 'error')
                });
            }
        });
    }

    showNotification(message: string, type: 'success' | 'error') {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
        });
    }

    isOld(dateStr: string): boolean {
        if (!dateStr) return false;
        const createDate = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 5;
    }

    get connectedLists() {
        return this.columns.map(c => c.id);
    }
}
