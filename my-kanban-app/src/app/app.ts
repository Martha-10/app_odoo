import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OportunidadesService, Oportunidad } from './services/oportunidades';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],   // 👈 MUY IMPORTANTE
  templateUrl: './app.html',
})
export class AppComponent implements OnInit {

  oportunidades: Oportunidad[] = [];

  constructor(private oportunidadesService: OportunidadesService) {}

  ngOnInit() {
    this.oportunidadesService.getOportunidades().subscribe(data => {
      this.oportunidades = data;
      console.log(data);
    });
  }
}
