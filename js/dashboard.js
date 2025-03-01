// Load Dashboard
function loadDashboard() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="dashboard-container">
            <!-- Search Bar -->
            <div class="dashboard-search mb-4">
                <input type="text" class="form-control" id="dashboard-search-input" placeholder="البحث عن موظف أو تقرير...">
                <i class="fas fa-search"></i>
            </div>
            
            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="stats-card bg-primary text-white">
                        <div class="stats-icon">
                            <i class="fas fa-users fa-2x"></i>
                        </div>
                        <div class="stats-info">
                            <h5>إجمالي الموظفين</h5>
                            <h3>${window.appState.employees.length}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card bg-success text-white">
                        <div class="stats-icon">
                            <i class="fas fa-money-bill-wave fa-2x"></i>
                        </div>
                        <div class="stats-info">
                            <h5>إجمالي الرواتب</h5>
                            <h3>${calculateTotalSalaries().toLocaleString()} ج.م</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card bg-warning text-dark">
                        <div class="stats-icon">
                            <i class="fas fa-hand-holding-usd fa-2x"></i>
                        </div>
                        <div class="stats-info">
                            <h5>إجمالي السلف</h5>
                            <h3>${calculateTotalAdvances().toLocaleString()} ج.م</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card bg-info text-white">
                        <div class="stats-icon">
                            <i class="fas fa-clock fa-2x"></i>
                        </div>
                        <div class="stats-info">
                            <h5>السلف المعلقة</h5>
                            <h3>${calculatePendingAdvances()}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="quick-actions-card">
                        <h4 class="mb-3">إجراءات سريعة</h4>
                        <div class="d-grid gap-2">
                            <button class="btn btn-lg btn-outline-primary" onclick="loadEmployeeForm()">
                                <i class="fas fa-user-plus me-2"></i>إضافة موظف جديد
                            </button>
                            <button class="btn btn-lg btn-outline-success" onclick="loadPayrollView()">
                                <i class="fas fa-calculator me-2"></i>حساب راتب
                            </button>
                            <button class="btn btn-lg btn-outline-warning" onclick="loadAdvancesManagement()">
                                <i class="fas fa-hand-holding-usd me-2"></i>إضافة سلفة
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="recent-activities-card">
                        <h4 class="mb-3">آخر النشاطات</h4>
                        <div class="list-group">
                            ${generateRecentActivities()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load Employee Form
function loadEmployeeForm() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">إدخال بيانات الموظف</h3>
            <form id="employee-form" onsubmit="handleEmployeeFormSubmit(event)">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">كود الموظف</label>
                        <input type="text" class="form-control" id="employee-code" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">اسم الموظف</label>
                        <input type="text" class="form-control" id="employee-name" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">الوظيفة</label>
                        <input type="text" class="form-control" id="job-title" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">الراتب الأساسي</label>
                        <input type="number" class="form-control" id="basic-salary" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">الحوافز الشهرية</label>
                        <input type="number" class="form-control" id="monthly-incentives" value="0">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">عدد أيام العمل</label>
                        <input type="number" class="form-control" id="work-days" value="22" required>
                    </div>
                </div>
                <div class="text-start mt-3">
                    <button type="submit" class="btn btn-primary">حفظ البيانات</button>
                </div>
            </form>
        </div>
    `;
}

// Load Payroll View
function loadPayrollView() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">حساب الراتب</h3>
            <form id="payroll-form" onsubmit="handlePayrollFormSubmit(event)">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">اختر الموظف</label>
                        <select class="form-select" id="payroll-employee-select" required>
                            <option value="">-- اختر الموظف --</option>
                            ${generateEmployeeOptions()}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">الشهر</label>
                        <input type="month" class="form-control" id="payroll-month" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">حساب الراتب</button>
            </form>
            <div id="payroll-result" class="mt-4"></div>
        </div>
    `;
    
    // Set default month to current month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('payroll-month').value = currentMonth;
}

// Load Advances Management
function loadAdvancesManagement() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">إدارة السلف</h3>
            <form id="advance-form" onsubmit="handleAdvanceFormSubmit(event)">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">اختر الموظف</label>
                        <select class="form-select" id="advance-employee-select" required>
                            <option value="">-- اختر الموظف --</option>
                            ${generateEmployeeOptions()}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">قيمة السلفة</label>
                        <input type="number" class="form-control" id="advance-amount" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">ملاحظات</label>
                    <textarea class="form-control" id="advance-notes" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">تسجيل السلفة</button>
            </form>
            <div id="advances-list" class="mt-4"></div>
        </div>
    `;
    
    // Load existing advances
    loadAdvancesList();
}

// Helper Functions
function calculateTotalSalaries() {
    return window.appState.employees.reduce((sum, emp) => sum + (emp.basicSalary || 0), 0);
}

function calculateTotalAdvances() {
    return (window.appState.advances || []).reduce((sum, adv) => sum + (adv.amount || 0), 0);
}

function calculatePendingAdvances() {
    return (window.appState.advances || []).filter(adv => !adv.isPaid).length;
}

function generateRecentActivities() {
    const activities = [];
    
    // Add recent salary calculations
    if (window.appState.salaryReports) {
        activities.push(...window.appState.salaryReports.slice(-5).map(report => ({
            type: 'salary',
            date: new Date(report.dateGenerated),
            text: `تم احتساب راتب ${report.employeeName}`,
            amount: report.calculations.netSalary
        })));
    }
    
    // Add recent advances
    if (window.appState.advances) {
        activities.push(...window.appState.advances.slice(-5).map(advance => ({
            type: 'advance',
            date: new Date(advance.createdAt),
            text: `تم تسجيل سلفة لـ ${advance.employeeName}`,
            amount: advance.amount
        })));
    }
    
    // Sort by date (newest first) and take last 5
    activities.sort((a, b) => b.date - a.date);
    activities.splice(5);
    
    if (activities.length === 0) {
        return '<div class="text-muted">لا توجد نشاطات حديثة</div>';
    }
    
    return activities.map(activity => `
        <div class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${activity.text}</h6>
                <small>${activity.date.toLocaleDateString('ar-SA')}</small>
            </div>
            <p class="mb-1">${activity.amount.toLocaleString()} ج.م</p>
        </div>
    `).join('');
}

// Helper function to generate employee options
function generateEmployeeOptions() {
    return (window.appState.employees || []).map(emp => 
        `<option value="${emp.code}">${emp.name} (${emp.code})</option>`
    ).join('');
}
