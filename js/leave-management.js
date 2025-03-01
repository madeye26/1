// Load leave management view
async function loadLeaveManagementView() {
    const mainContent = document.querySelector('#page-content-wrapper .container-fluid');
    mainContent.innerHTML = `
        <h2>إدارة الإجازات</h2>
        <div class="row mb-4">
            <div class="col">
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#" id="new-leave-tab">طلب إجازة جديدة</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="leave-requests-tab">طلبات الإجازات</a>
                    </li>
                </ul>
            </div>
        </div>
        <div id="leave-management-content"></div>
    `;

    // Add event listeners to tabs
    document.getElementById('new-leave-tab').addEventListener('click', (e) => {
        e.preventDefault();
        showNewLeaveForm();
    });

    document.getElementById('leave-requests-tab').addEventListener('click', (e) => {
        e.preventDefault();
        showLeaveRequests();
    });

    // Show new leave form by default
    showNewLeaveForm();
}

// Show new leave request form
function showNewLeaveForm() {
    const content = document.getElementById('leave-management-content');
    content.innerHTML = `
        <div class="card">
            <div class="card-body">
                <form id="leave-request-form">
                    <div class="mb-3">
                        <label class="form-label">اختر الموظف</label>
                        <select class="form-select" id="employee-select" required>
                            <option value="">-- اختر الموظف --</option>
                            ${window.appState.employees.map(emp => 
                                `<option value="${emp.id}">${emp.name} (${emp.code})</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">نوع الإجازة</label>
                        <select class="form-select" id="leave-type" required>
                            <option value="">-- اختر نوع الإجازة --</option>
                            <option value="annual">إجازة سنوية</option>
                            <option value="sick">إجازة مرضية</option>
                            <option value="emergency">إجازة طارئة</option>
                            <option value="unpaid">إجازة بدون راتب</option>
                            <option value="other">إجازة أخرى</option>
                        </select>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">تاريخ البداية</label>
                            <input type="date" class="form-control" id="start-date" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">تاريخ النهاية</label>
                            <input type="date" class="form-control" id="end-date" required>
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
    `;

    // Add form submit handler
    document.getElementById('leave-request-form').addEventListener('submit', handleLeaveRequest);
}

// Handle new leave request submission
async function handleLeaveRequest(e) {
    e.preventDefault();

    const leaveRequest = {
        employeeId: document.getElementById('employee-select').value,
        employeeName: document.getElementById('employee-select').options[
            document.getElementById('employee-select').selectedIndex
        ].text,
        leaveType: document.getElementById('leave-type').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        notes: document.getElementById('leave-notes').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    try {
        // Save to Firestore
        await window.firebaseService.saveToFirestore('leaveRequests', leaveRequest);
        showAlert('تم حفظ طلب الإجازة بنجاح', 'success');
        e.target.reset();
    } catch (error) {
        console.error('Error saving leave request:', error);
        showAlert('حدث خطأ أثناء حفظ طلب الإجازة', 'danger');
    }
}

// Show leave requests list
async function showLeaveRequests() {
    const content = document.getElementById('leave-management-content');
    
    // Get latest leave requests from Firestore
    const leaveRequests = await window.firebaseService.getFromFirestore('leaveRequests');
    
    content.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">تصفية حسب الموظف</label>
                    <select class="form-select" id="employee-filter">
                        <option value="all">جميع الموظفين</option>
                        ${window.appState.employees.map(emp => 
                            `<option value="${emp.id}">${emp.name} (${emp.code})</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="table-responsive">
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
                        <tbody id="leave-requests-table">
                            ${leaveRequests.map(request => `
                                <tr>
                                    <td>${request.employeeName}</td>
                                    <td>${getLeaveTypeText(request.leaveType)}</td>
                                    <td>${formatDate(request.startDate)}</td>
                                    <td>${formatDate(request.endDate)}</td>
                                    <td>${getStatusBadge(request.status)}</td>
                                    <td>
                                        ${request.status === 'pending' ? `
                                            <button class="btn btn-sm btn-success" onclick="approveLeave('${request.id}')">
                                                قبول
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="rejectLeave('${request.id}')">
                                                رفض
                                            </button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Add filter change handler
    document.getElementById('employee-filter').addEventListener('change', handleEmployeeFilter);
}

// Helper functions
function getLeaveTypeText(type) {
    const types = {
        annual: 'إجازة سنوية',
        sick: 'إجازة مرضية',
        emergency: 'إجازة طارئة',
        unpaid: 'إجازة بدون راتب',
        other: 'إجازة أخرى'
    };
    return types[type] || type;
}

function getStatusBadge(status) {
    const badges = {
        pending: '<span class="badge bg-warning">قيد الانتظار</span>',
        approved: '<span class="badge bg-success">مقبول</span>',
        rejected: '<span class="badge bg-danger">مرفوض</span>'
    };
    return badges[status] || status;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-SA');
}

// Handle employee filter change
async function handleEmployeeFilter(e) {
    const employeeId = e.target.value;
    const leaveRequests = await window.firebaseService.getFromFirestore('leaveRequests');
    const filteredRequests = employeeId === 'all' 
        ? leaveRequests 
        : leaveRequests.filter(request => request.employeeId === employeeId);
    
    updateLeaveRequestsTable(filteredRequests);
}

// Update leave requests table
function updateLeaveRequestsTable(requests) {
    const tableBody = document.getElementById('leave-requests-table');
    tableBody.innerHTML = requests.map(request => `
        <tr>
            <td>${request.employeeName}</td>
            <td>${getLeaveTypeText(request.leaveType)}</td>
            <td>${formatDate(request.startDate)}</td>
            <td>${formatDate(request.endDate)}</td>
            <td>${getStatusBadge(request.status)}</td>
            <td>
                ${request.status === 'pending' ? `
                    <button class="btn btn-sm btn-success" onclick="approveLeave('${request.id}')">
                        قبول
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="rejectLeave('${request.id}')">
                        رفض
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Approve leave request
async function approveLeave(requestId) {
    try {
        await window.firebaseService.updateInFirestore('leaveRequests', requestId, {
            status: 'approved',
            updatedAt: new Date().toISOString()
        });
        showAlert('تم قبول طلب الإجازة بنجاح', 'success');
        showLeaveRequests(); // Refresh the list
    } catch (error) {
        console.error('Error approving leave request:', error);
        showAlert('حدث خطأ أثناء قبول طلب الإجازة', 'danger');
    }
}

// Reject leave request
async function rejectLeave(requestId) {
    try {
        await window.firebaseService.updateInFirestore('leaveRequests', requestId, {
            status: 'rejected',
            updatedAt: new Date().toISOString()
        });
        showAlert('تم رفض طلب الإجازة', 'success');
        showLeaveRequests(); // Refresh the list
    } catch (error) {
        console.error('Error rejecting leave request:', error);
        showAlert('حدث خطأ أثناء رفض طلب الإجازة', 'danger');
    }
}

// Make functions globally available
window.approveLeave = approveLeave;
window.rejectLeave = rejectLeave;
