import { Page, CDPSession } from 'playwright';

export interface PerformanceMetrics {
  firstContentfulPaint: number | null;
  timeToInteractive: number | null;
  domContentLoaded: number | null;
  loadTime: number | null;
}

interface Config {
  performanceThresholds: { [key: string]: number };
}

interface PerformanceMetric {
  name: string;
  value: number;
}

export class PerformanceAnalyzer {
  private page: Page;
  private thresholds: { [key: string]: number };

  constructor(page: Page, config: Config) {
    this.page = page;
    this.thresholds = config.performanceThresholds;
  }

  async captureMetrics(): Promise<PerformanceMetrics> {
    try {
      const client: CDPSession = await this.page.context().newCDPSession(this.page);
      await client.send('Performance.enable');
      const result = await client.send('Performance.getMetrics');
      const metrics: PerformanceMetric[] = result.metrics;

      return this.extractPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error capturing performance metrics:', error);
      throw new Error('Failed to capture performance metrics');
    }
  }

  private extractPerformanceMetrics(metrics: PerformanceMetric[]): PerformanceMetrics {
    return {
      firstContentfulPaint: this.getMetricValue(metrics, 'FirstContentfulPaint'),
      timeToInteractive: this.getMetricValue(metrics, 'InteractiveTime'),
      domContentLoaded: this.getMetricValue(metrics, 'DomContentLoaded'),
      loadTime: this.getMetricValue(metrics, 'LoadTime')
    };
  }

  private getMetricValue(metrics: PerformanceMetric[], name: string): number | null {
    const metric = metrics.find(m => m.name === name);
    return metric ? metric.value : null;
  }
}