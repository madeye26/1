// Initialize global state
window.appState = {
    employees: [
        {
            code: 'EMP001',
            name: 'أحمد محمد',
            jobTitle: 'مطور برمجيات',
            basicSalary: 5000,
            monthlyIncentives: 500,
            workDays: 22,
            dailyWorkHours: 8,
            dateAdded: new Date().toISOString()
        }
    ],
    currentEmployee: null,
    advances: [],
    salaryReports: [],
    lastBackup: null,
    leaveRequests: [],
    absenceRecords: []
};

// Data validation schemas
const validationSchemas = {
    employee: {
        code: (value) => value && value.trim().length > 0 ? null : 'كود الموظف مطلوب',
        name: (value) => value && value.trim().length > 0 ? null : 'اسم الموظف مطلوب',
        basicSalary: (value) => value && value > 0 ? null : 'الراتب الأساسي يجب أن يكون أكبر من صفر',
        jobTitle: (value) => value && value.trim().length > 0 ? null : 'المسمى الوظيفي مطلوب'
    }
};

// Load saved data from localStorage
function loadSavedData() {
    try {
        // Load employees
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
            window.appState.employees = JSON.parse(savedEmployees);
        }
        
        // Load advances
        const savedAdvances = localStorage.getItem('advances');
        if (savedAdvances) {
            window.appState.advances = JSON.parse(savedAdvances);
        }
        
        // Load salary reports
        const savedReports = localStorage.getItem('salaryReports');
        if (savedReports) {
            window.appState.salaryReports = JSON.parse(savedReports);
        }
        
        // Load leave requests
        const savedLeaveRequests = localStorage.getItem('leaveRequests');
        if (savedLeaveRequests) {
            window.appState.leaveRequests = JSON.parse(savedLeaveRequests);
        }
        
        // Load absence records
        const savedAbsenceRecords = localStorage.getItem('absenceRecords');
        if (savedAbsenceRecords) {
            window.appState.absenceRecords = JSON.parse(savedAbsenceRecords);
        }
        
        // Load last backup timestamp
        const lastBackup = localStorage.getItem('lastBackup');
        if (lastBackup) {
            window.appState.lastBackup = lastBackup;
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showAlert('حدث خطأ أثناء تحميل البيانات المحفوظة', 'danger');
    }
}

// Save data to localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find alert container or create one
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'alert-container';
        document.body.appendChild(alertContainer);
    }
    
    alertContainer.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadSavedData();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize performance optimizations
    if (window.performanceUtils && window.performanceUtils.initPerformanceOptimizations) {
        window.performanceUtils.initPerformanceOptimizations();
    }
    
    // Load initial dashboard
    loadDashboard();
});

// Initialize Navigation
function initializeNavigation() {
    const tabs = document.querySelectorAll('.list-group-item');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update page title
            const pageTitle = document.querySelector('#page-content-wrapper h2');
            if (pageTitle) {
                pageTitle.textContent = this.textContent.trim();
            }
            
            // Load appropriate content
            handleNavigation(this.id);
        });
    });
}

// Navigation Handler
function handleNavigation(tabId) {
    switch(tabId) {
        case 'dashboard-tab':
            loadDashboard();
            break;
        case 'employees-tab':
            loadEmployeeForm();
            break;
        case 'payroll-tab':
            loadPayrollView();
            break;
        case 'advances-tab':
            loadAdvancesManagement();
            break;
        case 'time-tracking-tab':
            if (typeof loadTimeTrackingView === 'function') {
                loadTimeTrackingView();
            } else {
                showAlert('عذراً، هذه الميزة غير متوفرة حالياً', 'warning');
            }
            break;
        case 'leave-management-tab':
            if (typeof loadLeaveManagementView === 'function') {
                loadLeaveManagementView();
            } else {
                showAlert('عذراً، هذه الميزة غير متوفرة حالياً', 'warning');
            }
            break;
        case 'reports-tab':
            if (typeof loadReportsSystem === 'function') {
                loadReportsSystem();
            } else {
                showAlert('عذراً، هذه الميزة غير متوفرة حالياً', 'warning');
            }
            break;
        default:
            showAlert('عذراً، هذه الميزة غير متوفرة حالياً', 'warning');
            break;
    }
}
