import React, { useState, useEffect, useCallback } from 'react';
import { 
  Server, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings,
  Network,
  Globe,
  Monitor,
  Clock,
  MapPin,
  Layers,
  Wifi,
  WifiOff
} from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';

// Header Component
const Header = ({ totalServices, healthyServices, degradedServices, unhealthyServices, lastUpdate, connectionStatus, onRefresh, isRefreshing }) => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Monitor className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">NIQ Service Monitor</h1>
            <p className="text-blue-100 text-sm">Azure Load Balancer Health Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <Wifi className="h-5 w-5 text-green-300" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-300" />
            )}
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' ? 'Live Updates' : 'Reconnecting...'}
            </span>
          </div>
          
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="font-medium">Refresh</span>
          </button>
        </div>
      </div>
    </div>

    {/* Stats Bar */}
    <div className="bg-white/10 backdrop-blur-sm border-t border-blue-500/20 px-6 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Server className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-blue-100 text-sm">Total Services</p>
            <p className="text-2xl font-bold">{totalServices}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-300" />
          </div>
          <div>
            <p className="text-blue-100 text-sm">Healthy</p>
            <p className="text-2xl font-bold text-green-300">{healthyServices}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-300" />
          </div>
          <div>
            <p className="text-blue-100 text-sm">Degraded</p>
            <p className="text-2xl font-bold text-yellow-300">{degradedServices}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <XCircle className="h-6 w-6 text-red-300" />
          </div>
          <div>
            <p className="text-blue-100 text-sm">Unhealthy</p>
            <p className="text-2xl font-bold text-red-300">{unhealthyServices}</p>
          </div>
        </div>
      </div>
      
      {lastUpdate && (
        <div className="mt-4 flex items-center space-x-2 text-blue-100 text-sm">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdate.toLocaleString()}</span>
        </div>
      )}
    </div>
  </div>
);

