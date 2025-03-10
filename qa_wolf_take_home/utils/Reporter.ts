// Import the file system promises API for asynchronous file operations
import { promises as fs } from 'fs';
// Import TestInfo from Playwright for type checking
import { TestInfo } from '@playwright/test';

// Define interfaces for structuring test results and report data
interface TestResult {
  name: string;           // Name of the test
  status: 'passed' | 'failed';  // Status of the test
  duration: number;       // Duration of the test in milliseconds
  error: string | null;   // Error message if the test failed, null otherwise
}

interface ReportSummary {
  total: number;    // Total number of tests
  passed: number;   // Number of passed tests
  failed: number;   // Number of failed tests
  passRate: string; // Pass rate as a percentage
}

interface Report {
  summary: Partial<ReportSummary>; // Summary of test results
  details: TestResult[];           // Detailed results of each test
}

// Define the structure of Playwright test results
export interface PlaywrightTestResult {
  title: string;
  status: 'passed' | 'failed';
  duration: number;
  error: Error | null;
}

// Reporter class for managing test results and generating reports
export class Reporter {
  private readonly report: Report;

  constructor() {
    // Initialize an empty report structure
    this.report = {
      summary: {},
      details: []
    };
  }

  // Add a test result to the report
  async addTestResult(testName: string, status: 'passed' | 'failed', duration: number, error: Error | null = null): Promise<void> {
    // Arrange & Act: Create and add the test result
    this.report.details.push(this.createTestResult(testName, status, duration, error));
  }

  // Generate and write the report to a file
  async generateReport(outputPath: string): Promise<void> {
    try {
      // Arrange: Summarize the results
      this.summarizeResults();
      
      // Act: Write the report to a file
      await this.writeReportToFile(outputPath);
      
      // Assert: Log the report summary
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
      error: error?.message ?? null  // Use null coalescing to handle potential undefined error
    };
  }

  // Summarize the test results
  private summarizeResults(): void {
    // Arrange: Calculate total, passed, and failed tests
    const total = this.report.details.length;
    const passed = this.report.details.filter(test => test.status === 'passed').length;
    const failed = total - passed;
    
    // Act & Assert: Create the report summary
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
    // Arrange & Act: Convert the report to a JSON string
    const reportContent = JSON.stringify(this.report, null, 2);  // Pretty print JSON with 2 space indentation
    
    // Act: Write the JSON string to the specified file
    await fs.writeFile(outputPath, reportContent, 'utf8');
  }

  // Log a summary of the report
  private logReportSummary(outputPath: string): void {
    // Arrange: Destructure the summary object
    const { total, passed, failed, passRate } = this.report.summary as ReportSummary;
    
    // Act & Assert: Log the summary details
    console.log(`Test report generated: ${outputPath}`);
    console.log(`Summary: Total: ${total}, Passed: ${passed}, Failed: ${failed}, Pass Rate: ${passRate}`);
  }

  // Handle errors during report generation
  private handleError(error: unknown): never {
    // Log the error to the console
    console.error('Error generating report:', error);
    // Throw a new error with a descriptive message
    throw new Error('Failed to generate test report');
  }
}

// Utility function to report test results
export async function reportResults(result: TestInfo | PlaywrightTestResult): Promise<void> {
  // Arrange: Determine the status of the test result
  const status = determineStatus(result);
  
  // Act & Assert: Log the status
  logStatus(status);
}

// Determine the status of a test result
function determineStatus(result: TestInfo | PlaywrightTestResult): 'passed' | 'failed' {
  // Act & Assert: Check if the result object has a 'status' property of type string
  if ('status' in result && typeof result.status === 'string') {
    return result.status === 'passed' ? 'passed' : 'failed';
  }
  // Default to 'failed' if status can't be determined
  return 'failed';
}

// Log the status of a test
function logStatus(status: 'passed' | 'failed'): void {
  console.log(`Test finished with status: ${status}`);
}