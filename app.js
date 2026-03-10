// Main Application Logic - Interactive Career Mindmap

// --- STATE MANAGEMENT ---
let currentUser = null;
let currentTransform = { x: 50, y: 50, scale: 0.85 }; // Initial zoom/pan
let isDragging = false;
let startPos = { x: 0, y: 0 };
let activeNodeId = null;
let localMapData = null; // Merged data instance
let currentStreakCount = 0;
let lastActiveDate = null;

const X_SPACING = 380;
const Y_SPACING = 140;

// Gamification Data
const BADGES = [
    { id: 'gladiator', name: 'Gladiator', days: 3, img: 'badges/Gladiator.jpeg', msg: "First of many , keep up the good work" },
    { id: 'warrior', name: 'Warrior', days: 7, img: 'badges/Warrior.jpeg', msg: "You've passed a week, but darker days lay ahead" },
    { id: 'knight', name: 'Knight', days: 14, img: 'badges/Knight.jpeg', msg: "Congratulations, I hearby knight you in the sigh of God and men" },
    { id: 'general', name: 'General', days: 21, img: 'badges/General.jpeg', msg: "Nobody said getting a job will be easy, but a General like you should lead us to brighter days" },
    { id: 'monarch', name: 'Monarch', days: 30, img: 'badges/Monarch.jpeg', msg: "One month of personal developement. A crown , fit for its rightfull King" },
    { id: 'emperor', name: 'Emperor', days: 60, img: 'badges/Empror.jpeg', msg: "2 months of consecutive grind , only an Empror have the right set of balls for it" },
    { id: 'overlord', name: 'GTR Overlord', days: 180, img: 'badges/overlord.png', msg: "Congratulations , you have obtained the final badges, but this doesn't mean the journey is over. Now is the time to get some real bread" }
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupAuthListeners();
    checkAuthSession();
});

// --- AUTHENTICATION MODULE (Mock via LocalStorage) ---
function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const goToReg = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');
    const logoutBtn = document.getElementById('logout-btn');

    goToReg.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        clearAuthError();
    });

    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        clearAuthError();
    });

    // Import / Export Event Listeners
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importInput = document.getElementById('import-input');

    exportBtn.addEventListener('click', () => {
        if (!currentUser) return;
        const progressData = localStorage.getItem(`progress_${currentUser}`) || '{}';
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(progressData);
        
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", `roadmap_${currentUser}_backup.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    importBtn.addEventListener('click', () => {
        importInput.click();
    });

    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                // Basic validation
                if (typeof importedData === 'object' && importedData !== null) {
                    localStorage.setItem(`progress_${currentUser}`, JSON.stringify(importedData));
                    
                    // Reload data naturally
                    initDashboard();
                    
                    // Close side panel if open
                    document.getElementById('detail-sidebar').classList.add('hidden');
                    document.querySelectorAll('.mindmap-node').forEach(el => el.classList.remove('selected'));
                    activeNodeId = null;
                } else {
                    alert("Invalid JSON data format.");
                }
            } catch (err) {
                console.error("Parse Error:", err);
                alert("Failed to parse the imported file.");
            }
            importInput.value = ""; // clear input
        };
        reader.readAsText(file);
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value;
        
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[user] && users[user] === pass) {
            startSession(user);
        } else {
            showAuthError('Invalid credentials. Access denied.');
        }
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('reg-username').value.trim();
        const pass = document.getElementById('reg-password').value;
        const conf = document.getElementById('reg-confirm').value;

        if (pass !== conf) {
            showAuthError('Security protocols failed: Passwords do not match.');
            return;
        }

        if (user.length < 3) {
            showAuthError('Username must be at least 3 characters.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[user]) {
            showAuthError('Identity already exists in standard database.');
            return;
        }

        users[user] = pass;
        localStorage.setItem('users', JSON.stringify(users));
        startSession(user);
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        currentUser = null;
        document.getElementById('app-view').classList.add('hidden');
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('detail-sidebar').classList.add('hidden');
    });
}

function showAuthError(msg) {
    const errDiv = document.getElementById('auth-error');
    document.getElementById('auth-error-msg').textContent = msg;
    errDiv.classList.remove('hidden');
}

