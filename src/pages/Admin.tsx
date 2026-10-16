import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

const AdminPage = ({ 
    teamParticipations, setTeamParticipations, 
    volunteers, setVolunteers, 
    certDatabase, setCertDatabase 
}: any) => {
  const navigate = useNavigate();
  const [newMembers, setNewMembers] = useState([{ name: '', role: '', email: '' }]);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    teamParticipations.forEach((team: any) => {
      if (!qrCodes[team.id]) {
        QRCode.toDataURL(JSON.stringify(team)).then(url => {
          setQrCodes(prev => ({ ...prev, [team.id]: url }));
        });
      }
    });
  }, [teamParticipations]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        <header className="flex items-center justify-between mb-10 pb-6 border-b border-slate-200">
            <div>
                <h1 className="text-3xl font-black text-slate-900 font-heading">Management Portal</h1>
                <p className="text-slate-500 font-medium">Administrator Dashboard v1.0</p>
            </div>
            <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all">Back to Website</button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Team Participation Management */}
            <section className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm xl:col-span-2">
                <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-wider text-slate-400">Team Participation</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const newTeam = {
                            id: `tp-${Date.now()}`,
                            projectName: formData.get('projectName'),
                            teamLeader: formData.get('teamLeader'),
                            members: newMembers,
                            projectDescription: formData.get('projectDescription'),
                            award: formData.get('award'),
                            status: 'Pending'
                        };
                        setTeamParticipations([...teamParticipations, newTeam]);
                        e.currentTarget.reset();
                        setNewMembers([{ name: '', role: '', email: '' }]);
                      }}
                      className="space-y-4"
                    >
                        <input name="projectName" placeholder="Project Name" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        <input name="teamLeader" placeholder="Team Leader Name" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        <textarea name="projectDescription" placeholder="Project Description" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-600/20">Register Team</button>
                    </form>
                    
                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                        {teamParticipations.map((team: any) => (
                            <div key={team.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center bg-slate-50">
                                <div>
                                    <h4 className="font-bold text-slate-900">{team.projectName}</h4>
                                    <p className="text-xs text-slate-500">Leader: {team.teamLeader}</p>
                                    {qrCodes[team.id] && <img src={qrCodes[team.id]} alt="QR" className="w-12 h-12 mt-2 rounded border" />}
                                </div>
                                <button onClick={() => setTeamParticipations(teamParticipations.filter((t: any) => t.id !== team.id))} className="text-slate-400 hover:text-red-500 font-bold p-2">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="space-y-8">
                {/* Volunteer Management */}
                <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-wider text-slate-400">Volunteers</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const newVol = { id: `vol-${Date.now()}`, name: formData.get('name'), department: formData.get('department') };
                        setVolunteers([...volunteers, newVol]);
                        e.currentTarget.reset();
                    }} className="space-y-3">
                        <input name="name" placeholder="Volunteer Name" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        <select name="department" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                            <option value="Technical">Technical</option>
                            <option value="Logistics">Logistics</option>
                        </select>
                        <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm">Add Volunteer</button>
                    </form>
                </div>

                {/* Certificate Management */}
                <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-wider text-slate-400">Certificates</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const newCert = {
                            id: `CLB-${Math.floor(1000 + Math.random() * 9000)}`,
                            recipientName: formData.get('recipientName'),
                            achievementType: formData.get('achievementType'),
                            eventName: 'Event Name',
                            issueDate: '2026-10-31'
                        };
                        setCertDatabase([...certDatabase, newCert]);
                        e.currentTarget.reset();
                    }} className="space-y-3">
                        <input name="recipientName" placeholder="Recipient Name" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-purple-600/20">Generate Certificate</button>
                    </form>
                </div>
            </section>
        </div>
    </div>
  );
};

export default AdminPage;
