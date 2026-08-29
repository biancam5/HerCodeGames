import { PetState } from '../types';

export interface ExecutionStep {
  type: 'set_variable' | 'action' | 'condition_check' | 'loop_iteration' | 'log';
  name?: string;
  value?: any;
  action?: 'feed' | 'play' | 'clean' | 'sleep' | 'move' | 'collectStar';
  message: string;
  stateSnapshot: PetState;
  codeLineNumber?: number;
}

export interface ExecutionResult {
  success: boolean;
  error?: string;
  errorType?: 'syntax' | 'misconception' | 'logic' | 'runtime';
  steps: ExecutionStep[];
  finalPetState: PetState;
  declaredVariables: Record<string, any>;
  calledFunctions: string[];
  collectedStars: number;
  stdout: string[];
}

export function runSafeJavaScript(
  code: string,
  initialPetState: PetState,
  petNameFallback: string = 'Luna'
): ExecutionResult {
  const steps: ExecutionStep[] = [];
  const stdout: string[] = [];
  const state: PetState = { ...initialPetState };
  const variables: Record<string, any> = {
    petName: petNameFallback,
    hunger: state.hunger,
    energy: state.energy,
    cleanliness: state.cleanliness,
    happiness: state.happiness,
    stars: state.starsCollected,
  };
  const definedFunctions: Record<string, string[]> = {};
  const calledFunctions: string[] = [];

  // Clean and sanitize code lines
  const rawLines = code.split('\n');
  const lines = rawLines.map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('//'));

  try {
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      // 1. Variable declaration: let x = "val"; or let x = 123;
      const varMatch = line.match(/^let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(.+?);?$/);
      if (varMatch) {
        const varName = varMatch[1];
        let rawVal = varMatch[2].replace(/;$/, '').trim();
        let parsedVal: any = rawVal;

        if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
          parsedVal = rawVal.slice(1, -1);
        } else if (!isNaN(Number(rawVal))) {
          parsedVal = Number(rawVal);
        } else if (rawVal === 'true') {
          parsedVal = true;
        } else if (rawVal === 'false') {
          parsedVal = false;
        }

        variables[varName] = parsedVal;
        if (varName === 'hunger') state.hunger = parsedVal;
        if (varName === 'happiness') state.happiness = parsedVal;
        if (varName === 'energy') state.energy = parsedVal;
        if (varName === 'cleanliness') state.cleanliness = parsedVal;

        steps.push({
          type: 'set_variable',
          name: varName,
          value: parsedVal,
          message: `Variable ${varName} = ${JSON.stringify(parsedVal)}`,
          stateSnapshot: { ...state },
        });
        i++;
        continue;
      }

      // 2. Variable reassignment: x = 123;
      const reassignMatch = line.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(.+?);?$/);
      if (reassignMatch && !line.startsWith('let ') && !line.startsWith('const ') && !line.startsWith('for ') && !line.startsWith('if ')) {
        const varName = reassignMatch[1];
        let rawVal = reassignMatch[2].replace(/;$/, '').trim();
        let parsedVal: any = rawVal;
        if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
          parsedVal = rawVal.slice(1, -1);
        } else if (!isNaN(Number(rawVal))) {
          parsedVal = Number(rawVal);
        }
        variables[varName] = parsedVal;
        if (varName === 'hunger') state.hunger = parsedVal;
        steps.push({
          type: 'set_variable',
          name: varName,
          value: parsedVal,
          message: `Updated ${varName} = ${JSON.stringify(parsedVal)}`,
          stateSnapshot: { ...state },
        });
        i++;
        continue;
      }

      // 3. If Statement: if (hunger > 50) { ... }
      if (line.startsWith('if')) {
        const ifMatch = line.match(/if\s*\((.+?)\)\s*\{?/);
        if (!ifMatch) {
          return {
            success: false,
            error: 'Check your if statement syntax: format should be if (condition) { ... }',
            errorType: 'syntax',
            steps,
            finalPetState: state,
            declaredVariables: variables,
            calledFunctions,
            collectedStars: state.starsCollected,
            stdout,
          };
        }

        const conditionStr = ifMatch[1].trim();
        // Collect block body
        let blockBody: string[] = [];
        if (line.includes('{') && line.includes('}') && line.indexOf('}') > line.indexOf('{')) {
          // single line block
          const inside = line.substring(line.indexOf('{') + 1, line.lastIndexOf('}')).trim();
          if (inside) blockBody.push(inside);
          i++;
        } else {
          i++;
          while (i < lines.length && !lines[i].includes('}')) {
            blockBody.push(lines[i]);
            i++;
          }
          if (i < lines.length && lines[i].includes('}')) {
            const beforeClose = lines[i].replace('}', '').trim();
            if (beforeClose) blockBody.push(beforeClose);
            i++;
          }
        }

        // Evaluate condition safely
        const condResult = evaluateSimpleCondition(conditionStr, variables);
        steps.push({
          type: 'condition_check',
          message: `Checked if (${conditionStr}) ➔ ${condResult.value ? 'TRUE' : 'FALSE'}`,
          stateSnapshot: { ...state },
        });

        if (condResult.syntaxError) {
          return {
            success: false,
            error: condResult.syntaxError,
            errorType: 'misconception',
            steps,
            finalPetState: state,
            declaredVariables: variables,
            calledFunctions,
            collectedStars: state.starsCollected,
            stdout,
          };
        }

        if (condResult.value) {
          for (const actionLine of blockBody) {
            executeDirectAction(actionLine, state, variables, steps, stdout, calledFunctions);
          }
        }
        continue;
      }

      // 4. For loop: for (let i = 0; i < 3; i++) { ... }
      if (line.startsWith('for')) {
        const forMatch = line.match(/for\s*\(\s*let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(\d+)\s*;\s*\1\s*(<|<=|>|>=)\s*(\d+)\s*;\s*\1\+\+\s*\)\s*\{?/);
        if (!forMatch) {
          return {
            success: false,
            error: 'Check your for loop syntax! Example: for (let i = 0; i < 3; i++) { ... }',
            errorType: 'syntax',
            steps,
            finalPetState: state,
            declaredVariables: variables,
            calledFunctions,
            collectedStars: state.starsCollected,
            stdout,
          };
        }

        const varName = forMatch[1];
        const startVal = parseInt(forMatch[2], 10);
        const operator = forMatch[3];
        const endVal = parseInt(forMatch[4], 10);

        let blockBody: string[] = [];
        if (line.includes('{') && line.includes('}') && line.indexOf('}') > line.indexOf('{')) {
          const inside = line.substring(line.indexOf('{') + 1, line.lastIndexOf('}')).trim();
          if (inside) blockBody.push(inside);
          i++;
        } else {
          i++;
          while (i < lines.length && !lines[i].includes('}')) {
            blockBody.push(lines[i]);
            i++;
          }
          if (i < lines.length && lines[i].includes('}')) {
            const beforeClose = lines[i].replace('}', '').trim();
            if (beforeClose) blockBody.push(beforeClose);
            i++;
          }
        }

        let loopCount = 0;
        if (operator === '<') loopCount = Math.max(0, endVal - startVal);
        else if (operator === '<=') loopCount = Math.max(0, endVal - startVal + 1);

        if (loopCount > 20) loopCount = 20; // Safety cap

        steps.push({
          type: 'loop_iteration',
          message: `Started loop running ${loopCount} times (from ${startVal} to ${endVal})`,
          stateSnapshot: { ...state },
        });

        for (let iter = 0; iter < loopCount; iter++) {
          variables[varName] = startVal + iter;
          for (const actionLine of blockBody) {
            executeDirectAction(actionLine, state, variables, steps, stdout, calledFunctions, iter + 1);
          }
        }
        continue;
      }

      // 5. Function Definition: function name() { ... }
      if (line.startsWith('function')) {
        const funcMatch = line.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*\)\s*\{?/);
        if (!funcMatch) {
          return {
            success: false,
            error: 'Check function syntax: function functionName() { ... }',
            errorType: 'syntax',
            steps,
            finalPetState: state,
            declaredVariables: variables,
            calledFunctions,
            collectedStars: state.starsCollected,
            stdout,
          };
        }

        const fnName = funcMatch[1];
        let blockBody: string[] = [];
        if (line.includes('{') && line.includes('}') && line.indexOf('}') > line.indexOf('{')) {
          const inside = line.substring(line.indexOf('{') + 1, line.lastIndexOf('}')).trim();
          if (inside) blockBody.push(inside);
          i++;
        } else {
          i++;
          while (i < lines.length && !lines[i].includes('}')) {
            blockBody.push(lines[i]);
            i++;
          }
          if (i < lines.length && lines[i].includes('}')) {
            const beforeClose = lines[i].replace('}', '').trim();
            if (beforeClose) blockBody.push(beforeClose);
            i++;
          }
        }
        definedFunctions[fnName] = blockBody;
        steps.push({
          type: 'log',
          message: `Defined reusable function: ${fnName}()`,
          stateSnapshot: { ...state },
        });
        continue;
      }

      // 6. Direct Function Call or Action Call
      const callMatch = line.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*\);?$/);
      if (callMatch) {
        const fnName = callMatch[1];
        if (definedFunctions[fnName]) {
          calledFunctions.push(fnName);
          steps.push({
            type: 'log',
            message: `Called function ${fnName}()`,
            stateSnapshot: { ...state },
          });
          for (const innerLine of definedFunctions[fnName]) {
            executeDirectAction(innerLine, state, variables, steps, stdout, calledFunctions);
          }
        } else {
          executeDirectAction(line, state, variables, steps, stdout, calledFunctions);
        }
        i++;
        continue;
      }

      // Skip stray closing brackets
      if (line === '}') {
        i++;
        continue;
      }

      // Unsupported statement
      stdout.push(`Processed line: ${line}`);
      i++;
    }

    return {
      success: true,
      steps,
      finalPetState: state,
      declaredVariables: variables,
      calledFunctions,
      collectedStars: state.starsCollected,
      stdout,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during execution.',
      errorType: 'runtime',
      steps,
      finalPetState: state,
      declaredVariables: variables,
      calledFunctions,
      collectedStars: state.starsCollected,
      stdout,
    };
  }
}

