# Hacker News Validation Project

## Table of Contents
- [Overview](#overview)
- [Features](#features)
  - [Main Assignment](#main-assignment)
  - [Above and Beyond Tests](#above-and-beyond-tests)
- [Why AAA?](#why-aaa)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Testing](#testing)
  - [Key Points about the Main Test File](#key-points-about-the-main-test-file)
  - [Page Object Model](#page-object-model)
  - [Utility Classes](#utility-classes)
  - [Configuration](#configuration)
  - [Error Handling](#error-handling)
  - [Performance Testing](#performance-testing)
  - [Accessibility Testing](#accessibility-testing)
  - [Security Scanning](#security-scanning)
  - [Responsive Design Testing](#responsive-design-testing)
  - [Detailed Logging and Reporting](#detailed-logging-and-reporting)
  - [Best Practices Implemented](#best-practices-implemented)
  - [Going Above and Beyond](#going-above-and-beyond)
- [Performance Analysis](#performance-analysis)
- [Accessibility Checking](#accessibility-checking)
- [Security Scanning](#security-scanning)
- [Reporting](#reporting)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Overview

This project is an automated testing suite for validating the Hacker News website (https://news.ycombinator.com/newest). It demonstrates advanced usage of Playwright for end-to-end testing, including performance analysis, accessibility checking, and security scanning.

## Features

### Main Assignment
- **Validate first 100 articles on Hacker News/newest are sorted from newest to oldest**: Ensures that the articles are correctly sorted.

### Above and Beyond Tests
- **Performance Analysis**: Captures and analyzes key performance metrics.
- **Accessibility Checking**: Performs comprehensive accessibility audits.
- **Security Scanning**: Conducts basic security scans.
- **Error Handling**: Demonstrates attention to edge cases with specific tests for error handling.
- **Responsive Design Testing**: Ensures a good user experience across devices.
- **Repeating Assertions**: Uses repeating assertions to ensure reliability and robustness of tests.
- **AAA Pattern**: Follows the Arrange, Act, Assert (AAA) pattern for structuring tests.

## Why AAA?

There are three big reasons why our QA engineering team likes the AAA framework for outlining tests:

1. With standardized outlines, both QA engineers and clients can find gaps in coverage and where additional assertions or tests might be needed.
2. You can quickly isolate bugs and communicate them to the engineering team that's responsible for them.
3. If you've thoughtfully documented naming conventions, it's easy for other QA engineers to pick up and understand the test, allowing them to jump into test creation and maintenance much faster.

For more details, you can read the [QA Wolf blog on the AAA pattern](https://www.qawolf.com/blog/intro-to-aaa).

## Prerequisites

- Node.js 18+
- npm (v10 or later)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/EMEDAT/QA-Wolf.git
   ```

2. Navigate to the project directory:
   ```sh
   cd qa_wolf_take_home
   ```

3. Install dependencies:
   ```sh
   npm install
   ```

## Usage

To run the full test suite:

```sh
npx playwright test
```

To run the assignment specific test file:

```sh
npx playwright test tests/hacker-news-sorting-validation.spec.ts
```

To open the last HTML report on your web browser, run:

```sh
npx playwright show-report
```

## Project Structure

```
QA-Wolf/
│    qa_wolf_take_home/
│    ├── pages/
│    │   └── HackerNewsPage.ts
│    ├── tests/
│    │   ├── hacker-news-sorting-validation.spec.ts
│    │   ├── hacker-news-network-throttling.spec.ts
│    │   ├── hacker-news-additional-checks.spec.ts
│    ├── tests-examples/
│    │   └── demo-todo-app.spec.ts
│    ├── utils/
│    │   ├── AccessibilityChecker.ts
│    │   ├── ArticleValidator.ts
│    │   ├── PerformanceAnalyzer.ts
│    │   ├── Reporter.ts
│    │   └── SecurityScanner.ts
│    ├── app.config.ts
│    ├── index.ts
│    ├── package.json
│    ├── playwright.config.ts
│    ├── tsconfig.json
│    ├── why_qa_wolf.txt
│────└── README.md
```

## Testing

The main test suite is located in the [`tests`] directory. It covers:

- Article sorting validation (`hacker-news-sorting-validation.spec.ts`)
- Network throttling (`hacker-news-network-throttling.spec.ts`)
- Additional checks (`hacker-news-additional-checks.spec.ts`)

### Key Points about the Main Test File

- **Organization and Reporting**: It uses Playwright's test runner for better organization and reporting.
- **Step-by-Step Execution**: The test is broken down into steps for clarity and easier debugging.
- **Comprehensive Coverage**: It covers multiple aspects: functionality, performance, accessibility, security, and error handling.
- **Edge Case Handling**: Includes a separate test for error handling, demonstrating attention to edge cases.

### Page Object Model

The Page Object Model is a design pattern that creates an object repository for storing all web elements. It's beneficial because:

- **Reduces Code Duplication**: Improves test maintenance of my codebase.
- **Enhances Readability**: Makes the test suite more readable and reliable.
- **Separation of Concerns**: Separates page-specific code from test code.

### Utility Classes

Several utility classes handle specific aspects of testing:

- **ArticleValidator**: Validates the sorting of articles.
- **PerformanceAnalyzer**: Captures and analyzes performance metrics.
- **AccessibilityChecker**: Performs accessibility checks on the page.
- **SecurityScanner**: Conducts basic security scans.
- **Reporter**: Generates a report of test results.

My aim for using these classes is to create modular, reusable code.

### Configuration

Using a configuration file allows for easy adjustments to test parameters without modifying my main code.

### Error Handling

Comprehensive error handling includes:

- **Try-Catch Blocks**: In critical sections.
- **Detailed Error Logging**: Logs detailed error information.
- **Specific Test Case for Network Errors**: Improves robustness and reliability in test automation.

### Performance Testing

The Metrics I measured include:

- **First Contentful Paint**
- **Time to Interactive**

These metrics provide insights into the page's loading speed and interactivity.

### Accessibility Testing

Accessibility testing ensures that the website is usable by people with disabilities.

### Security Scanning

Basic security scanning aims at mitigating security concerns in the web applications.

### Responsive Design Testing

Testing the site's behavior on mobile viewports will ensure a good user experience across devices.

### Detailed Logging and Reporting

Detailed logging and reporting are crucial for analyzing test results and tracking issues over time.

### Best Practices Implemented

- **Use of async/await**: For better readability and error handling.
- **Modular Design**: For better maintainability.
- **Comprehensive Comments**: Explaining code functionality.
- **Configuration File**: For easy adjustments.
- **Separation of Concerns**: Each class has a single responsibility.
- **Repeating Assertions**: Ensures reliability and robustness of tests.
- **AAA Pattern**: Follows the Arrange, Act, Assert (AAA) pattern for structuring tests.

### Going Above and Beyond

- **Full Test Framework**: Implemented a comprehensive test framework.
- **Additional Checks**: Added performance, accessibility, and security checks.
- **Modular and Extensible Solution**: Created a modular, extensible solution.
- **Robust Error Handling and Reporting**: Implemented robust error handling and reporting.
- **Attention to Detail**: Demonstrated attention to detail with comprehensive comments.

## Performance Analysis

The `PerformanceAnalyzer` class in `utils/PerformanceAnalyzer.ts` captures and analyzes key performance metrics such as First Contentful Paint, Time to Interactive, and Load Time.

## Accessibility Checking

The `AccessibilityChecker` class in `utils/AccessibilityChecker.ts` uses axe-core to perform accessibility audits on the page.

## Security Scanning

The `SecurityScanner` class in `utils/SecurityScanner.ts` checks for secure connections and required security headers.

## Reporting

Test results are reported using the custom `Reporter` class in `utils/Reporter.ts`. It generates a JSON report with test summaries and details.

## Configuration

Project configuration is managed in `app.config.ts`. This includes settings for:

- Base URL
- Performance thresholds
- Viewport sizes
- Network timeout
- Accessibility level
- Required security headers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

FINAL IMAGE DESCRIPTION: Final image after all is completed!
![Screenshot 2024-09-13 015852](https://github.com/user-attachments/assets/8d2d1d63-595b-4d8c-918d-ee142288e726)
