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