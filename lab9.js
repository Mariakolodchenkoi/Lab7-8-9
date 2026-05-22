const LOG_LEVELS = { DEBUG: 0, INFO: 1, ERROR: 2 };
let SYSTEM_LOG_LEVEL = LOG_LEVELS.DEBUG; 

function log(config = { level: 'INFO' }) {
  return function (targetFunc) {
    return async function (...args) {
      const currentLevel = LOG_LEVELS[config.level];
      const timestamp = new Date().toISOString();

      if (currentLevel >= SYSTEM_LOG_LEVEL) {
        console.log(`[${timestamp}] [${config.level}] Виклик функції: "${targetFunc.name}"`);
        console.log(`[${timestamp}] [${config.level}] Аргументи:`, args);
      }

      try {
        const result = await targetFunc.apply(this, args);

        if (currentLevel >= SYSTEM_LOG_LEVEL) {
          console.log(`[${new Date().toISOString()}] [${config.level}] Результат:`, result);
        }
        return result;
      } catch (error) {
        console.error(`[${new Date().toISOString()}] [ERROR] Exception in "${targetFunc.name}": ${error.message}`);
        throw error; 
      }
    };
  };
}