// Service Card Component
const ServiceCard = ({ service, onClick }) => {
  const getServiceHealth = (service) => {
    if (!service.backendPools || service.backendPools.length === 0) {
      return { status: 'unknown', healthy: 0, total: 0 };
    }
    
    let healthy = 0;
    let total = 0;
    
    service.backendPools.forEach(pool => {
      pool.addresses.forEach(addr => {
        total++;
        if (addr.provisioningState === 'Succeeded') {
          healthy++;
        }
      });
    });
    
    const status = healthy === total ? 'healthy' : 
                   healthy > 0 ? 'degraded' : 'unhealthy';
    
    return { status, healthy, total };
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'healthy':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'degraded':
        return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'unhealthy':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const health = getServiceHealth(service);
  const { icon: StatusIcon, color, bg, border } = getStatusDisplay(health.status);
  
  return (
    <div 
      className={`bg-white border-2 ${border} rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1`}
      onClick={() => onClick(service)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${bg}`}>
            <Server className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{service.loadBalancerName}</h3>
            <p className="text-sm text-gray-500">{service.resourceGroupName}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full ${bg} flex items-center space-x-2`}>
          <StatusIcon className={`h-4 w-4 ${color}`} />
          <span className={`text-sm font-semibold ${color}`}>
            {health.healthy}/{health.total}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Location</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{service.location}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Backend Pools</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{service.backendPools?.length || 0}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Last Check</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {new Date(service.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      {/* Health indicator bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Health Status</span>
          <span>{Math.round((health.healthy / health.total) * 100) || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              health.status === 'healthy' ? 'bg-green-500' :
              health.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${(health.healthy / health.total) * 100 || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Service Detail Modal Component
const ServiceDetail = ({ service, onClose }) => {
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'healthy':
        return { icon: CheckCircle, color: 'text-green-600' };
      case 'degraded':
        return { icon: AlertTriangle, color: 'text-yellow-600' };
      case 'unhealthy':
        return { icon: XCircle, color: 'text-red-600' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-500' };
    }
  };

  const getServiceHealth = (service) => {
    if (!service.backendPools || service.backendPools.length === 0) {
      return { status: 'unknown', healthy: 0, total: 0 };
    }
    
    let healthy = 0;
    let total = 0;
    
    service.backendPools.forEach(pool => {
      pool.addresses.forEach(addr => {
        total++;
        if (addr.provisioningState === 'Succeeded') {
          healthy++;
        }
      });
    });
    
    const status = healthy === total ? 'healthy' : 
                   healthy > 0 ? 'degraded' : 'unhealthy';
    
    return { status, healthy, total };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Server className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{service.loadBalancerName}</h2>
                <p className="text-gray-500 font-medium">{service.resourceGroupName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Service Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Service Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Resource Group</p>
                    <p className="font-semibold text-gray-900">{service.resourceGroupName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{service.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Frontend IP</p>
                    <p className="font-semibold text-gray-900">{service.frontendIPAddress || 'Not configured'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <p className="font-semibold text-gray-900">{new Date(service.lastUpdated).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Health Summary</h3>
                <div className="space-y-3">
                  {service.backendPools?.map((pool, index) => {
                    const healthy = pool.addresses.filter(addr => 
                      addr.provisioningState === 'Succeeded'
                    ).length;
                    const total = pool.addresses.length;
                    const health = getServiceHealth({ backendPools: [pool] });
                    const { icon: StatusIcon, color } = getStatusDisplay(health.status);
                    
                    return (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`h-5 w-5 ${color}`} />
                          <span className="text-sm font-medium text-gray-700">{pool.name}</span>
                        </div>
                        <div className="text-sm font-bold text-gray-900">{healthy}/{total}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Backend Pools Detail */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Backend Pool Details</h3>
            {service.backendPools?.map((pool, poolIndex) => (
              <div key={poolIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-bold text-gray-800">{pool.name}</h4>
                  <p className="text-sm text-gray-600">{pool.addresses.length} backend instances</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Health Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provisioning State
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instance ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pool.addresses.map((addr, addrIndex) => {
                        const isHealthy = addr.provisioningState === 'Succeeded';
                        return (
                          <tr key={addrIndex} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <Globe className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {addr.privateIPAddress || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {isHealthy ? (
                                  <>
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                      Healthy
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                      Unhealthy
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                addr.provisioningState === 'Succeeded' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {addr.provisioningState}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {addr.id ? addr.id.split('/').pop() : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const MonitoringDashboard = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // WebSocket connection
  const { connectionStatus, lastMessage } = useWebSocket('ws://localhost:3001');

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'INITIAL_DATA') {
        setServices(lastMessage.data);
        setLoading(false);
      } else if (lastMessage.type === 'HEALTH_UPDATE') {
        setServices(prev => {
          const updated = [...prev];
          const index = updated.findIndex(s => 
            s.loadBalancerName === lastMessage.data.loadBalancerName &&
            s.resourceGroupName === lastMessage.data.resourceGroupName
          );
          
          if (index !== -1) {
            updated[index] = lastMessage.data;
          } else {
            updated.push(lastMessage.data);
          }
          
          return updated;
        });
        setLastUpdate(new Date());
      }
    }
  }, [lastMessage]);

  // Initial data fetch
  const fetchServices = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('http://localhost:3001/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      
      const data = await response.json();
      setServices(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      fetchServices();
    }
  }, [connectionStatus, fetchServices]);

  // Calculate service statistics
  const getServiceStats = () => {
    const getServiceHealth = (service) => {
      if (!service.backendPools || service.backendPools.length === 0) {
        return 'unknown';
      }
      
      let healthy = 0;
      let total = 0;
      
      service.backendPools.forEach(pool => {
        pool.addresses.forEach(addr => {
          total++;
          if (addr.provisioningState === 'Succeeded') {
            healthy++;
          }
        });
      });
      
      return healthy === total ? 'healthy' : 
             healthy > 0 ? 'degraded' : 'unhealthy';
    };

    const healthyServices = services.filter(s => getServiceHealth(s) === 'healthy').length;
    const degradedServices = services.filter(s => getServiceHealth(s) === 'degraded').length;
    const unhealthyServices = services.filter(s => getServiceHealth(s) === 'unhealthy').length;

    return {
      total: services.length,
      healthy: healthyServices,
      degraded: degradedServices,
      unhealthy: unhealthyServices
    };
  };

  const stats = getServiceStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading monitoring data...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to Azure services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        totalServices={stats.total}
        healthyServices={stats.healthy}
        degradedServices={stats.degraded}
        unhealthyServices={stats.unhealthy}
        lastUpdate={lastUpdate}
        connectionStatus={connectionStatus}
        onRefresh={fetchServices}
        isRefreshing={isRefreshing}
      />

      <div className="px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">Error: {error}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard 
              key={`${service.resourceGroupName}/${service.loadBalancerName}`} 
              service={service} 
              onClick={setSelectedService}
            />
          ))}
        </div>
        
        {services.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Network className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-600 mb-4">
              Make sure your Azure credentials are configured and you have access to load balancers.
            </p>
            <button
              onClick={fetchServices}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>

      {selectedService && (
        <ServiceDetail 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
};

export default MonitoringDashboard;