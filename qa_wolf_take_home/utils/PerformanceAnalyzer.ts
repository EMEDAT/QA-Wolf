import { Page, CDPSession } from 'playwright';

// Define interfaces for performance metrics and analysis results
export interface PerformanceMetrics {
  firstContentfulPaint: number | null;
  timeToInteractive: number | null;
  domContentLoaded: number | null;
  loadTime: number | null;
}

interface Config {
  performanceThresholds: Record<keyof PerformanceMetrics, number>;
}

interface PerformanceMetric {
  name: string;
  value: number;
}

interface PerformanceAnalysisResult {
  metrics: PerformanceMetrics;
  results: Record<keyof PerformanceMetrics, boolean>;
  allPassed: boolean;
}

export class PerformanceAnalyzer {
  private readonly page: Page;
  private readonly thresholds: Config['performanceThresholds'];

  constructor(page: Page, config: Config) {
    this.page = page;
    this.thresholds = config.performanceThresholds;
  }

  // Capture performance metrics using Chrome DevTools Protocol
  async captureMetrics(): Promise<PerformanceMetrics> {
    try {
      const client = await this.page.context().newCDPSession(this.page);
      await client.send('Performance.enable');
      const result = await client.send('Performance.getMetrics');
      const metrics = result.metrics as PerformanceMetric[];

      return this.extractPerformanceMetrics(metrics);
    } catch (error) {
      this.handleError('capturing performance metrics', error);
    }
  }

  // Extract relevant metrics from the raw performance data
  private extractPerformanceMetrics(metrics: PerformanceMetric[]): PerformanceMetrics {
    return {
      firstContentfulPaint: this.getMetricValue(metrics, 'FirstContentfulPaint'),
      timeToInteractive: this.getMetricValue(metrics, 'InteractiveTime'),
      domContentLoaded: this.getMetricValue(metrics, 'DomContentLoaded'),
      loadTime: this.getMetricValue(metrics, 'LoadTime')
    };
  }

  // Helper method to get a specific metric value
  private getMetricValue(metrics: PerformanceMetric[], name: string): number | null {
    const metric = metrics.find(m => m.name === name);
    return metric ? metric.value : null;
  }

  // Analyze performance by capturing metrics and comparing with thresholds
  async analyzePerformance(): Promise<PerformanceAnalysisResult> {
    const metrics = await this.captureMetrics();
    return this.compareWithThresholds(metrics);
  }

  // Compare captured metrics with defined thresholds
  private compareWithThresholds(metrics: PerformanceMetrics): PerformanceAnalysisResult {
    const results: Partial<Record<keyof PerformanceMetrics, boolean>> = {};
    let allPassed = true;

    for (const [key, value] of Object.entries(metrics) as [keyof PerformanceMetrics, number | null][]) {
      if (value !== null) {
        const passed = value <= this.thresholds[key];
        results[key] = passed;
        allPassed = allPassed && passed;
      }
    }

    return {
      metrics,
      results: results as Record<keyof PerformanceMetrics, boolean>,
      allPassed
    };
  }

  // Error handling method
  private handleError(operation: string, error: unknown): never {
    console.error(`Error ${operation}:`, error);
    throw new Error(`Failed to ${operation}`);
  }
}