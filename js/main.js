// Initialize global state
window.appState = {
    employees: [],
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

// Load initial data from Firestore
async function loadInitialData() {
    try {
        // Load employees
        const employees = await window.firebaseService.getFromFirestore('employees');
        if (employees) {
            window.appState.employees = employees;
        }
        
        // Load advances
        const advances = await window.firebaseService.getFromFirestore('advances');
        if (advances) {
            window.appState.advances = advances;
        }
        
        // Load salary reports
        const reports = await window.firebaseService.getFromFirestore('salaryReports');
        if (reports) {
            window.appState.salaryReports = reports;
        }
        
        // Load leave requests
        const leaveRequests = await window.firebaseService.getFromFirestore('leaveRequests');
        if (leaveRequests) {
            window.appState.leaveRequests = leaveRequests;
        }
        
        // Load absence records
        const absenceRecords = await window.firebaseService.getFromFirestore('absenceRecords');
        if (absenceRecords) {
            window.appState.absenceRecords = absenceRecords;
        }
    } catch (error) {
        console.error('Error loading initial data:', error);
        showAlert('حدث خطأ أثناء تحميل البيانات', 'danger');
    }
}

// Save data to Firestore
async function saveToFirestore(collection, data) {
    try {
        await window.firebaseService.saveToFirestore(collection, data);
    } catch (error) {
        console.error('Error saving to Firestore:', error);
        showAlert('حدث خطأ أثناء حفظ البيانات', 'danger');
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
document.addEventListener('DOMContentLoaded', async function() {
    // Load initial data
    await loadInitialData();
    
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