function clearAuthError() {
    document.getElementById('auth-error').classList.add('hidden');
}

function checkAuthSession() {
    const session = localStorage.getItem('currentUser');
    if (session) {
        startSession(session);
    }
}

function startSession(username) {
    currentUser = username;
    localStorage.setItem('currentUser', username);
    
    // Inject dynamic names
    document.getElementById('header-username').textContent = currentUser;
    
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    
    initDashboard();
}

// --- DASHBOARD CORE ---
function initDashboard() {
    loadUserData();
    loadStreakData();
    setupCanvasControls();
    setupBadgeControls();
    
    // Initial draw
    calculateTreeLayout(localMapData, 150, 50); // Recursive calculate & store positions
    renderMindmap();
    updateGlobalProgress();
    
    // Handle Window Resize
    window.addEventListener('resize', () => {
        renderMindmap(); // Updates SVG lines if container changes
    });
}

// --- GAMIFICATION LOGIC ---
function loadStreakData() {
    const streakInfo = JSON.parse(localStorage.getItem(`streak_${currentUser}`) || '{"count": 0, "lastDate": null}');
    currentStreakCount = streakInfo.count || 0;
    lastActiveDate = streakInfo.lastDate || null;
    
    // Evaluate if streak is lost upon load
    if (lastActiveDate) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const last = new Date(lastActiveDate);
        last.setHours(0,0,0,0);
        
        const diffTime = today - last;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        // If they missed yesterday entirely
        if (diffDays > 1) {
            currentStreakCount = 0;
            // Provide them a clean slate starting today if they do a task later
        }
    }
    updateStreakUI();
}

function recordTaskCompletion() {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let previousStreak = currentStreakCount;

    if (!lastActiveDate) {
        currentStreakCount = 1;
        lastActiveDate = today.toISOString();
    } else {
        const last = new Date(lastActiveDate);
        last.setHours(0,0,0,0);
        
        const diffTime = today - last;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Maintained consecutive streak
            currentStreakCount++;
            lastActiveDate = today.toISOString();
        } else if (diffDays > 1) {
            // Streak was broken, starting fresh
            currentStreakCount = 1;
            lastActiveDate = today.toISOString();
        }
        // if diffDays === 0, they already did a task today, streak is maintained, count remains same.
    }
    
    localStorage.setItem(`streak_${currentUser}`, JSON.stringify({
        count: currentStreakCount,
        lastDate: lastActiveDate
    }));
    
    updateStreakUI();
    checkBadgeUnlockStatus(previousStreak, currentStreakCount);
}

function checkBadgeUnlockStatus(oldStreak, newStreak) {
    if (newStreak <= oldStreak) return; // Only trigger on streak increment

    BADGES.forEach(badge => {
        // If the new streak EXACTLY equals the badge requirement, it's newly unlocked today
        if (newStreak === badge.days) {
            showBadgeAlert(badge);
        }
    });
}

function showBadgeAlert(badge) {
    const alertEl = document.getElementById('badge-earned-alert');
    document.getElementById('alert-badge-img').src = badge.img;
    document.getElementById('alert-badge-img').onerror = function() { // fallback
        this.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23333' width='100' height='100'/><text fill='white' x='50' y='50' dominant-baseline='middle' text-anchor='middle' font-size='12'>Badge</text></svg>";
    };
    document.getElementById('alert-badge-name').textContent = badge.name;
    document.getElementById('alert-streak-days').textContent = badge.days;
    document.getElementById('alert-badge-custom-msg').textContent = `"${badge.msg}"`;
    
    alertEl.classList.remove('hidden');
    // Force reflow for animation
    void alertEl.offsetWidth;
    alertEl.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertEl.classList.remove('show');
        setTimeout(() => alertEl.classList.add('hidden'), 500); // wait for transition
    }, 5000);
}

