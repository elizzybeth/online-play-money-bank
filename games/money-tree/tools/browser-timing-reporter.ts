import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
  FullConfig,
} from "@playwright/test/reporter";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
export default class TimingReporter implements Reporter {
  private output = "test-results";
  onBegin(config: FullConfig) {
    this.output =
      process.env.MONEY_TREE_TIMINGS_DIR ?? config.projects[0].outputDir;
  }
  private started = performance.now();
  private cpu = process.cpuUsage();
  private tests: {
    title: string;
    ms: number;
    status: string;
    retry: number;
  }[] = [];
  onTestEnd(test: TestCase, result: TestResult) {
    this.tests.push({
      title: test.titlePath().slice(1).join(" > "),
      ms: result.duration,
      status: result.status,
      retry: result.retry,
    });
  }
  onEnd(result: FullResult) {
    const output = this.output;
    mkdirSync(output, { recursive: true });
    const cpu = process.cpuUsage(this.cpu);
    const summary = {
      status: result.status,
      wallMs: performance.now() - this.started,
      driverCpuMs: (cpu.user + cpu.system) / 1000,
      driverPeakRssKiB: process.resourceUsage().maxRSS,
      tests: this.tests,
    };
    writeFileSync(
      join(output, "browser-timings.json"),
      JSON.stringify(summary, null, 2),
    );
    console.log(
      "Slowest browser checks:",
      this.tests
        .toSorted((a, b) => b.ms - a.ms)
        .slice(0, 5)
        .map((t) => `${(t.ms / 1000).toFixed(1)}s ${t.title}`)
        .join("\n"),
    );
  }
}
