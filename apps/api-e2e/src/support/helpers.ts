import chalk from 'chalk';
import * as jp from 'jsonpath-plus';
import * as path from 'path';

export function interpolatePlaceholders(
  obj: any,
  context: Record<string, any>,
  scenarioFilePath?: string
): any {
  const jsonStr = JSON.stringify(obj).replace(/{{(.*?)}}/g, (_, key) => {
    const [scenarioRef, ...jsonPathParts] = key.trim().split('.response.');
    const jsonPath = jsonPathParts.join('.response.');

    let scenarioKey = scenarioRef;

    // Resolve relative scenario reference to absolute path if scenarioFilePath exists
    if (scenarioFilePath) {
      scenarioKey = path.resolve(path.dirname(scenarioFilePath), scenarioRef);
    }

    // Ensure scenarioKey has .json extension if not present
    if (!scenarioKey.endsWith('.json')) {
      scenarioKey += '.json';
    }

    const scenarioResponse = context[scenarioKey]?.response;
    if (!scenarioResponse) {
      throw new Error(`Context value not found for ${scenarioKey}`);
    }

    const result = jp.JSONPath({
      path: `$.${jsonPath}`,
      json: scenarioResponse,
      wrap: false,
    });
    return result ?? '';
  });

  return JSON.parse(jsonStr);
}

export function assertPartialMatch(received: any, expectedPartial: any) {
  try {
    for (const [jsonPath, expectedValue] of Object.entries(expectedPartial)) {
      const actualValue = jp.JSONPath({
        path: `$.${jsonPath}`,
        json: received,
        wrap: false,
      });

      if (Array.isArray(expectedValue)) {
        if (!Array.isArray(actualValue)) {
          console.error(
            chalk.red(
              `Expected an array at path '${jsonPath}', got: ${typeof actualValue}`
            )
          );
          console.error(
            chalk.yellow(`Full response: ${JSON.stringify(received, null, 2)}`)
          );
          throw new Error(`Partial array assertion failed at ${jsonPath}`);
        }

        expectedValue.forEach((expectedItem) => {
          const found = actualValue.some((item) =>
            typeof item === 'string' && typeof expectedItem === 'string'
              ? item.includes(expectedItem)
              : JSON.stringify(item).includes(JSON.stringify(expectedItem))
          );

          if (!found) {
            console.error(
              chalk.red(
                `❌ Array at path '${jsonPath}' does not contain expected item: ${expectedItem}`
              )
            );
            console.error(
              chalk.yellow(
                `Actual array: ${JSON.stringify(actualValue, null, 2)}`
              )
            );
            console.error(
              chalk.gray(`Full response: ${JSON.stringify(received, null, 2)}`)
            );
            throw new Error(`Partial array assertion failed at ${jsonPath}`);
          }
        });
      } else {
        if (
          typeof actualValue === 'string' &&
          typeof expectedValue === 'string'
        ) {
          if (!actualValue.includes(expectedValue)) {
            console.error(
              chalk.red(
                `❌ Value at '${jsonPath}' does not include expected value.`
              )
            );
            console.error(chalk.green(`Expected partial: ${expectedValue}`));
            console.error(chalk.yellow(`Actual: ${actualValue}`));
            console.error(
              chalk.gray(`Full response: ${JSON.stringify(received, null, 2)}`)
            );
            throw new Error(`Partial string match failed at ${jsonPath}`);
          }
        } else if (
          JSON.stringify(actualValue) !== JSON.stringify(expectedValue)
        ) {
          console.error(chalk.red(`❌ Value mismatch at '${jsonPath}'`));
          console.error(
            chalk.green(
              `Expected partial: ${JSON.stringify(expectedValue, null, 2)}`
            )
          );
          console.error(
            chalk.yellow(`Actual: ${JSON.stringify(actualValue, null, 2)}`)
          );
          console.error(
            chalk.gray(`Full response: ${JSON.stringify(received, null, 2)}`)
          );
          throw new Error(`Partial object mismatch at ${jsonPath}`);
        }
      }
    }
  } catch (err) {
    console.error(chalk.red(`\n❗ Detailed assertion failure.`));
    throw err;
  }
}

export function logScenarioHeader(scenarioName: string, description?: string) {
  console.log(chalk.blue.bold(`\n🧩 Running scenario: ${scenarioName}`));
  if (description) {
    console.log(chalk.gray(description));
  }
}
