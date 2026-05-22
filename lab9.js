const LOG_LEVELS = { DEBUG: 0, INFO: 1, ERROR: 2 };
let SYSTEM_LOG_LEVEL = LOG_LEVELS.DEBUG; 

function log(config = { level: 'INFO' }) {
  return function (targetFunc) {
    return async function (...args) {
      const currentLevel = LOG_LEVELS[config.level];
      const timestamp = new Date().toISOString();

      if (currentLevel >= SYSTEM_LOG_LEVEL) {
        console.log(`[${timestamp}] [${config.level}] Calling function: "${targetFunc.name}"`);
        console.log(`[${timestamp}] [${config.level}] Arguments:`, args);
      }

      try {
        const startTime = performance.now();
        
        const result = await targetFunc.apply(this, args);
        
        const endTime = performance.now(); 
        const executionTime = (endTime - startTime).toFixed(2);

        if (currentLevel >= SYSTEM_LOG_LEVEL) {
          console.log(`[${new Date().toISOString()}] [${config.level}] Result:`, result);
          console.log(`[${new Date().toISOString()}] [PROFILE] Function "${targetFunc.name}" executed in ${executionTime}ms`);
        }
        return result;
      } catch (error) {
        console.error(`[${new Date().toISOString()}] [ERROR] Exception in "${targetFunc.name}": ${error.message}`);
        throw error;
      }
      }
    };
  };
