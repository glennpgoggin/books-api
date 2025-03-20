import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import {
  interpolatePlaceholders,
  assertPartialMatch,
  logScenarioHeader,
} from './helpers';

export class ScenarioRunner {
  private context: Record<string, any> = {};

  constructor(private readonly app: INestApplication) {}

  private loadScenarioFromFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Scenario file not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async runDependency(
    parentScenarioPath: string,
    dependencyRelativePath: string
  ) {
    const dependencyPath = path.resolve(
      path.dirname(parentScenarioPath),
      dependencyRelativePath
    );

    const depScenario = this.loadScenarioFromFile(dependencyPath);
    await this.execute(depScenario, dependencyPath);
  }

  async executeFromFile(scenarioFilePath: string): Promise<void> {
    const scenario = this.loadScenarioFromFile(scenarioFilePath);
    return this.execute(scenario, scenarioFilePath);
  }

  async execute(scenario: any, scenarioFilePath: string): Promise<void> {
    logScenarioHeader(scenario.name, scenario.description);

    // Run dependencies if declared
    if (scenario.dependencies && scenario.dependencies.length > 0) {
      for (const dependency of scenario.dependencies) {
        await this.runDependency(scenarioFilePath, dependency);
      }
    }

    // Interpolate request placeholders
    const interpolatedRequest = interpolatePlaceholders(
      scenario.request,
      this.context,
      scenarioFilePath
    );

    // Make the request
    const res = await request(this.app.getHttpServer())
      [interpolatedRequest.method.toLowerCase()](interpolatedRequest.endpoint)
      .send(interpolatedRequest.body ?? {})
      .expect(scenario.expected.status);

    // Assert partial body match if provided
    if (scenario.expected.partialBodyMatch) {
      const expectedBody = interpolatePlaceholders(
        scenario.expected.partialBodyMatch,
        this.context,
        scenarioFilePath
      );
      assertPartialMatch(res.body, expectedBody);
    }

    // Store result in context using absolute path key
    this.context[scenarioFilePath] = { response: res.body };
  }
}
