import React from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Users, MousePointerClick, Database, ServerOff, AlertTriangle } from 'lucide-react';

export function Admin() {
  const { getTotalUsage, totalTimeOnWebsite, totalVisitors, toolVisitors, isFirebaseConnected, firebaseError } = useAnalytics();

  const totalUsage = getTotalUsage();
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const toolVisitorsData = Object.entries(toolVisitors || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
    value: Number(value)
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <div className="text-sm text-slate-500 mt-1">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        {/* Database Connection Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
          firebaseError === 'permission-denied' || firebaseError === 'unavailable'
            ? 'bg-green-950/40 text-red-700 border-red-200'
            : isFirebaseConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {firebaseError === 'permission-denied' ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>Database Access Denied (Check Rules)</span>
            </>
          ) : firebaseError === 'unavailable' ? (
            <>
              <ServerOff className="w-4 h-4" />
              <span>Database Unreachable (Offline or Not Created)</span>
            </>
          ) : isFirebaseConnected ? (
            <>
              <Database className="w-4 h-4" />
              <span>Global Database Connected</span>
            </>
          ) : (
            <>
              <ServerOff className="w-4 h-4" />
              <span>Local Storage Mode (No Database)</span>
            </>
          )}
        </div>
      </div>

      {firebaseError === 'permission-denied' && (
        <div className="bg-green-950/40 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
          <h4 className="font-semibold flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Firebase Security Rules are blocking access
          </h4>
          <p className="mb-2">Your Firebase database is connected, but it is currently in "Production Mode" which blocks all read and write access by default.</p>
          <p className="font-medium">How to fix this:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1 ml-1">
            <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-semibold">Firebase Console</a>.</li>
            <li>Click on <strong>Firestore Database</strong> in the left menu.</li>
            <li>Click the <strong>Rules</strong> tab at the top.</li>
            <li>Change the rules to: <code>allow read, write: if true;</code></li>
            <li>Click <strong>Publish</strong>.</li>
          </ol>
        </div>
      )}

      {firebaseError === 'unavailable' && (
        <div className="bg-green-950/40 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
          <h4 className="font-semibold flex items-center gap-2 mb-2">
            <ServerOff className="w-4 h-4" />
            Could not reach Cloud Firestore backend
          </h4>
          <p className="mb-2">The app is trying to connect to Firebase, but the connection is failing. This usually happens for one of three reasons:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1 ml-1">
            <li><strong>Database Not Created:</strong> You created a Firebase project, but forgot to click the "Create Database" button under the "Firestore Database" tab in the Firebase Console.</li>
            <li><strong>Ad Blockers:</strong> You are using an ad blocker (like uBlock Origin) or a privacy browser (like Brave) that is blocking the connection to Google's servers. Try disabling your ad blocker for this site.</li>
            <li><strong>Incorrect Project ID:</strong> The <code>VITE_FIREBASE_PROJECT_ID</code> in your Secrets panel is incorrect.</li>
          </ol>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Operations</h3>
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalUsage}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Time on Website</h3>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatTime(totalTimeOnWebsite)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Visitors</h3>
            <Users className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalVisitors}</p>
        </div>
      </div>

      {/* Tool Wise Visitors Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Tool-wise Visitors</h3>
          <MousePointerClick className="w-5 h-5 text-blue-500" />
        </div>
        
        {toolVisitorsData.length > 0 ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={toolVisitorsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No visitor data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
