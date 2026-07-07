import {
  Component, Input, OnChanges, SimpleChanges,
  ViewChild, ElementRef, AfterViewInit, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Modelo inline para no depender del path relativo problemático
export interface MonthlyProjection {
  month:          number;
  label:          string;
  balanceWithout: number;
  balanceWith:    number;
}

@Component({
  selector: 'app-projection-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position:relative;height:180px;width:100%">
      <canvas #canvas role="img" [attr.aria-label]="ariaLabel"></canvas>
    </div>
    <div class="legend">
      <span><span class="dot red"></span>Sin pago extra</span>
      <span><span class="dot teal"></span>Con pago extra</span>
    </div>
  `,
  styles: [`
    .legend { display:flex; gap:16px; margin-top:8px; font-size:11px; color:#6b7280; }
    .dot    { display:inline-block; width:10px; height:10px; border-radius:2px; margin-right:4px; }
    .dot.red  { background:#A32D2D; }
    .dot.teal { background:#1D9E75; }
  `],
})
export class ProjectionChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() projection: MonthlyProjection[] = [];
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: any;
  private ChartLib: any;

  get ariaLabel(): string {
    return `Proyección de deuda en ${this.projection.length} meses`;
  }

  async ngAfterViewInit(): Promise<void> {
    // Importación dinámica de Chart.js para evitar errores de build
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);
    this.ChartLib = Chart;
    this.build();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projection'] && this.chart) this.update();
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  private build(): void {
    if (!this.ChartLib || !this.canvasRef) return;
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.chart = new this.ChartLib(ctx, {
      type: 'bar',
      data: this.data(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 0 } },
          y: { display: false },
        },
      },
    });
  }

  private data() {
    return {
      labels: this.projection.map(p => p.label),
      datasets: [
        { label: 'Sin extra', data: this.projection.map(p => p.balanceWithout), backgroundColor: '#A32D2D', borderRadius: 4, borderSkipped: false },
        { label: 'Con extra', data: this.projection.map(p => p.balanceWith),    backgroundColor: '#1D9E75', borderRadius: 4, borderSkipped: false },
      ],
    };
  }

  private update(): void {
    if (!this.chart) return;
    const d = this.data();
    this.chart.data.labels           = d.labels;
    this.chart.data.datasets[0].data = d.datasets[0].data;
    this.chart.data.datasets[1].data = d.datasets[1].data;
    this.chart.update('active');
  }
}
