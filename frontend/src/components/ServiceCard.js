
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