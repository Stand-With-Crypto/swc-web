# Next.js 15 → 16 Upgrade Measurement Plan

## Overview

This plan establishes comprehensive metrics to measure the impact of upgrading from Next.js 15.1.6 to Next.js 16.x in the Stand With Crypto codebase. After removing node_modules and starting fresh, we'll implement measurement infrastructure before the upgrade.

## Phase 1: Pre-Upgrade Baseline Establishment

### 1.1 Bundle Size Analysis

**Goal**: Establish current bundle characteristics
**Tools**: `@next/bundle-analyzer` (already configured)

**Steps**:

1. Clean install with `rm -rf node_modules && npm ci`
2. Run `ANALYZE=true npm run build` to generate baseline bundle report
3. Save bundle analyzer HTML reports (`.next/analyze/client.html`, `.next/analyze/server.html`)
4. Document key metrics:
   - Total bundle size
   - Individual chunk sizes
   - Third-party package contributions
   - Tree-shaking effectiveness
   - Route-specific bundle sizes

### 1.2 Build Performance Baseline

**Goal**: Measure compilation speed and resource usage

**Metrics to Capture**:

- **Cold Build Time**: `time npm run build` (with clean .next directory)
- **Incremental Build Time**: Time for file change → rebuild
- **Development Server Startup**: `time npm run dev` until ready
- **Memory Usage**: Using `--experimental-debug-memory-usage` flag
- **CI Build Duration**: Extract from GitHub Actions logs

**Implementation**:

1. Create benchmark script that runs builds 3 times and averages results
2. Test both local and CI environments
3. Document webpack cache behavior (currently disabled per recent commit)

### 1.3 Runtime Performance Baseline

**Goal**: Establish user-facing performance metrics

**Tools & Metrics**:

- **Vercel Speed Insights**: Collect 1-week baseline of Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
- **Lighthouse CI**: Set up automated performance scoring for key pages
- **Sentry Performance**: Document current transaction timing
- **Custom Route Benchmarks**: Measure specific page load times

**Key Pages to Measure**:

- Home page (`/`)
- User dashboard (`/profile`)
- Action pages (`/action/*`)
- API routes performance

### 1.4 Error Rate & Stability Baseline

**Goal**: Establish reliability metrics

**Metrics**:

- **Sentry Error Rates**: Current error frequency by category
- **Build Warnings**: TypeScript, ESLint, Next.js warnings
- **Test Suite Performance**: Jest and Cypress test execution times
- **Development Stability**: Hot reload success rate

## Phase 2: Create Missing Measurement Infrastructure

### 2.1 Bundle Size Monitoring

**Implementation**:

1. **CI Integration**: Add bundle size check to GitHub Actions
2. **Size Budget Configuration**: Set webpack performance budgets
3. **Comparison Reports**: Script to compare before/after bundle analysis
4. **Regression Alerts**: Fail CI if bundle size increases >10%

### 2.2 Performance Monitoring Enhancement

**New Tools to Add**:

1. **Lighthouse CI Setup**:

   - Install `@lhci/cli`
   - Configure budgets for key metrics (Performance score >90, LCP <2.5s)
   - Add to GitHub Actions workflow

2. **Build Time Tracking**:

   - Create benchmark script for consistent measurement
   - Add CI job duration monitoring
   - Historical build time tracking

3. **Memory Profiling**:
   - Systematic memory usage measurement during builds
   - Monitor for memory leaks in development

### 2.3 Load Testing Infrastructure

**Goal**: Measure performance under realistic conditions

**Implementation**:

1. **Concurrent User Simulation**: Set up tool like Artillery or k6
2. **Database Performance**: Test query performance under load
3. **API Endpoint Testing**: Measure server action response times
4. **Cache Performance**: Test Next.js caching effectiveness

## Phase 3: Execute Upgrade

### 3.1 ESLint Version Update (First Step)

**Goal**: Validate compatibility before main upgrade

**Steps**:

1. Update ESLint to version compatible with Next.js 16
2. Run full linting suite
3. Check for breaking changes
4. Verify all existing lint rules work
5. Document any rule changes needed

### 3.2 Next.js Core Upgrade

**Dependencies to Update**:

- `next`: `15.1.6` → `16.x.x`
- `@next/bundle-analyzer`: Update to match
- `@next/third-parties`: Update to match
- `eslint-config-next`: Update for compatibility

**Process**:

1. Update package.json versions
2. Run `npm install`
3. Address any peer dependency warnings
4. Update configuration for Next.js 16 changes

### 3.3 Configuration Migration

**Areas to Review**:

- `next.config.ts`: Check for deprecated options
- TypeScript configuration compatibility
- Webpack customizations (chunk retry plugin)
- Experimental features migration

## Phase 4: Post-Upgrade Measurement

### 4.1 Immediate Validation

**Timeline**: Run within 24 hours of upgrade

**Comparisons**:

1. **Bundle Analysis**: Compare new vs baseline reports
2. **Build Performance**: Re-run benchmark scripts
3. **Test Suites**: Verify all tests pass
4. **Development Experience**: Test dev server performance
5. **Production Build**: Verify deployment works

### 4.2 Performance Impact Analysis

**Timeline**: 1-2 weeks monitoring

**Metrics to Track**:

- **Core Web Vitals**: Monitor Vercel Speed Insights trends
- **Error Rates**: Watch Sentry for new issues
- **Build Times**: Compare CI job durations
- **User Experience**: Monitor conversion rates and engagement

### 4.3 Next.js 16 Specific Features

**New Capabilities to Measure**:

- **Enhanced Caching**: Test new caching mechanisms
- **Turbopack Improvements**: Measure dev server speed
- **React 19 Optimizations**: Test Server Components performance
- **Build Optimizations**: Verify webpack improvements

