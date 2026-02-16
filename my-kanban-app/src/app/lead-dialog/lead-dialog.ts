import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Lead } from '../services/crm.service';

@Component({
    selector: 'app-lead-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    styles: [`
    mat-form-field {
      width: 100%;
      margin-bottom: 0.5rem;
    }
  `],
    templateUrl: './lead-dialog.html',
})
export class LeadDialogComponent implements OnInit {
    form: FormGroup;
    title: string = 'New Lead';

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<LeadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Partial<Lead>
    ) {
        this.form = this.fb.group({
            name: [data.name || '', [Validators.required]],
            expected_revenue: [data.expected_revenue || 0, [Validators.required, Validators.min(0.01)]],
        });
    }

    ngOnInit() {
        if (this.data && this.data.id) {
            this.title = 'Edit Lead';
        }
    }

    get nameError(): string {
        const control = this.form.get('name');
        if (control?.hasError('required')) return 'El nombre del Lead es obligatorio';
        return '';
    }

    get revenueError(): string {
        const control = this.form.get('expected_revenue');
        if (control?.hasError('min')) return 'El monto debe ser mayor a 0';
        if (control?.hasError('required')) return 'El monto es obligatorio';
        return '';
    }

    onSave() {
        if (this.form.valid) {
            this.dialogRef.close(this.form.value);
        } else {
            this.form.markAllAsTouched();
        }
    }

    onCancel() {
        this.dialogRef.close();
    }
}
