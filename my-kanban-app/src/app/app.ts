import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { KanbanComponent } from './kanban/kanban.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    KanbanComponent,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatDialogModule
  ],
  template: '<app-kanban></app-kanban>',
})
export class AppComponent { }
