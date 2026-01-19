// Hospital Dashboard Logic
function loadHospitalDashboard(userData) {
    const subtitle = document.getElementById('dashboard-subtitle');
    subtitle.textContent = `${userData.name} - Management Portal`;

    const allUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const patients = allUsers.filter(u => u.role === 'patient');
    const prescriptions = JSON.parse(localStorage.getItem('prescriptions')) || [];

    const newToday = patients.filter(p => {
        const createdDate = new Date(p.createdAt);
        const today = new Date();
        return createdDate.toDateString() === today.toDateString();
    }).length;

    document.getElementById('dashboard-content').innerHTML = `
        <!-- Hospital Stats Grid with Trends -->
        <div class="stats-grid" style="margin-bottom: 40px;">
            <div class="stat-card" style="position: relative; overflow: hidden;">
                <div style="position: absolute; top: 10px; right: 10px; background: #e3f2fd; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; color: #0288d1;">
                    <i class="ph-fill ph-trend-up" style="font-size: 12px;"></i> Active
                </div>
                <div class="stat-icon" style="background: linear-gradient(135deg, #e3f2fd, #bbdefb);">
                    <i class="ph-fill ph-users" style="color: #0288d1;"></i>
                </div>
                <div class="stat-info">
                    <h3>${patients.length}</h3>
                    <p>Total Patients</p>
                </div>
            </div>

            <div class="stat-card" style="position: relative; overflow: hidden;">
                <div style="position: absolute; top: 10px; right: 10px; background: #fff3e0; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; color: #f57c00;">
                    ${prescriptions.length} Total
                </div>
                <div class="stat-icon" style="background: linear-gradient(135deg, #fff3e0, #ffe0b2);">
                    <i class="ph-fill ph-file-text" style="color: #f57c00;"></i>
                </div>
                <div class="stat-info">
                    <h3>${prescriptions.length}</h3>
                    <p>Prescriptions</p>
                </div>
            </div>

            <div class="stat-card" style="position: relative; overflow: hidden;">
                <div style="position: absolute; top: 10px; right: 10px; background: #e8f5e9; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; color: #388e3c;">
                    ${newToday > 0 ? '+' + newToday : '0'} Today
                </div>
                <div class="stat-icon" style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9);">
                    <i class="ph-fill ph-user-circle-plus" style="color: #388e3c;"></i>
                </div>
                <div class="stat-info">
                    <h3>${newToday}</h3>
                    <p>New Registrations</p>
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px;">
            <!-- Left Column -->
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <!-- Quick Access -->
                <div>
                    <h2 style="margin-bottom: 16px; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                        <i class="ph-fill ph-rocket-launch" style="color: #0288d1;"></i>
                        Quick Access
                    </h2>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <a href="patients.html" class="stat-card" style="text-decoration: none; cursor: pointer; padding: 20px; transition: all 0.3s;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 52px; height: 52px; background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <i class="ph-fill ph-users" style="font-size: 26px; color: #0288d1;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <h4 style="font-size: 1rem; margin-bottom: 2px;">Patient Records</h4>
                                    <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">View & manage patients</p>
                                </div>
                                <i class="ph ph-arrow-right" style="font-size: 18px; color: var(--text-muted);"></i>
                            </div>
                        </a>

                        <a href="assistant.html" class="stat-card" style="text-decoration: none; cursor: pointer; padding: 20px; transition: all 0.3s;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 52px; height: 52px; background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <i class="ph-fill ph-chat-circle-dots" style="font-size: 26px; color: #388e3c;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <h4 style="font-size: 1rem; margin-bottom: 2px;">AI Assistant</h4>
                                    <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Medical information</p>
                                </div>
                                <i class="ph ph-arrow-right" style="font-size: 18px; color: var(--text-muted);"></i>
                            </div>
                        </a>

                        <a href="profile.html" class="stat-card" style="text-decoration: none; cursor: pointer; padding: 20px; transition: all 0.3s;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 52px; height: 52px; background: linear-gradient(135deg, #fff3e0, #ffe0b2); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <i class="ph-fill ph-gear" style="font-size: 26px; color: #f57c00;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <h4 style="font-size: 1rem; margin-bottom: 2px;">Settings</h4>
                                    <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Hospital configuration</p>
                                </div>
                                <i class="ph ph-arrow-right" style="font-size: 18px; color: var(--text-muted);"></i>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- System Status -->
                <div style="background: linear-gradient(135deg, #0288d1, #01579b); padding: 28px; border-radius: 16px; box-shadow: var(--shadow-lg); color: white;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                        <i class="ph-fill ph-activity"></i>
                        System Overview
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.2);">
                            <span style="opacity: 0.9; font-size: 0.95rem;">Database</span>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%;"></div>
                                <strong style="font-size: 0.9rem;">Online</strong>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.2);">
                            <span style="opacity: 0.9; font-size: 0.95rem;">Total Records</span>
                            <strong style="font-size: 1.2rem;">${patients.length + prescriptions.length}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="opacity: 0.9; font-size: 0.95rem;">Last Updated</span>
                            <strong style="font-size: 0.9rem;">Just now</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div>
                <!-- Recent Activity -->
                <h2 style="margin-bottom: 16px; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                    <i class="ph-fill ph-clock-clockwise" style="color: #0288d1;"></i>
                    Recent Activity
                </h2>
                <div style="background: var(--card-bg); padding: 24px; border-radius: 16px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); max-height: 520px; overflow-y: auto;">
                    ${patients.length > 0 ? patients.slice(0, 6).map((patient, index) => `
                        <div style="padding: 16px; margin-bottom: 12px; background: ${index % 2 === 0 ? 'var(--bg-color)' : 'var(--card-bg)'}; border-radius: 10px; border-left: 3px solid #0288d1;">
                            <div style="display: flex; align-items: start; gap: 12px;">
                                <div style="width: 42px; height: 42px; background: linear-gradient(135deg, #e3f2fd, #bbdefb); color: #0288d1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0;">
                                    ${patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                                        <h4 style="font-size: 0.95rem; margin: 0; font-weight: 600;">${patient.name}</h4>
                                        <span style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; margin-left: 8px;">
                                            ${patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Recently'}
                                        </span>
                                    </div>
                                    <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 6px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${patient.email}</p>
                                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                        ${patient.age ? `<span style="background: #e3f2fd; color: #0288d1; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">${patient.age} yrs</span>` : ''}
                                        ${patient.gender ? `<span style="background: #e8f5e9; color: #388e3c; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; text-transform: capitalize;">${patient.gender}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('') : `
                        <div style="text-align: center; padding: 60px 20px;">
                            <i class="ph ph-users" style="font-size: 64px; color: var(--text-muted); opacity: 0.3;"></i>
                            <p style="color: var(--text-muted); margin-top: 16px;">No patient activity yet</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}
