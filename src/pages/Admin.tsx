import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { LayoutDashboard, Users, UserCheck, Award, Settings, Download, Plus, Trash2, Edit, CheckCircle, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminPage = ({ 
    teamParticipations, setTeamParticipations, 
    volunteers, setVolunteers, 
    certDatabase, setCertDatabase 
}: any) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    teamParticipations.forEach((team: any) => {
      if (!qrCodes[team.id]) {
        QRCode.toDataURL(JSON.stringify(team)).then(url => {
          setQrCodes(prev => ({ ...prev, [team.id]: url }));
        });
      }
    });
  }, [teamParticipations]);

  const exportCSV = (data: any[], filename: string) => {
    const csv = [Object.keys(data[0] || {}).join(','), ...data.map(d => Object.values(d).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'volunteers', label: 'Volunteers', icon: UserCheck },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredTeams = teamParticipations.filter((t: any) => t.projectName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 flex">
        <aside className="w-72 bg-slate-950 text-slate-400 p-6 flex flex-col shadow-xl">
            <h2 className="text-white font-black text-2xl mb-12 tracking-tight">COLLABS<span className="text-blue-500">.</span></h2>
            <nav className="space-y-3 flex-grow">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-900 hover:text-white'}`}>
                        <item.icon size={22} /> {item.label}
                    </button>
                ))}
            </nav>
            <button onClick={() => navigate('/')} className="text-sm font-semibold text-slate-500 hover:text-white">← Return to Website</button>
        </aside>

        <main className="flex-1 p-10 overflow-y-auto">
            <h1 className="text-3xl font-black text-slate-950 mb-8 capitalize">{activeTab} Overview</h1>
            
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Registered Teams', count: teamParticipations.length, color: 'text-blue-600' },
                            { label: 'Active Volunteers', count: volunteers.length, color: 'text-green-600' },
                            { label: 'Certs Issued', count: certDatabase.length, color: 'text-purple-600' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                <h4 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">{stat.label}</h4>
                                <p className={`text-5xl font-black ${stat.color}`}>{stat.count}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-80">
                        <h4 className="font-bold mb-6">Overview Metrics</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Teams', value: teamParticipations.length },
                                { name: 'Volunteers', value: volunteers.length },
                                { name: 'Certificates', value: certDatabase.length }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
            
            {activeTab === 'teams' && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8 gap-4">
                        <h3 className="text-xl font-bold">Manage Teams</h3>
                        <div className="flex items-center gap-2">
                            <Search className="text-slate-400" size={20} />
                            <input placeholder="Search teams..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="p-3 border border-slate-200 rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none" />
                            <button onClick={() => exportCSV(teamParticipations, 'teams.csv')} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold"><Download size={16}/> Export</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {filteredTeams.map((team: any) => (
                            <div key={team.id} className="p-5 border border-slate-100 rounded-2xl flex justify-between items-center bg-slate-50 hover:border-slate-200 transition-all">
                                <div className="flex items-center gap-4">
                                    {qrCodes[team.id] && <img src={qrCodes[team.id]} alt="QR" className="w-16 h-16 rounded-lg" />}
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{team.projectName}</h4>
                                        <p className="text-xs text-slate-500">Leader: {team.teamLeader} | Members: {team.members.length}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-slate-400 hover:text-blue-500"><Edit size={20} /></button>
                                    <button onClick={() => setTeamParticipations(teamParticipations.filter((t: any) => t.id !== team.id))} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={20} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'volunteers' && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold">Manage Volunteers</h3>
                        <button onClick={() => exportCSV(volunteers, 'volunteers.csv')} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold"><Download size={16}/> Export</button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); setVolunteers([...volunteers, { id: `vol-${Date.now()}`, name: formData.get('name'), department: formData.get('department') }]); e.currentTarget.reset(); }} className="flex gap-4 mb-8 bg-slate-50 p-4 rounded-2xl">
                        <input name="name" placeholder="Volunteer Name" required className="p-3 border rounded-xl flex-grow" />
                        <select name="department" className="p-3 border rounded-xl"><option value="Technical">Technical</option><option value="Logistics">Logistics</option></select>
                        <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus size={20}/> Add</button>
                    </form>
                    <div className="grid grid-cols-2 gap-4">
                        {volunteers.map((v: any) => (
                            <div key={v.id} className="p-4 border rounded-2xl flex justify-between items-center">
                                <span>{v.name} <span className="text-slate-400 text-xs">({v.department})</span></span>
                                <button onClick={() => setVolunteers(volunteers.filter((vol: any) => vol.id !== v.id))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'certificates' && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold">Manage Certificates</h3>
                        <button onClick={() => exportCSV(certDatabase, 'certs.csv')} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold"><Download size={16}/> Export</button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); setCertDatabase([...certDatabase, { id: `CLB-${Math.floor(1000 + Math.random() * 9000)}`, recipientName: formData.get('recipientName'), achievementType: 'Participation' }]); e.currentTarget.reset(); }} className="flex gap-4 mb-8 bg-slate-50 p-4 rounded-2xl">
                        <input name="recipientName" placeholder="Recipient Name" required className="p-3 border rounded-xl flex-grow" />
                        <button type="submit" className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus size={20}/> Generate</button>
                    </form>
                    <div className="grid grid-cols-2 gap-4">
                        {certDatabase.map((c: any) => (
                            <div key={c.id} className="p-4 border rounded-2xl flex justify-between items-center">
                                <span>{c.recipientName} <span className="text-slate-400 text-xs">({c.id})</span></span>
                                <button onClick={() => setCertDatabase(certDatabase.filter((cert: any) => cert.id !== c.id))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold">System Settings</h3>
                    <div className="flex justify-between items-center p-6 border rounded-2xl bg-slate-50">
                        <span>Registration Status</span>
                        <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">OPEN</span>
                    </div>
                    <div className="flex justify-between items-center p-6 border rounded-2xl bg-slate-50">
                        <span>Maintenance Mode</span>
                        <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm">Toggle</button>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
};

export default AdminPage;
