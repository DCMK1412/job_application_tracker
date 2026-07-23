/**
 * Job Application Tracker Dashboard
 * Main JavaScript Application
 */

// ============================================
// Data Management Module
// ============================================

const DataManager = {
    STORAGE_KEY: 'jobTrackerApplications',
    
    /**
     * Get all applications from Local Storage
     */
    getApplications() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from Local Storage:', error);
            return [];
        }
    },
    
    /**
     * Save applications to Local Storage
     */
    saveApplications(applications) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(applications));
            return true;
        } catch (error) {
            console.error('Error saving to Local Storage:', error);
            return false;
        }
    },
    
    /**
     * Add a new application
     */
    addApplication(application) {
        const applications = this.getApplications();
        const newApplication = {
            id: Date.now().toString(),
            ...application,
            createdAt: new Date().toISOString()
        };
        applications.push(newApplication);
        return this.saveApplications(applications);
    },
    
    /**
     * Update an existing application
     */
    updateApplication(id, updatedData) {
        const applications = this.getApplications();
        const index = applications.findIndex(app => app.id === id);
        
        if (index !== -1) {
            applications[index] = {
                ...applications[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            return this.saveApplications(applications);
        }
        return false;
    },
    
    /**
     * Delete an application
     */
    deleteApplication(id) {
        const applications = this.getApplications();
        const filtered = applications.filter(app => app.id !== id);
        return this.saveApplications(filtered);
    },
    
    /**
     * Get application by ID
     */
    getApplicationById(id) {
        const applications = this.getApplications();
        return applications.find(app => app.id === id);
    },
    
    /**
     * Export applications as JSON
     */
    exportAsJSON() {
        const applications = this.getApplications();
        const dataStr = JSON.stringify(applications, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `job-applications-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    /**
     * Import applications from JSON file
     */
    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    if (Array.isArray(importedData)) {
                        const currentApplications = this.getApplications();
                        const mergedApplications = [...currentApplications, ...importedData];
                        
                        // Remove duplicates based on ID
                        const uniqueApplications = mergedApplications.filter((app, index, self) =>
                            index === self.findIndex(a => a.id === app.id)
                        );
                        
                        this.saveApplications(uniqueApplications);
                        resolve(true);
                    } else {
                        reject(new Error('Invalid JSON format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }
};

// ============================================
// UI Manager Module
// ============================================

const UIManager = {
    // Chart instances
    statusChart: null,
    monthlyChart: null,
    analyticsStatusChart: null,
    jobTypeChart: null,
    analyticsMonthlyChart: null,
    
    // Bootstrap modal instances
    applicationModal: null,
    detailsModal: null,
    deleteModal: null,
    
    /**
     * Initialize the UI
     */
    init() {
        this.initializeModals();
        this.initializeEventListeners();
        this.loadTheme();
        this.renderDashboard();
        this.renderApplications();
    },
    
    /**
     * Initialize Bootstrap modals
     */
    initializeModals() {
        this.applicationModal = new bootstrap.Modal(document.getElementById('application-modal'));
        this.detailsModal = new bootstrap.Modal(document.getElementById('details-modal'));
        this.deleteModal = new bootstrap.Modal(document.getElementById('delete-modal'));
    },
    
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Mobile sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Close sidebar when clicking nav links on mobile
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 991) {
                    this.toggleSidebar();
                }
            });
        });
        
        // Navigation
        document.getElementById('nav-dashboard').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchView('dashboard');
        });
        
        document.getElementById('nav-applications').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchView('applications');
        });
        
        document.getElementById('nav-analytics').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchView('analytics');
        });
        
        // Add application buttons
        document.getElementById('add-application-btn').addEventListener('click', () => {
            this.openApplicationModal();
        });
        
        document.getElementById('empty-add-btn').addEventListener('click', () => {
            this.openApplicationModal();
        });
        
        // Save application
        document.getElementById('save-application').addEventListener('click', () => {
            this.saveApplication();
        });
        
        // Search and filter
        document.getElementById('search-input').addEventListener('input', () => {
            this.renderApplications();
        });
        
        document.getElementById('filter-status').addEventListener('change', () => {
            this.renderApplications();
        });
        
        document.getElementById('sort-by').addEventListener('change', () => {
            this.renderApplications();
        });
        
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Export and import
        document.getElementById('export-btn').addEventListener('click', () => {
            DataManager.exportAsJSON();
        });
        
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        
        document.getElementById('import-file').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImport(e.target.files[0]);
            }
        });
        
        // Delete confirmation
        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.confirmDelete();
        });
    },
    
    /**
     * Switch between views
     */
    switchView(view) {
        // Update navigation
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.getElementById(`nav-${view}`).classList.add('active');
        
        // Update views
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.add('d-none');
        });
        document.getElementById(`${view}-view`).classList.remove('d-none');
        
        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            applications: 'Applications',
            analytics: 'Analytics'
        };
        document.querySelector('.page-title').textContent = titles[view];
        
        // Render specific view content
        if (view === 'dashboard') {
            this.renderDashboard();
        } else if (view === 'applications') {
            this.renderApplications();
        } else if (view === 'analytics') {
            this.renderAnalytics();
        }
    },
    
    /**
     * Render dashboard
     */
    renderDashboard() {
        const applications = DataManager.getApplications();
        
        // Update stats
        this.updateStats(applications);
        
        // Update charts
        this.renderStatusChart(applications);
        this.renderMonthlyChart(applications);
        
        // Render recent applications
        this.renderRecentApplications(applications);
    },
    
    /**
     * Update statistics cards
     */
    updateStats(applications) {
        const stats = {
            total: applications.length,
            applied: applications.filter(app => app.status === 'Applied').length,
            interview: applications.filter(app => app.status === 'Interview').length,
            rejected: applications.filter(app => app.status === 'Rejected').length,
            offer: applications.filter(app => app.status === 'Offer').length
        };
        
        document.getElementById('total-applications').textContent = stats.total;
        document.getElementById('applied-count').textContent = stats.applied;
        document.getElementById('interview-count').textContent = stats.interview;
        document.getElementById('rejected-count').textContent = stats.rejected;
        document.getElementById('offer-count').textContent = stats.offer;
    },
    
    /**
     * Render status distribution pie chart
     */
    renderStatusChart(applications) {
        const ctx = document.getElementById('status-chart').getContext('2d');
        
        const statusCounts = {
            Applied: applications.filter(app => app.status === 'Applied').length,
            Interview: applications.filter(app => app.status === 'Interview').length,
            Rejected: applications.filter(app => app.status === 'Rejected').length,
            Offer: applications.filter(app => app.status === 'Offer').length
        };
        
        if (this.statusChart) {
            this.statusChart.destroy();
        }
        
        this.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Applied', 'Interview', 'Rejected', 'Offer'],
                datasets: [{
                    data: [statusCounts.Applied, statusCounts.Interview, statusCounts.Rejected, statusCounts.Offer],
                    backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    /**
     * Render monthly applications bar chart
     */
    renderMonthlyChart(applications) {
        const ctx = document.getElementById('monthly-chart').getContext('2d');
        
        // Get last 6 months
        const months = [];
        const counts = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            months.push(monthYear);
            
            const count = applications.filter(app => {
                const appDate = new Date(app.applicationDate);
                return appDate.getMonth() === date.getMonth() && 
                       appDate.getFullYear() === date.getFullYear();
            }).length;
            
            counts.push(count);
        }
        
        if (this.monthlyChart) {
            this.monthlyChart.destroy();
        }
        
        this.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Applications',
                    data: counts,
                    backgroundColor: '#4f46e5',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Render recent applications table
     */
    renderRecentApplications(applications) {
        const tbody = document.getElementById('recent-applications-body');
        const recent = [...applications]
            .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
            .slice(0, 5);
        
        if (recent.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        No applications yet. Add your first application!
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = recent.map(app => `
            <tr class="fade-in">
                <td><strong>${this.escapeHtml(app.companyName)}</strong></td>
                <td>${this.escapeHtml(app.position)}</td>
                <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
                <td>${this.formatDate(app.applicationDate)}</td>
                <td>
                    <button class="action-btn" onclick="UIManager.viewApplication('${app.id}')" title="View Details">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-btn" onclick="UIManager.editApplication('${app.id}')" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="action-btn delete" onclick="UIManager.deleteApplication('${app.id}')" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * Render applications table
     */
    renderApplications() {
        const applications = DataManager.getApplications();
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('filter-status').value;
        const sortBy = document.getElementById('sort-by').value;
        
        // Filter applications
        let filtered = applications.filter(app => {
            const matchesSearch = app.companyName.toLowerCase().includes(searchTerm) ||
                                  app.position.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        
        // Sort applications
        filtered = this.sortApplications(filtered, sortBy);
        
        const tbody = document.getElementById('applications-body');
        const emptyState = document.getElementById('empty-state');
        
        if (filtered.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('d-none');
        } else {
            emptyState.classList.add('d-none');
            tbody.innerHTML = filtered.map(app => `
                <tr class="fade-in">
                    <td><strong>${this.escapeHtml(app.companyName)}</strong></td>
                    <td>${this.escapeHtml(app.position)}</td>
                    <td>${this.escapeHtml(app.location || '-')}</td>
                    <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
                    <td><span class="job-type-badge">${app.jobType}</span></td>
                    <td>${this.formatDate(app.applicationDate)}</td>
                    <td>
                        <button class="action-btn" onclick="UIManager.viewApplication('${app.id}')" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="action-btn" onclick="UIManager.editApplication('${app.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="action-btn delete" onclick="UIManager.deleteApplication('${app.id}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    },
    
    /**
     * Sort applications
     */
    sortApplications(applications, sortBy) {
        const sorted = [...applications];
        
        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.applicationDate) - new Date(b.applicationDate));
                break;
            case 'company':
                sorted.sort((a, b) => a.companyName.localeCompare(b.companyName));
                break;
        }
        
        return sorted;
    },
    
    /**
     * Clear filters
     */
    clearFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('filter-status').value = '';
        document.getElementById('sort-by').value = 'newest';
        this.renderApplications();
    },
    
    /**
     * Render analytics view
     */
    renderAnalytics() {
        const applications = DataManager.getApplications();
        this.renderAnalyticsStatusChart(applications);
        this.renderJobTypeChart(applications);
        this.renderAnalyticsMonthlyChart(applications);
    },
    
    /**
     * Render analytics status chart
     */
    renderAnalyticsStatusChart(applications) {
        const ctx = document.getElementById('analytics-status-chart').getContext('2d');
        
        const statusCounts = {
            Applied: applications.filter(app => app.status === 'Applied').length,
            Interview: applications.filter(app => app.status === 'Interview').length,
            Rejected: applications.filter(app => app.status === 'Rejected').length,
            Offer: applications.filter(app => app.status === 'Offer').length
        };
        
        if (this.analyticsStatusChart) {
            this.analyticsStatusChart.destroy();
        }
        
        this.analyticsStatusChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Applied', 'Interview', 'Rejected', 'Offer'],
                datasets: [{
                    data: [statusCounts.Applied, statusCounts.Interview, statusCounts.Rejected, statusCounts.Offer],
                    backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    /**
     * Render job type chart
     */
    renderJobTypeChart(applications) {
        const ctx = document.getElementById('job-type-chart').getContext('2d');
        
        const jobTypeCounts = {
            'Full-time': applications.filter(app => app.jobType === 'Full-time').length,
            'Part-time': applications.filter(app => app.jobType === 'Part-time').length,
            'Internship': applications.filter(app => app.jobType === 'Internship').length,
            'Remote': applications.filter(app => app.jobType === 'Remote').length
        };
        
        if (this.jobTypeChart) {
            this.jobTypeChart.destroy();
        }
        
        this.jobTypeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Full-time', 'Part-time', 'Internship', 'Remote'],
                datasets: [{
                    data: [jobTypeCounts['Full-time'], jobTypeCounts['Part-time'], jobTypeCounts['Internship'], jobTypeCounts['Remote']],
                    backgroundColor: ['#4f46e5', '#8b5cf6', '#ec4899', '#06b6d4'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    /**
     * Render analytics monthly chart
     */
    renderAnalyticsMonthlyChart(applications) {
        const ctx = document.getElementById('analytics-monthly-chart').getContext('2d');
        
        // Get last 12 months
        const months = [];
        const counts = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            months.push(monthYear);
            
            const count = applications.filter(app => {
                const appDate = new Date(app.applicationDate);
                return appDate.getMonth() === date.getMonth() && 
                       appDate.getFullYear() === date.getFullYear();
            }).length;
            
            counts.push(count);
        }
        
        if (this.analyticsMonthlyChart) {
            this.analyticsMonthlyChart.destroy();
        }
        
        this.analyticsMonthlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Applications',
                    data: counts,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Open application modal for adding
     */
    openApplicationModal() {
        document.getElementById('application-modal-label').textContent = 'Add Application';
        document.getElementById('application-form').reset();
        document.getElementById('application-id').value = '';
        document.getElementById('application-date').value = new Date().toISOString().split('T')[0];
        this.applicationModal.show();
    },
    
    /**
     * Open application modal for editing
     */
    editApplication(id) {
        const application = DataManager.getApplicationById(id);
        if (!application) return;
        
        document.getElementById('application-modal-label').textContent = 'Edit Application';
        document.getElementById('application-id').value = application.id;
        document.getElementById('company-name').value = application.companyName;
        document.getElementById('position').value = application.position;
        document.getElementById('location').value = application.location || '';
        document.getElementById('application-date').value = application.applicationDate;
        document.getElementById('status').value = application.status;
        document.getElementById('job-type').value = application.jobType;
        document.getElementById('notes').value = application.notes || '';
        
        this.applicationModal.show();
    },
    
    /**
     * Save application (add or update)
     */
    saveApplication() {
        const form = document.getElementById('application-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const id = document.getElementById('application-id').value;
        const applicationData = {
            companyName: document.getElementById('company-name').value.trim(),
            position: document.getElementById('position').value.trim(),
            location: document.getElementById('location').value.trim(),
            applicationDate: document.getElementById('application-date').value,
            status: document.getElementById('status').value,
            jobType: document.getElementById('job-type').value,
            notes: document.getElementById('notes').value.trim()
        };
        
        let success;
        if (id) {
            success = DataManager.updateApplication(id, applicationData);
        } else {
            success = DataManager.addApplication(applicationData);
        }
        
        if (success) {
            this.applicationModal.hide();
            this.renderDashboard();
            this.renderApplications();
        } else {
            alert('Error saving application. Please try again.');
        }
    },
    
    /**
     * View application details
     */
    viewApplication(id) {
        const application = DataManager.getApplicationById(id);
        if (!application) return;
        
        const content = document.getElementById('details-content');
        content.innerHTML = `
            <div class="details-row">
                <div class="details-label">Company</div>
                <div class="details-value"><strong>${this.escapeHtml(application.companyName)}</strong></div>
            </div>
            <div class="details-row">
                <div class="details-label">Position</div>
                <div class="details-value">${this.escapeHtml(application.position)}</div>
            </div>
            <div class="details-row">
                <div class="details-label">Location</div>
                <div class="details-value">${this.escapeHtml(application.location || 'Not specified')}</div>
            </div>
            <div class="details-row">
                <div class="details-label">Application Date</div>
                <div class="details-value">${this.formatDate(application.applicationDate)}</div>
            </div>
            <div class="details-row">
                <div class="details-label">Status</div>
                <div class="details-value">
                    <span class="status-badge ${application.status.toLowerCase()}">${application.status}</span>
                </div>
            </div>
            <div class="details-row">
                <div class="details-label">Job Type</div>
                <div class="details-value">
                    <span class="job-type-badge">${application.jobType}</span>
                </div>
            </div>
            ${application.notes ? `
                <div class="details-row">
                    <div class="details-label">Notes</div>
                    <div class="details-value"></div>
                </div>
                <div class="details-notes">${this.escapeHtml(application.notes)}</div>
            ` : ''}
        `;
        
        this.detailsModal.show();
    },
    
    /**
     * Delete application (show confirmation modal)
     */
    deleteApplication(id) {
        document.getElementById('delete-application-id').value = id;
        this.deleteModal.show();
    },
    
    /**
     * Confirm delete
     */
    confirmDelete() {
        const id = document.getElementById('delete-application-id').value;
        const success = DataManager.deleteApplication(id);
        
        if (success) {
            this.deleteModal.hide();
            this.renderDashboard();
            this.renderApplications();
        } else {
            alert('Error deleting application. Please try again.');
        }
    },
    
    /**
     * Handle import
     */
    handleImport(file) {
        DataManager.importFromJSON(file)
            .then(() => {
                alert('Applications imported successfully!');
                document.getElementById('import-file').value = '';
                this.renderDashboard();
                this.renderApplications();
            })
            .catch(error => {
                alert('Error importing applications: ' + error.message);
            });
    },
    
    /**
     * Toggle theme
     */
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.updateThemeButton(newTheme);
    },
    
    /**
     * Load saved theme
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeButton(savedTheme);
    },
    
    /**
     * Update theme button
     */
    updateThemeButton(theme) {
        const icon = document.getElementById('theme-icon');
        const text = document.getElementById('theme-text');
        
        if (theme === 'dark') {
            icon.className = 'bi bi-sun-fill';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'bi bi-moon-fill';
            text.textContent = 'Dark Mode';
        }
    },
    
    /**
     * Toggle sidebar on mobile
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
        
        // Prevent body scroll when sidebar is open
        if (sidebar.classList.contains('show')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    },
    
    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});
