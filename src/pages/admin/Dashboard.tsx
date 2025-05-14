
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    corpuri: 0,
    materiale: 0,
    accesorii: 0,
    componente: 0,
    proiecte: 0
  });

  // Simulate loading data from API
  useEffect(() => {
    // In a real app, this would be fetched from your backend
    const loadStats = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats({
        corpuri: 87,
        materiale: 42,
        accesorii: 126,
        componente: 53,
        proiecte: 24
      });
    };
    
    loadStats();
  }, []);

  // Sample data for charts
  const chartData = [
    { name: 'Ian', projects: 4, revenue: 1200 },
    { name: 'Feb', projects: 7, revenue: 2400 },
    { name: 'Mar', projects: 5, revenue: 1800 },
    { name: 'Apr', projects: 8, revenue: 3200 },
    { name: 'Mai', projects: 12, revenue: 4800 },
    { name: 'Iun', projects: 10, revenue: 4000 },
    { name: 'Iul', projects: 9, revenue: 3600 },
    { name: 'Aug', projects: 11, revenue: 4400 },
    { name: 'Sep', projects: 13, revenue: 5200 },
    { name: 'Oct', projects: 15, revenue: 6000 },
    { name: 'Nov', projects: 17, revenue: 6800 },
    { name: 'Dec', projects: 19, revenue: 7600 },
  ];

  const pieData = [
    { name: 'Bucătărie', value: 35 },
    { name: 'Dormitor', value: 25 },
    { name: 'Living', value: 20 },
    { name: 'Baie', value: 10 },
    { name: 'Hol', value: 5 },
    { name: 'Birou', value: 5 },
  ];

  const COLORS = ['#2C3E50', '#2980B9', '#1ABC9C', '#F39C12', '#D35400', '#C0392B'];

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-3xl font-bold mb-8">Dashboard Administrator</h1>
      
      <div className="stats-container">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="stats-value">{stats.corpuri}</div>
            <div className="stats-label">Corpuri mobilier</div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="stats-value">{stats.materiale}</div>
            <div className="stats-label">Materiale</div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="stats-value">{stats.accesorii}</div>
            <div className="stats-label">Accesorii</div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="stats-value">{stats.proiecte}</div>
            <div className="stats-label">Proiecte active</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Proiecte Lunar</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2980B9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2980B9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="projects" 
                  stroke="#2980B9" 
                  fillOpacity={1} 
                  fill="url(#colorProjects)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribuție Tip Proiecte</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Venit Lunar (RON)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1ABC9C" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1ABC9C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1ABC9C" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
