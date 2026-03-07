// Main Application Logic - Interactive Career Mindmap

// --- STATE MANAGEMENT ---
let currentUser = null;
let currentTransform = { x: 50, y: 50, scale: 0.85 }; // Initial zoom/pan
let isDragging = false;
let startPos = { x: 0, y: 0 };
let activeNodeId = null;
let localMapData = null; // Merged data instance

const X_SPACING = 380;
const Y_SPACING = 140;

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
    setupCanvasControls();
    
    // Initial draw
    calculateTreeLayout(localMapData, 150, 50); // Recursive calculate & store positions
    renderMindmap();
    updateGlobalProgress();
    
    // Handle Window Resize
    window.addEventListener('resize', () => {
        renderMindmap(); // Updates SVG lines if container changes
    });
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
    } else {
        fill.style.background = 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))';
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
                mod.completed = !mod.completed;
                li.classList.toggle('completed', mod.completed);
                
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
