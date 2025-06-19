
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