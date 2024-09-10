// PerformanceAnalyzer.js

const { chromium } = require('playwright');

class PerformanceAnalyzer {
  constructor(page) {
    this.page = page;
  }

  async captureMetrics() {
    try {
      const client = await this.page.context().newCDPSession(this.page);
      await client.send('Performance.enable');
      const result = await client.send('Performance.getMetrics');
      const metrics = result.metrics;

      const performanceMetrics = {
        firstContentfulPaint: this.getMetricValue(metrics, 'FirstContentfulPaint'),
        timeToInteractive: this.getMetricValue(metrics, 'InteractiveTime'),
        domContentLoaded: this.getMetricValue(metrics, 'DomContentLoaded'),
        loadTime: this.getMetricValue(metrics, 'LoadTime'),
      };

      console.log('Performance metrics captured:', JSON.stringify(performanceMetrics, null, 2));
      return performanceMetrics;
    } catch (error) {
      console.error('Error capturing performance metrics:', error);
      throw new Error('Failed to capture performance metrics');
    }
  }

  getMetricValue(metrics, name) {
    const metric = metrics.find(m => m.name === name);
    return metric ? metric.value : null;
  }

  async measurePageLoad() {
    try {
      const navigationStart = await this.page.evaluate(() => performance.timing.navigationStart);
      const loadEventEnd = await this.page.evaluate(() => performance.timing.loadEventEnd);
      const loadTime = loadEventEnd - navigationStart;
      
      console.log(`Page load time: ${loadTime}ms`);
      return loadTime;
    } catch (error) {
      console.error('Error measuring page load time:', error);
      throw new Error('Failed to measure page load time');
    }
  }
}

module.exports = { PerformanceAnalyzer };