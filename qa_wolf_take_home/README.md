# Hacker News Validation Project

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Testing](#testing)
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

- Validates the sorting of the first 100 articles on Hacker News
- Performs comprehensive article validation
- Conducts performance analysis
- Checks for accessibility issues
- Scans for security vulnerabilities
- Verifies responsive design
- Checks for broken links
- Validates comment functionality
- Handles and reports errors gracefully

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/EMEDAT/QA-Wolf.git
   ```

2. Navigate to the project directory:
   ```
   cd qa_wolf_take_home
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Usage

To run the full test suite:

```
npm playwright test
```

To run a assignment specific test file:

```
npx playwright test tests/hacker-news-sorting.spec.ts
```

## Project Structure

```
QA-Wolf/
│    qa_wolf_take_home/
│    ├── pages/
│    │   └── HackerNewsPage.ts
│    ├── tests/
│    │   └── hacker-news-sorting.spec.ts
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

The main test suite is located in `tests/hacker-news-sorting.spec.ts`.

Additional test cases can be found in `index.ts`. It covers:

- Article sorting validation
- Performance testing
- Accessibility testing
- Security scanning
- Error handling and reporting

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

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

![Screenshot 2024-09-12 024008](https://github.com/user-attachments/assets/d3453148-77e5-4e44-9e85-82ca884a99b3)

