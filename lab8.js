const apiService = {
  async fetchData(endpoint, options = {}) {
    const delay = Math.floor(Math.random() * 200) + 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    const headers = options.headers || {};

    if (!headers['Authorization'] && !headers['X-API-Key']) {
      if (typeof monitoringSystem !== 'undefined') monitoringSystem.authFailures++;
      return { status: 401, error: "Unauthorized: Invalid or missing token" };
    }

    if (typeof monitoringSystem !== 'undefined') monitoringSystem.successfulRequests++;
    return { status: 200, data: `${endpoint}` };
  }
};

const createAuthProxy = (targetService, authStrategy) => {
  return new Proxy(targetService, {
    get(target, prop) {
      if (prop === 'fetchData') {
        return async function (endpoint, options = {}) {
          options.headers = options.headers || {};
          
          if (authStrategy.token) {
            if (authStrategy.type === 'JWT' || authStrategy.type === 'OAuth') {
              options.headers['Authorization'] = `Bearer ${authStrategy.token}`;
            } else if (authStrategy.type === 'ApiKey') {
              options.headers['X-API-Key'] = authStrategy.token;
            }
          }

          return target[prop].apply(target, [endpoint, options]);
        };
      }
      return target[prop];
    }
  });
};