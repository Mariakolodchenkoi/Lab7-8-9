const monitoringSystem = {
  totalRequests: 0,
  successfulRequests: 0,
  blockedRequests: 0,
  authFailures: 0,
  showMetrics() {
    console.log(`\nMONITORING DASHBOARD`);
    console.log(` Total Requests: ${this.totalRequests}`);
    console.log(` Successful Requests: ${this.successfulRequests}`);
    console.log(` Blocked Requests (Rate Limit): ${this.blockedRequests}`);
    console.log(` Authentication Failures (401): ${this.authFailures}`);
  }
};

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
  let requestCount = 0;
  let lastReset = Date.now();

  return new Proxy(targetService, {
    get(target, prop) {
      if (prop === 'fetchData') {
        return async function (endpoint, options = {}) {
            monitoringSystem.totalRequests++;

          console.log(`[Proxy Log] [${new Date().toLocaleTimeString()}] Request to ${endpoint}`);
    
          const now = Date.now();
          if (now - lastReset > 1000) {
            requestCount = 0;
            lastReset = now;
          }
          requestCount++;
          
          if (requestCount > 2) {
            console.log(`[Proxy Blocked] Request to ${endpoint} Denied`);
            if (typeof monitoringSystem !== 'undefined') monitoringSystem.blockedRequests++;
            return { status: 429, error: "Too many requests. Rate limit exceeded." };
          }

          options.headers = options.headers || {};
          if (authStrategy.token) {
            if (authStrategy.type === 'JWT' || authStrategy.type === 'OAuth') {
              options.headers['Authorization'] = `Bearer ${authStrategy.token}`;
            } else if (authStrategy.type === 'ApiKey') {
              options.headers['X-API-Key'] = authStrategy.token;
            }
          }

          const startTime = performance.now();
          const response = await target[prop].apply(target, [endpoint, options]);
          const endTime = performance.now();
          const duration = (endTime - startTime).toFixed(2);
          
          console.log(`[Proxy Monitor] Request to ${endpoint} processed in ${duration}ms (Status: ${response.status})`);

          return response;
        };
      }
      return target[prop];
    }
  });
};