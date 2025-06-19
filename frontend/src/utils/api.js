const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const api = {
  async fetchServices() {
    const response = await fetch(`${API_BASE_URL}/api/services`);
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    return response.json();
  },

  async fetchServiceDetails(resourceGroup, loadBalancerName) {
    const response = await fetch(`${API_BASE_URL}/api/services/${resourceGroup}/${loadBalancerName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch service details');
    }
    return response.json();
  },

  async fetchBackendPool(resourceGroup, loadBalancerName, poolName) {
    const response = await fetch(`${API_BASE_URL}/api/services/${resourceGroup}/${loadBalancerName}/pools/${poolName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch backend pool');
    }
    return response.json();
  },

  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }
};