function updateStreakUI() {
    const countEl = document.getElementById('streak-count');
    const iconEl = document.getElementById('streak-icon');
    countEl.textContent = currentStreakCount;
    
    if (currentStreakCount > 0 && lastActiveDate) {
        // Evaluate active status today vs yesterday
        const today = new Date();
        today.setHours(0,0,0,0);
        const last = new Date(lastActiveDate);
        last.setHours(0,0,0,0);
        
        const diffTime = today - last;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // Completed today = glowing fire
            iconEl.classList.add('fire-active');
        } else if (diffDays === 1) {
            // Pending completion today = still keeps count but loses fire
            iconEl.classList.remove('fire-active');
            iconEl.style.color = '#94a3b8'; 
        } else {
            iconEl.classList.remove('fire-active');
            iconEl.style.color = '#475569';
        }
    } else {
        iconEl.classList.remove('fire-active');
        iconEl.style.color = '#475569';
    }
}

function setupBadgeControls() {
    document.getElementById('streak-container').addEventListener('click', () => {
        renderBadges();
        document.getElementById('badge-detail').classList.add('hidden');
        document.getElementById('badges-modal').classList.remove('hidden');
    });

    document.getElementById('close-badges').addEventListener('click', () => {
        document.getElementById('badges-modal').classList.add('hidden');
    });

    document.getElementById('close-alert-btn').addEventListener('click', () => {
        const alertEl = document.getElementById('badge-earned-alert');
        alertEl.classList.remove('show');
        setTimeout(() => alertEl.classList.add('hidden'), 500);
    });

    document.getElementById('close-master-alert').addEventListener('click', () => {
        document.getElementById('master-completion-alert').classList.add('hidden');
    });
}