## Phase 5: Long-term Monitoring

### 5.1 Automated Performance Monitoring

**Implementation**:

1. **Performance Dashboard**: Create centralized metrics view
2. **Regression Detection**: Automated alerts for performance degradation
3. **Regular Benchmarking**: Weekly automated performance checks
4. **Trend Analysis**: Historical performance data tracking

### 5.2 Optimization Opportunities

**Post-Upgrade Improvements**:

1. **Bundle Optimization**: Leverage Next.js 16 tree-shaking improvements
2. **Caching Strategy**: Implement new caching features
3. **Development Workflow**: Optimize build pipeline
4. **Performance Tuning**: Focus on Core Web Vitals improvements

## Implementation Timeline

### Week 1: Infrastructure Setup

- Set up measurement tools (Lighthouse CI, bundle monitoring)
- Establish all baseline metrics
- Create benchmark scripts
- Document current state

### Week 2: Upgrade Execution

- Update ESLint and validate
- Perform Next.js upgrade
- Run immediate post-upgrade validation
- Address any breaking changes

### Week 3: Performance Analysis

- Compare all before/after metrics
- Monitor production performance
- Optimize based on findings
- Document improvements achieved

## Expected Improvements from Next.js 16

**Anticipated Benefits**:

1. **Build Performance**: 10-20% faster compilation times
2. **Bundle Size**: 5-10% reduction through better tree-shaking
3. **Runtime Performance**: Enhanced React 19 integration benefits
4. **Development Experience**: Faster HMR and dev server startup
5. **Caching**: Improved caching mechanisms for better performance

## Success Criteria

**Upgrade Considered Successful If**:

- Bundle size maintained or reduced
- Build times improved or maintained
- Core Web Vitals scores maintained or improved
- Zero increase in error rates
- All tests continue to pass
- No regression in user experience metrics
- Successful deployment to production

## Tools & Scripts to Create

1. **Bundle Comparison Script**: Compare before/after bundle analysis
2. **Build Benchmark Script**: Consistent build time measurement
3. **Performance Test Suite**: Automated Lighthouse + custom metrics
4. **CI Integration**: GitHub Actions for performance monitoring
5. **Performance Dashboard**: Centralized metrics visualization

---

## Step-by-Step Implementation Guide

### Step 1: Establish Bundle Size Baseline

```bash
# Clean install
rm -rf node_modules .next
npm ci

# Generate baseline bundle analysis
ANALYZE=true npm run build

# Save reports for comparison
cp .next/analyze/client.html baseline-client-bundle.html
cp .next/analyze/server.html baseline-server-bundle.html
```

### Step 2: Create Build Performance Benchmark Script

Create `scripts/benchmark-build.js`:

```javascript
const { execSync } = require('child_process')
const fs = require('fs')

function measureBuildTime() {
  const runs = 3
  const times = []

  for (let i = 0; i < runs; i++) {
    // Clean build
    execSync('rm -rf .next')

    const start = Date.now()
    execSync('npm run build', { stdio: 'inherit' })
    const end = Date.now()

    times.push(end - start)
  }

  const average = times.reduce((a, b) => a + b) / times.length

  const results = {
    runs: times,
    average: average,
    timestamp: new Date().toISOString(),
  }

  fs.writeFileSync('build-benchmark-results.json', JSON.stringify(results, null, 2))
  console.log(`Average build time: ${average}ms`)

  return results
}

measureBuildTime()
```

### Step 3: Set Up Lighthouse CI

```bash
# Install Lighthouse CI
npm install -D @lhci/cli

# Create lighthouse configuration
echo '{
  "ci": {
    "collect": {
      "startServerCommand": "npm run build && npm run start",
      "url": ["http://localhost:3000", "http://localhost:3000/profile"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}' > lighthouserc.json
```

### Step 4: Create Performance Test Suite

Create `scripts/performance-test.js`:

```javascript
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

async function runPerformanceTest(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
  const options = { logLevel: 'info', output: 'json', port: chrome.port }
  const runnerResult = await lighthouse(url, options)

  await chrome.kill()

  return {
    url: url,
    performance: runnerResult.lhr.categories.performance.score,
    fcp: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
    lcp: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
    cls: runnerResult.lhr.audits['cumulative-layout-shift'].numericValue,
    timestamp: new Date().toISOString(),
  }
}

// Test key pages
const urls = [
  'http://localhost:3000',
  'http://localhost:3000/profile',
  'http://localhost:3000/action/email',
]

Promise.all(urls.map(runPerformanceTest)).then(results => {
  console.log('Performance baseline:', JSON.stringify(results, null, 2))
})
```

### Step 5: Monitor Existing Tools

```bash
# Check current Vercel Speed Insights data
# (Access via Vercel dashboard)

# Monitor Sentry performance data
# (Access via Sentry dashboard)

# Run existing benchmark
npm run ts src/bin/benchmarks/benchmarkTotalAdvocatesPerState.ts
```

---

## Quick Reference Commands

### Pre-Upgrade Measurement

```bash
# Bundle analysis
ANALYZE=true npm run build

# Build benchmark
node scripts/benchmark-build.js

# Performance test (after starting server)
node scripts/performance-test.js

# Test suite performance
time npm test
time npm run e2e:run-headless
```

### Post-Upgrade Comparison

```bash
# Compare bundle sizes
diff baseline-client-bundle.html .next/analyze/client.html

# Compare build times
node scripts/benchmark-build.js
# Compare with baseline-build-benchmark-results.json

# Re-run performance tests
node scripts/performance-test.js
# Compare with baseline results
```

This plan provides a comprehensive framework for measuring the impact of your Next.js 16 upgrade. Each step builds upon the previous one, ensuring you have solid data to validate the upgrade's success.
