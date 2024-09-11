import { promises as fs } from 'fs';
import { TestInfo } from '@playwright/test';

interface TestResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  error: string | null;
}

interface ReportSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
}

interface Report {
  summary: Partial<ReportSummary>;
  details: TestResult[];
}

export interface PlaywrightTestResult {
  title: string;
  status: 'passed' | 'failed';
  duration: number;
  error: Error | null;
}

export class Reporter {
  private readonly report: Report;

  constructor() {
    this.report = {
      summary: {},
      details: []
    };
  }

  async addTestResult(testName: string, status: 'passed' | 'failed', duration: number, error: Error | null = null): Promise<void> {
    this.report.details.push(this.createTestResult(testName, status, duration, error));
  }

  async generateReport(outputPath: string): Promise<void> {
    try {
      this.summarizeResults();
      await this.writeReportToFile(outputPath);
      this.logReportSummary(outputPath);
    } catch (error) {
      this.handleError(error);
    }
  }

  private createTestResult(testName: string, status: 'passed' | 'failed', duration: number, error: Error | null): TestResult {
    return {
      name: testName,
      status,
      duration,
      error: error?.message ?? null
    };
  }

  private summarizeResults(): void {
    const total = this.report.details.length;
    const passed = this.report.details.filter(test => test.status === 'passed').length;
    const failed = total - passed;
    this.report.summary = this.createReportSummary(total, passed, failed);
  }

  private createReportSummary(total: number, passed: number, failed: number): ReportSummary {
    return {
      total,
      passed,
      failed,
      passRate: this.calculatePassRate(passed, total)
    };
  }

  private calculatePassRate(passed: number, total: number): string {
    return `${((passed / total) * 100).toFixed(2)}%`;
  }

  private async writeReportToFile(outputPath: string): Promise<void> {
    const reportContent = JSON.stringify(this.report, null, 2);
    await fs.writeFile(outputPath, reportContent, 'utf8');
  }

  private logReportSummary(outputPath: string): void {
    const { total, passed, failed, passRate } = this.report.summary as ReportSummary;
    console.log(`Test report generated: ${outputPath}`);
    console.log(`Summary: Total: ${total}, Passed: ${passed}, Failed: ${failed}, Pass Rate: ${passRate}`);
  }

  private handleError(error: unknown): never {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate test report');
  }
}

export async function reportResults(result: TestInfo | PlaywrightTestResult): Promise<void> {
  const status = determineStatus(result);
  logStatus(status);
}

function determineStatus(result: TestInfo | PlaywrightTestResult): 'passed' | 'failed' {
  if ('status' in result && typeof result.status === 'string') {
    return result.status === 'passed' ? 'passed' : 'failed';
  }
  return 'failed';
}

function logStatus(status: 'passed' | 'failed'): void {
  console.log(`Test finished with status: ${status}`);
}