function evaluateSimpleCondition(
  condStr: string,
  variables: Record<string, any>
): { value: boolean; syntaxError?: string } {
  // Check for reversed comparison or common patterns: hunger > 50, hunger < 50, hunger >= 50, hunger == 50
  const match = condStr.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(>|<|>=|<=|===|==|!=)\s*(\d+|"[^"]*"|'[^']*'|[a-zA-Z_$][a-zA-Z0-9_$]*)/);
  if (!match) {
    return { value: false, syntaxError: `Could not evaluate condition: "${condStr}". Try comparing like (hunger > 50)` };
  }

  const leftVar = match[1];
  const op = match[2];
  const rightRaw = match[3];

  let leftVal = variables[leftVar];
  if (leftVal === undefined) leftVal = 0;

  let rightVal: any = rightRaw;
  if (!isNaN(Number(rightRaw))) {
    rightVal = Number(rightRaw);
  } else if ((rightRaw.startsWith('"') && rightRaw.endsWith('"')) || (rightRaw.startsWith("'") && rightRaw.endsWith("'"))) {
    rightVal = rightRaw.slice(1, -1);
  } else if (variables[rightRaw] !== undefined) {
    rightVal = variables[rightRaw];
  }

  switch (op) {
    case '>':
      return { value: leftVal > rightVal };
    case '<':
      return { value: leftVal < rightVal };
    case '>=':
      return { value: leftVal >= rightVal };
    case '<=':
      return { value: leftVal <= rightVal };
    case '===':
    case '==':
      return { value: leftVal == rightVal };
    case '!=':
      return { value: leftVal != rightVal };
    default:
      return { value: false };
  }
}

