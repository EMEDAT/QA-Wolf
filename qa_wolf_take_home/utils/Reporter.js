// Reporter.js

const fs = require('fs').promises;

class Reporter {
  constructor() {
    this.report = {
      summary: {},
      details: []
    };
  }

  async addTestResult(testName, status, duration, error = null) {
    this.report.details.push({
      name: testName,
      status,
      duration,
      error: error ? error.message : null
    });
  }

  summarizeResults() {
    const total = this.report.details.length;
    const passed = this.report.details.filter(test => test.status === 'passed').length;
    const failed = total - passed;

    this.report.summary = {
      total,
      passed,
      failed,
      passRate: (passed / total * 100).toFixed(2) + '%'
    };
  }

  async generateReport(outputPath) {
    try {
      this.summarizeResults();

      const reportContent = JSON.stringify(this.report, null, 2);
      await fs.writeFile(outputPath, reportContent);

      console.log(`Test report generated: ${outputPath}`);
      console.log(`Summary: Total: ${this.report.summary.total}, Passed: ${this.report.summary.passed}, Failed: ${this.report.summary.failed}, Pass Rate: ${this.report.summary.passRate}`);
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate test report');
    }
  }
}

async function reportResults(testResults) {
  const reporter = new Reporter();

  for (const result of testResults) {
    await reporter.addTestResult(
      result.title,
      result.status,
      result.duration,
      result.error
    );
  }

  await reporter.generateReport('test-report.json');
}

module.exports = { Reporter, reportResults };