import { Page } from '@playwright/test';
import axe from 'axe-core';

interface Config {
  accessibilityLevel: 'A' | 'AA' | 'AAA';
}

interface AxeResults {
  violations: AxeViolation[];
}

interface AxeViolation {
  id: string;
  impact: string;
  description: string;
  nodes: AxeNode[];
}

interface AxeNode {
  html: string;
  target: string[];
}

interface ContrastIssue {
  element: string;
  backgroundColor: string;
  color: string;
  contrast: number;
}

export class AccessibilityChecker {
  private readonly page: Page;
  private readonly accessibilityLevel: Config['accessibilityLevel'];

  constructor(page: Page, config: Config) {
    this.page = page;
    this.accessibilityLevel = config.accessibilityLevel;
  }

  async analyze(): Promise<AxeViolation[]> {
    try {
      await this.page.evaluate(axe.source);
      const results: AxeResults = await this.runAxeAnalysis();
      this.logViolations(results.violations);
      return results.violations;
    } catch (error) {
      this.handleError('accessibility analysis', error);
    }
  }

  private async runAxeAnalysis(): Promise<AxeResults> {
    return this.page.evaluate((level: string) => {
      return new Promise((resolve) => {
        axe.run({ runOnly: { type: 'tag', values: [level] } }, (err: Error | null, results: AxeResults) => {
          if (err) throw err;
          resolve(results);
        });
      });
    }, this.accessibilityLevel);
  }

  private logViolations(violations: AxeViolation[]): void {
    if (violations.length > 0) {
      console.warn('Accessibility violations found:', JSON.stringify(violations, null, 2));
    } else {
      console.log('No accessibility violations found.');
    }
  }

  async checkColorContrast(): Promise<ContrastIssue[]> {
    try {
      const contrastIssues: ContrastIssue[] = await this.page.evaluate(this.evaluateColorContrast);
      this.logContrastIssues(contrastIssues);
      return contrastIssues;
    } catch (error) {
      this.handleError('color contrast check', error);
    }
  }

  private evaluateColorContrast(): ContrastIssue[] {
    const elements = document.body.getElementsByTagName('*');
    const issues: ContrastIssue[] = [];

    for (const element of elements) {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      const contrast = this.getContrastRatio(backgroundColor, color);

      if (contrast < 4.5) {  // WCAG AA standard for normal text
        issues.push({
          element: element.tagName,
          backgroundColor,
          color,
          contrast
        });
      }
    }

    return issues;
  }

  private logContrastIssues(contrastIssues: ContrastIssue[]): void {
    if (contrastIssues.length > 0) {
      console.warn('Color contrast issues found:', JSON.stringify(contrastIssues, null, 2));
    } else {
      console.log('No color contrast issues found.');
    }
  }

  private handleError(operation: string, error: unknown): never {
    console.error(`Error during ${operation}:`, error);
    throw new Error(`Failed to perform ${operation}`);
  }

  private getContrastRatio(background: string, foreground: string): number {
    // Implementation of contrast ratio calculation
    // This should be replaced with a more accurate implementation
    return 5; // Placeholder return value
  }
}