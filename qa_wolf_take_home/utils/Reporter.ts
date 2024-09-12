import { promises as fs } from 'fs';
import { TestInfo } from '@playwright/test';

// Define interfaces for test results and report structure
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

  // Add a test result to the report
  async addTestResult(testName: string, status: 'passed' | 'failed', duration: number, error: Error | null = null): Promise<void> {
    this.report.details.push(this.createTestResult(testName, status, duration, error));
  }

  // Generate and write the report to a file
  async generateReport(outputPath: string): Promise<void> {
    try {
      this.summarizeResults();
      await this.writeReportToFile(outputPath);
      this.logReportSummary(outputPath);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create a test result object
  private createTestResult(testName: string, status: 'passed' | 'failed', duration: number, error: Error | null): TestResult {
    return {
      name: testName,
      status,
      duration,
      error: error?.message ?? null
    };
  }

  // Summarize the test results
  private summarizeResults(): void {
    const total = this.report.details.length;
    const passed = this.report.details.filter(test => test.status === 'passed').length;
    const failed = total - passed;
    this.report.summary = this.createReportSummary(total, passed, failed);
  }

  // Create a report summary object
  private createReportSummary(total: number, passed: number, failed: number): ReportSummary {
    return {
      total,
      passed,
      failed,
      passRate: this.calculatePassRate(passed, total)
    };
  }

  // Calculate the pass rate as a percentage
  private calculatePassRate(passed: number, total: number): string {
    return `${((passed / total) * 100).toFixed(2)}%`;
  }

  // Write the report to a file
  private async writeReportToFile(outputPath: string): Promise<void> {
    const reportContent = JSON.stringify(this.report, null, 2);
    await fs.writeFile(outputPath, reportContent, 'utf8');
  }

  // Log a summary of the report
  private logReportSummary(outputPath: string): void {
    const { total, passed, failed, passRate } = this.report.summary as ReportSummary;
    console.log(`Test report generated: ${outputPath}`);
    console.log(`Summary: Total: ${total}, Passed: ${passed}, Failed: ${failed}, Pass Rate: ${passRate}`);
  }

  // Handle errors during report generation
  private handleError(error: unknown): never {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate test report');
  }
}

// Utility function to report test results
export async function reportResults(result: TestInfo | PlaywrightTestResult): Promise<void> {
  const status = determineStatus(result);
  logStatus(status);
}

// Determine the status of a test result
function determineStatus(result: TestInfo | PlaywrightTestResult): 'passed' | 'failed' {
  if ('status' in result && typeof result.status === 'string') {
    return result.status === 'passed' ? 'passed' : 'failed';
  }
  return 'failed';
}

// Log the status of a test
function logStatus(status: 'passed' | 'failed'): void {
  console.log(`Test finished with status: ${status}`);
}