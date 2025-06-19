
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