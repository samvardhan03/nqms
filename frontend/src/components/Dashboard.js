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