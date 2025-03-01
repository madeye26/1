// Initialize leave management state
if (typeof window.appState === 'undefined') {
    window.appState = {};
}

if (!window.appState.leaveRequests) {
    window.appState.leaveRequests = [];
}

if (!window.appState.absenceRecords) {
    window.appState.absenceRecords = [];
}

// Leave types
const leaveTypes = [
    { id: 'annual', name: 'إجازة سنوية', color: 'primary', icon: 'umbrella-beach' },
    { id: 'sick', name: 'إجازة مرضية', color: 'danger', icon: 'hospital' },
    { id: 'emergency', name: 'إجازة طارئة', color: 'warning', icon: 'exclamation-circle' },
    { id: 'unpaid', name: 'إجازة بدون راتب', color: 'secondary', icon: 'money-bill-slash' },
    { id: 'absence', name: 'غياب', color: 'danger', icon: 'user-slash' },
    { id: 'other', name: 'إجازة أخرى', color: 'info', icon: 'calendar-day' }
];

// Leave status
const leaveStatus = {
    pending: { name: 'قيد الانتظار', color: 'warning' },
    approved: { name: 'تمت الموافقة', color: 'success' },
    rejected: { name: 'مرفوضة', color: 'danger' },
    cancelled: { name: 'ملغية', color: 'secondary' }
};

// Helper function to generate employee options
function generateEmployeeOptions() {
    return (window.appState.employees || []).map(emp => 
        `<option value="${emp.code}">${emp.name} (${emp.code})</option>`
    ).join('');
}

// Load Leave Management View
function loadLeaveManagementView() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">إدارة الإجازات</h3>
            
            <ul class="nav nav-tabs mb-4" id="leaveManagementTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="leave-requests-tab" data-bs-toggle="tab" data-bs-target="#leave-requests" type="button" role="tab">
                        <i class="fas fa-clipboard-list me-2"></i>طلبات الإجازات
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="new-leave-tab" data-bs-toggle="tab" data-bs-target="#new-leave" type="button" role="tab">
                        <i class="fas fa-plus-circle me-2"></i>طلب إجازة جديدة
                    </button>
                </li>
            </ul>
            
            <div class="tab-content" id="leaveManagementTabContent">
                <!-- Leave Requests Tab -->
                <div class="tab-pane fade show active" id="leave-requests" role="tabpanel">
                    <div class="card">
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <label class="form-label">تصفية حسب الموظف</label>
                                    <select class="form-select" id="filter-leave-employee" onchange="filterLeaveRequests()">
                                        <option value="">جميع الموظفين</option>
                                        ${generateEmployeeOptions()}
                                    </select>
                                </div>
                            </div>
                            <div id="leave-requests-table"></div>
                        </div>
                    </div>
                </div>
                
                <!-- New Leave Request Tab -->
                <div class="tab-pane fade" id="new-leave" role="tabpanel">
                    <div class="card">
                        <div class="card-body">
                            <form id="leave-request-form" onsubmit="handleLeaveRequestSubmit(event)">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">اختر الموظف</label>
                                        <select class="form-select" id="leave-employee-select" required>
                                            <option value="">-- اختر الموظف --</option>
                                            ${generateEmployeeOptions()}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">نوع الإجازة</label>
                                        <select class="form-select" id="leave-type-select" required>
                                            <option value="">-- اختر نوع الإجازة --</option>
                                            ${leaveTypes.map(type => 
                                                `<option value="${type.id}">${type.name}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">تاريخ البداية</label>
                                        <input type="date" class="form-control" id="leave-start-date" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">تاريخ النهاية</label>
                                        <input type="date" class="form-control" id="leave-end-date" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">ملاحظات</label>
                                    <textarea class="form-control" id="leave-notes" rows="3"></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">حفظ طلب الإجازة</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load initial leave requests
    loadLeaveRequests();
}

// Handle leave request form submission
function handleLeaveRequestSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const employeeSelect = document.getElementById('leave-employee-select');
    const typeSelect = document.getElementById('leave-type-select');
    const startDate = document.getElementById('leave-start-date');
    const endDate = document.getElementById('leave-end-date');
    const notes = document.getElementById('leave-notes');
    
    if (!employeeSelect || !typeSelect || !startDate || !endDate) {
        showAlert('حدث خطأ في النموذج', 'danger');
        return;
    }
    
    const leaveRequest = {
        id: Date.now().toString(),
        employeeId: employeeSelect.value,
        type: typeSelect.value,
        startDate: startDate.value,
        endDate: endDate.value,
        notes: notes ? notes.value : '',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Add to state
    window.appState.leaveRequests.push(leaveRequest);
    
    // Save to localStorage
    saveToLocalStorage('leaveRequests', window.appState.leaveRequests);
    
    // Show success message
    showAlert('تم حفظ طلب الإجازة بنجاح', 'success');
    
    // Reset form
    form.reset();
    
    // Reload leave requests
    loadLeaveRequests();
}

// Load leave requests
function loadLeaveRequests() {
    const tableContainer = document.getElementById('leave-requests-table');
    if (!tableContainer) return;
    
    const filterEmployee = document.getElementById('filter-leave-employee');
    let requests = [...window.appState.leaveRequests];
    
    // Apply filters
    if (filterEmployee && filterEmployee.value) {
        requests = requests.filter(req => req.employeeId === filterEmployee.value);
    }
    
    // Sort by date (newest first)
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Generate table HTML
    tableContainer.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>الموظف</th>
                    <th>نوع الإجازة</th>
                    <th>من تاريخ</th>
                    <th>إلى تاريخ</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${requests.length ? requests.map(request => {
                    const employee = window.appState.employees.find(emp => emp.code === request.employeeId);
                    const leaveType = leaveTypes.find(type => type.id === request.type);
                    return `
                        <tr>
                            <td>${employee ? employee.name : 'غير معروف'}</td>
                            <td>${leaveType ? leaveType.name : 'غير معروف'}</td>
                            <td>${formatDate(request.startDate)}</td>
                            <td>${formatDate(request.endDate)}</td>
                            <td>
                                <span class="badge bg-${leaveStatus[request.status].color}">
                                    ${leaveStatus[request.status].name}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="deleteLeaveRequest('${request.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('') : '<tr><td colspan="6" class="text-center">لا توجد طلبات إجازة</td></tr>'}
            </tbody>
        </table>
    `;
}

// Delete leave request
function deleteLeaveRequest(id) {
    if (confirm('هل أنت متأكد من حذف طلب الإجازة؟')) {
        window.appState.leaveRequests = window.appState.leaveRequests.filter(req => req.id !== id);
        saveToLocalStorage('leaveRequests', window.appState.leaveRequests);
        loadLeaveRequests();
        showAlert('تم حذف طلب الإجازة بنجاح', 'success');
    }
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

// Filter leave requests
function filterLeaveRequests() {
    loadLeaveRequests();
}

// Helper function to show alerts
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

// Helper function to save to localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showAlert('حدث خطأ أثناء حفظ البيانات', 'danger');
    }
}
