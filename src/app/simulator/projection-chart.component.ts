import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MonthlyProjection } from '../core/models/simulator.model';

@Component({
  selector: 'app-projection-chart',
  standalone: true,
  template: `
    <div class="chart-legend">
      <div class="legend-item">
        <div class="legend-dot gray"></div>
        <span>Sin pago extra</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot green"></div>
        <span>Con pago extra</span>
      </div>
    </div>
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-legend { display: flex; gap: 16px; margin-bottom: 12px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #8a969c; }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
    .legend-dot.gray { background: #5a666c; }
    .legend-dot.green { background: #1db954; }
    .chart-container { width: 100%; height: 220px; position: relative; }
    canvas { width: 100% !important; height: 100% !important; }
  `],
})
export class ProjectionChartComponent implements OnChanges, AfterViewInit {
  @Input() projection: MonthlyProjection[] = [];
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void { this.renderChart(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projection'] && this.canvasRef) this.renderChart();
  }

  private renderChart(): void {
    if (!this.canvasRef || !this.projection || this.projection.length === 0) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 35, left: 55 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxBalance = Math.max(
      this.projection[0]?.balanceWithout || 0,
      this.projection[0]?.balanceWith || 0
    );

    ctx.clearRect(0, 0, width, height);

    // Grid
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.strokeStyle = '#2a3338';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const value = maxBalance - (maxBalance / gridLines) * i;
      ctx.fillStyle = '#5a666c';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(this.formatCurrency(value), padding.left - 8, y + 4);
    }

    this.drawLine(ctx, 'balanceWithout', '#5a666c', maxBalance, chartWidth, chartHeight, padding);
    this.drawLine(ctx, 'balanceWith', '#1db954', maxBalance, chartWidth, chartHeight, padding);
    this.drawZeroMarker(ctx, 'balanceWith', '#1db954', chartWidth, chartHeight, padding);
  }

  private drawLine(
    ctx: CanvasRenderingContext2D, field: 'balanceWithout' | 'balanceWith',
    color: string, maxBalance: number, chartWidth: number, chartHeight: number, padding: any
  ): void {
    const data = this.projection;

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    if (field === 'balanceWith') {
      gradient.addColorStop(0, 'rgba(29, 185, 84, 0.15)');
      gradient.addColorStop(1, 'rgba(29, 185, 84, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(90, 102, 108, 0.08)');
      gradient.addColorStop(1, 'rgba(90, 102, 108, 0)');
    }

    ctx.beginPath();
    let firstPoint = true;
    for (let i = 0; i < data.length; i++) {
      const x = padding.left + (chartWidth / Math.max(data.length - 1, 1)) * i;
      const balance = Math.max(0, data[i][field]);
      const y = padding.top + chartHeight - (balance / maxBalance) * chartHeight;
      if (firstPoint) { ctx.moveTo(x, y); firstPoint = false; }
      else { ctx.lineTo(x, y); }
    }
    const lastX = padding.left + chartWidth;
    ctx.lineTo(lastX, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    firstPoint = true;
    for (let i = 0; i < data.length; i++) {
      const x = padding.left + (chartWidth / Math.max(data.length - 1, 1)) * i;
      const balance = Math.max(0, data[i][field]);
      const y = padding.top + chartHeight - (balance / maxBalance) * chartHeight;
      if (firstPoint) { ctx.moveTo(x, y); firstPoint = false; }
      else { ctx.lineTo(x, y); }
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  private drawZeroMarker(
    ctx: CanvasRenderingContext2D, field: 'balanceWithout' | 'balanceWith',
    color: string, chartWidth: number, chartHeight: number, padding: any
  ): void {
    const data = this.projection;
    for (let i = 0; i < data.length; i++) {
      if (data[i][field] <= 0) {
        const x = padding.left + (chartWidth / Math.max(data.length - 1, 1)) * i;
        const y = padding.top + chartHeight;
        ctx.shadowColor = 'rgba(29, 185, 84, 0.5)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓', x, y + 3);
        ctx.fillStyle = '#1db954';
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.fillText(`Mes ${i + 1}`, x, y + 18);
        break;
      }
    }
  }

  private formatCurrency(value: number): string {
    if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
    return '$' + value.toFixed(0);
  }
}