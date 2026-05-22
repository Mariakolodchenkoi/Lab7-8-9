const LOG_LEVELS = { DEBUG: 0, INFO: 1, ERROR: 2 };
let SYSTEM_LOG_LEVEL = LOG_LEVELS.DEBUG;

const formatters = {
  text: (ctx) => `[${ctx.timestamp}] [${ctx.level}] Function: "${ctx.name}" | Arguments: ${JSON.stringify(ctx.arguments)} | Result: ${JSON.stringify(ctx.result || ctx.error)} | Time: ${ctx.time ? ctx.time + 'ms' : 'N/A'}`,
  json: (ctx) => JSON.stringify(ctx, null, 2)
};

function log(config = { level: 'INFO', format: 'text' }) {
  const formatter = formatters[config.format || 'text'];

  return function (targetFunc) {
    return async function (...args) {
      const currentLevel = LOG_LEVELS[config.level];
      const startTime = performance.now();

      try {
        const result = await targetFunc.apply(this, args);
        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);

        if (currentLevel >= SYSTEM_LOG_LEVEL) {
          const logContext = {
            timestamp: new Date().toISOString(),
            level: config.level,
            name: targetFunc.name,
            arguments: args,
            result: result,
            time: executionTime
          };
          console.log(formatter(logContext));
        }
        return result;
      } catch (error) {
        const logContext = {
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          name: targetFunc.name,
          arguments: args,
          error: error.message
        };
        console.error(formatter(logContext));
        throw error;
      }
    };
  };
}

function add(a, b) { 
  return a + b; 
}

async function fetchUserData(userId) {
  return new Promise(resolve => setTimeout(() => resolve({ id: userId, role: "KPI Student" }), 300));
}

function dangerousTask() { 
  throw new Error("Error: Something went wrong in dangerousTask"); 
}

const loggedAdd = log({ level: 'INFO', format: 'text' })(add);
const loggedFetch = log({ level: 'DEBUG', format: 'json' })(fetchUserData);
const loggedDanger = log({ level: 'ERROR', format: 'text' })(dangerousTask);

(async () => {
  console.log("Async test (INFO, TEXT)\n");
  await loggedAdd(25, 17);

  console.log("\nAsync test (DEBUG, JSON)");
  await loggedFetch("user_id_mariia_kolodchenko");

  console.log("\nConditional error logging test (ERROR)");
  try {
    await loggedDanger();
  } catch (e) {
    console.log("\nError was logged as expected.");
  }
})();