function executeDirectAction(
  actionLine: string,
  state: PetState,
  variables: Record<string, any>,
  steps: ExecutionStep[],
  stdout: string[],
  calledFunctions: string[],
  iterationNumber?: number
) {
  const line = actionLine.replace(/;$/, '').trim();
  calledFunctions.push(line);

  if (line.includes('feed()')) {
    state.hunger = Math.max(0, state.hunger - 50);
    state.happiness = Math.min(100, state.happiness + 25);
    state.currentAction = 'eating';
    steps.push({
      type: 'action',
      action: 'feed',
      message: `fed your pet! Hunger decreased to ${state.hunger} 🍽️`,
      stateSnapshot: { ...state },
    });
  } else if (line.includes('play()')) {
    state.happiness = Math.min(100, state.happiness + 30);
    state.energy = Math.max(0, state.energy - 20);
    state.currentAction = 'playing';
    steps.push({
      type: 'action',
      action: 'play',
      message: `played together! Happiness increased to ${state.happiness} 🎾`,
      stateSnapshot: { ...state },
    });
  } else if (line.includes('clean()') || line.includes('bath()')) {
    state.cleanliness = 100;
    state.currentAction = 'bathing';
    steps.push({
      type: 'action',
      action: 'clean',
      message: `gave a warm bath! Cleanliness is now 100% 🧼`,
      stateSnapshot: { ...state },
    });
  } else if (line.includes('sleep()')) {
    state.energy = 100;
    state.currentAction = 'sleeping';
    steps.push({
      type: 'action',
      action: 'sleep',
      message: `cozy sleep! Energy restored to 100% 💤`,
      stateSnapshot: { ...state },
    });
  } else if (line.includes('move()')) {
    state.position = Math.min(4, state.position + 1);
    state.currentAction = 'moving';
    steps.push({
      type: 'action',
      action: 'move',
      message: `stepped forward to spot ${state.position} 🐾`,
      stateSnapshot: { ...state },
    });
  } else if (line.includes('collectStar()')) {
    state.starsCollected += 1;
    state.happiness = Math.min(100, state.happiness + 15);
    state.currentAction = 'celebrating';
    steps.push({
      type: 'action',
      action: 'collectStar',
      message: `collected star #${state.starsCollected}! ⭐`,
      stateSnapshot: { ...state },
    });
  } else {
    stdout.push(`Ran action: ${line}`);
  }
}
