// Import necessary types from Playwright
import { Page, CDPSession } from 'playwright';

// Define interfaces for performance metrics and analysis results
export interface PerformanceMetrics {
  firstContentfulPaint: number | null;  // Time to first contentful paint
  timeToInteractive: number | null;     // Time to interactive
  domContentLoaded: number | null;      // DOM content loaded time
  loadTime: number | null;              // Page load time
}

interface Config {
  performanceThresholds: Record<keyof PerformanceMetrics, number>;  // Thresholds for each metric
}

interface PerformanceMetric {
  name: string;   // Name of the metric
  value: number;  // Value of the metric
}

interface PerformanceAnalysisResult {
  metrics: PerformanceMetrics;  // Captured performance metrics
  results: Record<keyof PerformanceMetrics, boolean>;  // Whether each metric passed its threshold
  allPassed: boolean;  // Whether all metrics passed their thresholds
}

export class PerformanceAnalyzer {
  private readonly page: Page;  // Playwright Page object
  private readonly thresholds: Config['performanceThresholds'];  // Performance thresholds

  constructor(page: Page, config: Config) {
    this.page = page;
    this.thresholds = config.performanceThresholds;
  }

  // Capture performance metrics using Chrome DevTools Protocol
  async captureMetrics(): Promise<PerformanceMetrics> {
    try {
      // Arrange: Create a new CDP session
      const client = await this.page.context().newCDPSession(this.page);
      
      // Act: Enable the Performance API
      await client.send('Performance.enable');
      
      // Act: Get the performance metrics
      const result = await client.send('Performance.getMetrics');
      const metrics = result.metrics as PerformanceMetric[];

      // Assert: Extract and return the relevant performance metrics
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
    // Arrange & Act: Capture performance metrics
    const metrics = await this.captureMetrics();
    
    // Assert: Compare captured metrics with defined thresholds
    return this.compareWithThresholds(metrics);
  }

  // Compare captured metrics with defined thresholds
  private compareWithThresholds(metrics: PerformanceMetrics): PerformanceAnalysisResult {
    const results: Partial<Record<keyof PerformanceMetrics, boolean>> = {};
    let allPassed = true;

    // Act & Assert: Iterate through each metric and compare with its threshold
    for (const [key, value] of Object.entries(metrics) as [keyof PerformanceMetrics, number | null][]) {
      if (value !== null) {
        const passed = value <= this.thresholds[key];
        results[key] = passed;
        allPassed = allPassed && passed;  // Update allPassed flag
      }
    }

    // Assert: Return the performance analysis result
    return {
      metrics,
      results: results as Record<keyof PerformanceMetrics, boolean>,
      allPassed
    };
  }

  // Error handling method
  private handleError(operation: string, error: unknown): never {
    // Log the error to the console
    console.error(`Error ${operation}:`, error);
    // Throw a new error with a descriptive message
    throw new Error(`Failed to ${operation}`);
  }
}