import fs from 'fs';

const filePath = '/app/applet/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const startMarker = '{/* Interactive Sub-Navigation Bar */}';
const endMarker = '{/* 6. Digital Certificate Generator & High-Fidelity Registry */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

// Find the section close tag before endMarker
const sectionClose = content.lastIndexOf('</section>', endIndex);

const newVolunteerContent = `            <div className="space-y-8 text-left">
              
              {/* Top Grid: Application Form + Teams Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Application Form */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <UserPlus size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">Apply as Volunteer</h3>
                        <p className="text-xs text-slate-500">Fill out your details to join the event operations crew</p>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const formData = new FormData(form);
                        const name = formData.get('name') as string;
                        const email = formData.get('email') as string;
                        const phone = formData.get('phone') as string;
                        const school = formData.get('school') as string;
                        const department = formData.get('department') as string;
                        const shift = formData.get('shift') as string;

                        if (!name || !email) return;

                        const newVol: VolunteerLog = {
                          id: \`vol-\${Date.now().toString().slice(-4)}\`,
                          name,
                          username: name.toLowerCase().replace(/\\s+/g, ''),
                          email,
                          phone: phone || '+92 300 0000000',
                          school: school || 'Local Institution',
                          role: \`\${department} Crew\`,
                          department: department || 'General',
                          hours: 0,
                          station: 'Booni Exhibition Venue',
                          shiftTime: shift || '09:00 AM – 05:00 PM PKT',
                          checkedIn: false,
                          duties: \`Assigned to \${department} team.\`,
                          dateJoined: 'Oct 2026',
                          status: 'Verified Active',
                          assignedTasks: ['Report to team lead on 31 Oct at 08:30 AM'],
                          completedTasks: []
                        };

                        setVolunteers([newVol, ...volunteers]);
                        setVolunteerSuccessMsg(\`Thank you, \${name}! Your application for \${department} crew has been registered.\`);
                        form.reset();
                        setTimeout(() => setVolunteerSuccessMsg(''), 5000);
                      }}
                      className="space-y-4"
                    >
                      {volunteerSuccessMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                          <span>{volunteerSuccessMsg}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Zahid Hussain"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="e.g. zahid@collabs.org"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                          <input
                            type="text"
                            name="phone"
                            placeholder="+92 345 0000000"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">School / Institution</label>
                          <input
                            type="text"
                            name="school"
                            placeholder="e.g. Booni Degree College"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Department</label>
                          <select
                            name="department"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          >
                            <option value="Venue Operations">Venue Operations & Logistics</option>
                            <option value="Technical">Tech & Registration Support</option>
                            <option value="Media & Coverage">Media & Coverage</option>
                            <option value="Guest Hospitality">Guest Hospitality & Protocol</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Shift</label>
                          <select
                            name="shift"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                          >
                            <option value="08:00 AM – 01:00 PM PKT">Morning Shift (08:00 AM - 01:00 PM)</option>
                            <option value="01:00 PM – 06:00 PM PKT">Afternoon Shift (01:00 PM - 06:00 PM)</option>
                            <option value="08:00 AM – 06:00 PM PKT">Full Event Day (08:00 AM - 06:00 PM)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      >
                        <UserPlus size={16} />
                        <span>Submit Volunteer Application</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Volunteer Teams / Departments Overview */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Volunteer Departments</h3>
                      <p className="text-xs text-slate-500">Key teams supporting the Booni Exhibition</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 font-bold text-xs text-blue-900 mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Venue Operations & Logistics
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Assist with seating, stage setup, crowd guidance, and equipment management at the main hall.
                      </p>
                      <span className="inline-block mt-3 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Shift: 08:00 AM - 06:00 PM
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Tech & Registration
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Manage helpdesk check-ins, barcode verification, screen displays, and projector hardware.
                      </p>
                      <span className="inline-block mt-3 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Shift: 08:00 AM - 02:30 PM
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 font-bold text-xs text-purple-900 mb-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Media & Coverage
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Capture photography, record team presentations, conduct interviews, and handle social updates.
                      </p>
                      <span className="inline-block mt-3 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Shift: 09:00 AM - 05:00 PM
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Guest Hospitality
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Welcome guest speakers, mentors, institutional leads, and assist with refreshments and schedules.
                      </p>
                      <span className="inline-block mt-3 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Shift: 08:30 AM - 04:30 PM
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Registered Crew Roster Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Users size={18} className="text-blue-600" />
                      <span>Registered Crew Roster ({volunteers.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500">Confirmed volunteer team members for Collabs Booni Event</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                        <th className="py-3 px-3">Volunteer Name</th>
                        <th className="py-3 px-3">Department & Role</th>
                        <th className="py-3 px-3">Institution</th>
                        <th className="py-3 px-3">Shift & Station</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {volunteers.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            <div>{v.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{v.email}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-800">{v.role}</span>
                            <div className="text-[10px] text-slate-500">{v.department}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{v.school || 'Collabs Crew'}</td>
                          <td className="py-3 px-3 text-slate-600">
                            <div>{v.shiftTime}</div>
                            <div className="text-[10px] text-slate-400">{v.station}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={\`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold \${
                              v.status === 'Lead Volunteer'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }\`}>
                              <CheckCircle size={10} />
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      `;

const updatedContent = content.slice(0, startIndex) + newVolunteerContent + content.slice(endIndex);
fs.writeFileSync(filePath, updatedContent, 'utf-8');
console.log('Successfully updated Volunteer section!');