function renderBadges() {
    const grid = document.getElementById('badges-grid');
    grid.innerHTML = '';
    
    BADGES.forEach(badge => {
        const isUnlocked = currentStreakCount >= badge.days;
        
        const el = document.createElement('div');
        el.className = `badge-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        el.innerHTML = `
            <img src="${badge.img}" alt="${badge.name}" class="badge-img" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><rect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/><text fill=\\'white\\' x=\\'50\\' y=\\'50\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'12\\'>Badge</text></svg>'">
            <div class="badge-name">${badge.name}</div>
        `;
        
        el.addEventListener('click', () => showBadgeDetail(badge));
        grid.appendChild(el);
    });
}

function showBadgeDetail(badge) {
    const detailEl = document.getElementById('badge-detail');
    detailEl.classList.remove('hidden');
    
    document.getElementById('badge-detail-title').textContent = badge.name;
    
    let daysCompleted = Math.min(currentStreakCount, badge.days);
    
    document.getElementById('badge-detail-progress').textContent = `${daysCompleted} / ${badge.days} Days`;
    
    const daysGrid = document.getElementById('badge-days-grid');
    daysGrid.innerHTML = '';
    
    for (let i = 0; i < badge.days; i++) {
        const dot = document.createElement('div');
        dot.className = `day-dot ${i < daysCompleted ? 'gold' : 'silhouette'}`;
        daysGrid.appendChild(dot);
    }
}

function loadUserData() {
    // 1. Get raw base data from data.js
    // 2. Deep clone it
    const baseData = JSON.parse(JSON.stringify(roadmapData)); // Simple deep clone
    
    // 3. Merge with user progress if exists
    const userProgress = JSON.parse(localStorage.getItem(`progress_${currentUser}`) || '{}');
    
    // Apply saved progress selectively
    applyProgressToNode(baseData, userProgress);
    
    localMapData = baseData;
}

function saveUserData() {
    // Create a dictionary of module IDs and their completion status
    const progressMap = {};
    
    function extractProgress(node) {
        if (node.modules) {
            node.modules.forEach(m => {
                progressMap[m.id] = m.completed;
            });
        }
        if (node.children) node.children.forEach(extractProgress);
    }
    
    extractProgress(localMapData);
    localStorage.setItem(`progress_${currentUser}`, JSON.stringify(progressMap));
}

function applyProgressToNode(node, progressMap) {
    if (node.modules) {
        node.modules.forEach(m => {
            if (progressMap.hasOwnProperty(m.id)) {
                m.completed = progressMap[m.id];
            }
        });
    }
    if (node.children) {
        node.children.forEach(child => applyProgressToNode(child, progressMap));
    }
}

// --- CANVAS PAN & ZOOM ---
function setupCanvasControls() {
    const container = document.getElementById('canvas-wrapper');
    const canvas = document.getElementById('mindmap-canvas');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');

    function applyTransform() {
        canvas.style.transform = `translate(${currentTransform.x}px, ${currentTransform.y}px) scale(${currentTransform.scale})`;
    }
    
    applyTransform(); // Apply initial

    // Mouse Drag to Pan
    container.addEventListener('mousedown', (e) => {
        if (e.target.closest('.mindmap-node') || e.target.closest('.canvas-controls')) return;
        isDragging = true;
        startPos = { x: e.clientX - currentTransform.x, y: e.clientY - currentTransform.y };
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentTransform.x = e.clientX - startPos.x;
        currentTransform.y = e.clientY - startPos.y;
        applyTransform();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Mouse Wheel to Zoom
    container.addEventListener('wheel', (e) => {
        if (e.target.closest('.mindmap-node') || e.target.closest('.canvas-controls')) return;
        e.preventDefault();
        
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        let newScale = currentTransform.scale + delta;
        
        // Boundaries
        newScale = Math.max(0.3, Math.min(newScale, 2.0));
        
        // Zoom towards mouse pointer logic
        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        
        const ratio = newScale / currentTransform.scale;
        
        currentTransform.x = cursorX - (cursorX - currentTransform.x) * ratio;
        currentTransform.y = cursorY - (cursorY - currentTransform.y) * ratio;
        currentTransform.scale = newScale;
        
        applyTransform();
    }, { passive: false });

    // Buttons
    zoomInBtn.addEventListener('click', () => {
        currentTransform.scale = Math.min(currentTransform.scale + 0.1, 2.0);
        applyTransform();
    });
    
    zoomOutBtn.addEventListener('click', () => {
        currentTransform.scale = Math.max(currentTransform.scale - 0.1, 0.3);
        applyTransform();
    });
    
    zoomResetBtn.addEventListener('click', () => {
        currentTransform = { x: 50, y: 50, scale: 0.85 };
        applyTransform();
    });

    // --- MOBILE TOUCH SUPPORT ---
    let initialPinchDistance = null;
    let initialScale = 1;

    container.addEventListener('touchstart', (e) => {
        if (e.target.closest('.mindmap-node') || e.target.closest('.canvas-controls')) return;
        
        if (e.touches.length === 1) {
            // Single finger drag
            isDragging = true;
            startPos = { 
                x: e.touches[0].clientX - currentTransform.x, 
                y: e.touches[0].clientY - currentTransform.y 
            };
        } else if (e.touches.length === 2) {
            // Two fingers pinch setup
            isDragging = false;
            initialPinchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = currentTransform.scale;
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) {
            // Dragging
            currentTransform.x = e.touches[0].clientX - startPos.x;
            currentTransform.y = e.touches[0].clientY - startPos.y;
            applyTransform();
        } else if (e.touches.length === 2 && initialPinchDistance !== null) {
            // Pinch to zoom
            e.preventDefault(); // Prevent standard browser zoom
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            
            const zoomSensitivity = 1.2; 
            const ratio = currentDistance / initialPinchDistance;
            let newScale = initialScale * ratio * zoomSensitivity;
            
            // Constrain zoom
            currentTransform.scale = Math.max(0.3, Math.min(newScale, 2.0));
            applyTransform();
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            isDragging = false;
            initialPinchDistance = null;
        } else if (e.touches.length === 1) {
            // Reset drag if one finger is lifted during a pinch
            isDragging = true;
            startPos = { 
                x: e.touches[0].clientX - currentTransform.x, 
                y: e.touches[0].clientY - currentTransform.y 
            };
            initialPinchDistance = null;
        }
    });

}

// --- VISUALIZATION ENGINE ---
function calculateTreeLayout(node, startX, startY) {
    if (!node.children || node.children.length === 0) {
        node.x = startX;
        node.y = startY + Y_SPACING / 2;
        return Y_SPACING;
    }

    let totalHeight = 0;
    node.children.forEach(child => {
        let childHeight = calculateTreeLayout(child, startX + X_SPACING, startY + totalHeight + 20); // 20px extra padding between branches
        totalHeight += childHeight + 20;
    });

    // Remove the extra padding from the last item
    totalHeight -= 20;

    node.x = startX;
    node.y = startY + (totalHeight / 2);
    
    return Math.max(totalHeight, Y_SPACING);
}

function calculateNodeStats(node) {
    if (node.modules && node.modules.length > 0) {
        const completed = node.modules.filter(m => m.completed).length;
        const pct = Math.round((completed / node.modules.length) * 100);
        node.progress = pct;
        return pct;
    }
    
    if (node.children && node.children.length > 0) {
        let totalPct = 0;
        node.children.forEach(c => {
            totalPct += calculateNodeStats(c);
        });
        const pct = Math.round(totalPct / node.children.length);
        node.progress = pct;
        return pct;
    }
    
    node.progress = 0;
    return 0;
}

function getStatusColorClass(progress) {
    if (progress === 100) return 'status-completed'; // Will be styled in JS
    if (progress > 0) return 'status-inprogress';
    return 'status-pending';
}

function getStatusColorHex(progress) {
    if (progress === 100) return '#10b981'; // Green
    if (progress > 0) return '#f59e0b'; // Orange
    return '#64748b'; // Grey
}

function renderMindmap() {
    // 1. Recalculate all stats dynamically before rendering
    calculateNodeStats(localMapData);
    
    const svgLayer = document.getElementById('connections-layer');
    const nodesLayer = document.getElementById('nodes-layer');
    
    // Clear existing
    svgLayer.innerHTML = '';
    nodesLayer.innerHTML = '';
    
    // Helper to traverse and draw
    function drawNode(node, parentNode) {
        // Draw Path
        if (parentNode) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            // Bezier curve magic for smooth tree branches
            const curvature = 150;
            const pd = 100; // offset width half
            const cd = 100;
            
            const pX = parentNode.x + pd;
            const pY = parentNode.y;
            const cX = node.x - cd;
            const cY = node.y;
            
            path.setAttribute("d", `M ${pX} ${pY} C ${pX + curvature} ${pY}, ${cX - curvature} ${cY}, ${cX} ${cY}`);
            path.id = `path-${parentNode.id}-${node.id}`;
            
            // Highlight path if node is fully completed
            if (node.progress === 100) {
                path.classList.add('active-path');
            }
            
            svgLayer.appendChild(path);
        }
        
        // Create HTML Node
        const el = document.createElement('div');
        el.className = `mindmap-node node-${node.category || 'default'}`;
        if (!node.children || node.children.length === 0) el.classList.add('node-leaf');
        if (node.id === activeNodeId) el.classList.add('selected');
        
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
        el.id = `node-${node.id}`;
        
        const statColor = getStatusColorHex(node.progress);
        
        el.innerHTML = `
            <div class="node-icon" style="box-shadow: 0 0 10px ${node.progress===100 ? 'rgba(16, 185, 129, 0.4)' : 'transparent'}">
                <i class="${node.icon || 'ri-checkbox-blank-circle-line'}"></i>
            </div>
            <div class="node-content">
                <div class="node-label">${node.label}</div>
                <div class="node-status-bar">
                    <div class="node-status-fill" style="width: ${node.progress}%; background: ${statColor}"></div>
                </div>
            </div>
        `;
        
        el.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent window click
            selectNode(node);
        });
        
        nodesLayer.appendChild(el);
        
        // Recurse
        if (node.children) {
            node.children.forEach(child => drawNode(child, node));
        }
    }
    
    drawNode(localMapData, null);
}

// --- INTERACTIVITY & PROGRESS ---
function selectNode(node) {
    // UI selection state
    document.querySelectorAll('.mindmap-node').forEach(el => el.classList.remove('selected'));
    document.getElementById(`node-${node.id}`).classList.add('selected');
    activeNodeId = node.id;
    
    openDetailPanel(node);
}

function updateGlobalProgress() {
    const rootProgress = calculateNodeStats(localMapData);
    const fill = document.getElementById('global-progress-fill');
    fill.style.width = `${rootProgress}%`;
    
    // Change bar color if 100%
    if(rootProgress === 100) {
        fill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        
        // Master Completion Check
        if (!localStorage.getItem(`master_completed_${currentUser}`)) {
            localStorage.setItem(`master_completed_${currentUser}`, 'true');
            document.getElementById('master-completion-alert').classList.remove('hidden');
        }
    } else {
        fill.style.background = 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))';
        // If they untick something, they can re-trigger it
        localStorage.removeItem(`master_completed_${currentUser}`);
    }
}

// --- SIDE PANEL MANIPULATION ---
document.getElementById('close-panel').addEventListener('click', () => {
    document.getElementById('detail-sidebar').classList.add('hidden');
    document.querySelectorAll('.mindmap-node').forEach(el => el.classList.remove('selected'));
    activeNodeId = null;
});

function openDetailPanel(node) {
    const panel = document.getElementById('detail-sidebar');
    panel.classList.remove('hidden');
    
    document.getElementById('panel-title').textContent = node.label;
    document.getElementById('panel-type').textContent = node.type || node.category || 'Milestone';
    document.getElementById('panel-meta').textContent = node.meta || '';
    
    // Progress
    const pctLabel = document.getElementById('panel-pct');
    const bar = document.getElementById('panel-bar');
    
    pctLabel.textContent = `${node.progress}%`;
    bar.style.width = `${node.progress}%`;
    bar.style.backgroundColor = getStatusColorHex(node.progress);
    
    // Actions / External Links
    const actionsContainer = document.getElementById('panel-actions');
    actionsContainer.innerHTML = '';
    
    if (node.externalLink) {
        actionsContainer.innerHTML = `
            <a href="${node.externalLink.url}" target="_blank" class="ext-link">
                <i class="ri-external-link-line"></i>
                <span>${node.externalLink.label}</span>
            </a>
        `;
    }
    
    // Modules Checklist
    const list = document.getElementById('module-list');
    list.innerHTML = '';
    
    if (node.modules && node.modules.length > 0) {
        node.modules.forEach(mod => {
            const li = document.createElement('li');
            li.className = `check-item ${mod.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="check-box"><i class="ri-check-line"></i></div>
                <span class="check-label">${mod.name}</span>
            `;
            
            // Toggle Logic
            li.addEventListener('click', () => {
                const wasCompleted = mod.completed;
                mod.completed = !mod.completed;
                li.classList.toggle('completed', mod.completed);
                
                // Track Streak if transitioning from incomplete to complete
                if (!wasCompleted && mod.completed) {
                    recordTaskCompletion();
                }
                
                // Re-calculate & Re-render exactly
                saveUserData();
                renderMindmap(); // Updates nodes & paths
                updateGlobalProgress(); // Updates top bar
                
                // Update panel specifics for this node
                pctLabel.textContent = `${node.progress}%`;
                bar.style.width = `${node.progress}%`;
                bar.style.backgroundColor = getStatusColorHex(node.progress);
            });
            
            list.appendChild(li);
        });
    } else if (node.children) {
        // If it's a category node, show child summary instead of checks
        node.children.forEach(child => {
            const li = document.createElement('li');
            li.className = 'check-item disabled';
            li.style.cursor = 'default';
            li.innerHTML = `
                <div class="check-box" style="border-color: ${getStatusColorHex(child.progress)}; background: ${child.progress===100?getStatusColorHex(child.progress):'transparent'}"></div>
                <div style="display:flex; flex-direction:column; gap:4px; width:100%;">
                    <span class="check-label" style="text-decoration:none; opacity:1; color:var(--text-primary); font-weight:500;">${child.label}</span>
                    <div style="height:3px; background:rgba(255,255,255,0.1); border-radius:1px; width:100%;"><div style="height:100%; width:${child.progress}%; background:${getStatusColorHex(child.progress)}; border-radius:1px;"></div></div>
                </div>
            `;
            list.appendChild(li);
        });
    } else {
        list.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No specific sub-modules tracked.</p>';
    }
}
