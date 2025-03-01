// Initialize time tracking state
if (typeof window.appState === 'undefined') {
    window.appState = {};
}

if (!window.appState.timeRecords) {
    window.appState.timeRecords = [];
}

// Helper function to generate employee options
function generateEmployeeOptions() {
    return (window.appState.employees || []).map(emp => 
        `<option value="${emp.code}">${emp.name} (${emp.code})</option>`
    ).join('');
}

// Load Time Tracking View
function loadTimeTrackingView() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">تتبع وقت الموظفين</h3>
            
            <div class="card mb-4">
                <div class="card-body">
                    <form id="time-tracking-form" onsubmit="handleTimeTrackingSubmit(event)">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">اختر الموظف</label>
                                <select class="form-select" id="time-tracking-employee-select" required>
                                    <option value="">-- اختر الموظف --</option>
                                    ${generateEmployeeOptions()}
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">التاريخ</label>
                                <input type="date" class="form-control" id="time-tracking-date" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">وقت الحضور</label>
                                <input type="time" class="form-control" id="time-in" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">وقت الانصراف</label>
                                <input type="time" class="form-control" id="time-out" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-control" id="time-tracking-notes" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">حفظ</button>
                    </form>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-3">تقرير ساعات العمل</h5>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">اختر الموظف</label>
                            <select class="form-select" id="report-employee-select" onchange="generateWorkHoursReport()">
                                <option value="">جميع الموظفين</option>
                                ${generateEmployeeOptions()}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">الشهر</label>
                            <input type="month" class="form-control" id="report-month" 
                                   value="${new Date().toISOString().slice(0, 7)}" 
                                   onchange="generateWorkHoursReport()">
                        </div>
                    </div>
                    <div id="work-hours-report"></div>
                </div>
            </div>
        </div>
    `;
    
    // Set default date to today
    document.getElementById('time-tracking-date').valueAsDate = new Date();
    
    // Generate initial report
    generateWorkHoursReport();
}

// Handle time tracking form submission
function handleTimeTrackingSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const employeeSelect = document.getElementById('time-tracking-employee-select');
    const dateInput = document.getElementById('time-tracking-date');
    const timeInInput = document.getElementById('time-in');
    const timeOutInput = document.getElementById('time-out');
    const notesInput = document.getElementById('time-tracking-notes');
    
    if (!employeeSelect || !dateInput || !timeInInput || !timeOutInput) {
        showAlert('حدث خطأ في النموذج', 'danger');
        return;
    }
    
    // Get employee details
    const employee = window.appState.employees.find(emp => emp.code === employeeSelect.value);
    if (!employee) {
        showAlert('لم يتم العثور على الموظف', 'danger');
        return;
    }
    
    const timeRecord = {
        id: Date.now().toString(),
        employeeCode: employeeSelect.value,
        employeeName: employee.name,
        date: dateInput.value,
        timeIn: timeInInput.value,
        timeOut: timeOutInput.value,
        notes: notesInput ? notesInput.value : '',
        createdAt: new Date().toISOString()
    };
    
    // Add to state
    window.appState.timeRecords.push(timeRecord);
    
    // Save to localStorage
    saveToLocalStorage('timeRecords', window.appState.timeRecords);
    
    // Show success message
    showAlert('تم حفظ سجل الدوام بنجاح', 'success');
    
    // Reset form
    form.reset();
    dateInput.valueAsDate = new Date();
    
    // Refresh report
    generateWorkHoursReport();
}

// Generate work hours report
function generateWorkHoursReport() {
    const reportContainer = document.getElementById('work-hours-report');
    if (!reportContainer) return;
    
    const employeeSelect = document.getElementById('report-employee-select');
    const monthInput = document.getElementById('report-month');
    
    if (!monthInput.value) {
        reportContainer.innerHTML = '<div class="alert alert-warning">الرجاء اختيار الشهر</div>';
        return;
    }
    
    // Get date range for selected month
    const [year, month] = monthInput.value.split('-');
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);
    
    // Filter records
    let records = [...window.appState.timeRecords];
    
    if (employeeSelect && employeeSelect.value) {
        records = records.filter(record => record.employeeCode === employeeSelect.value);
    }
    
    records = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });
    
    // Sort by date
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Generate report HTML
    if (records.length === 0) {
        reportContainer.innerHTML = '<div class="alert alert-info">لا توجد سجلات دوام لهذا الشهر</div>';
        return;
    }
    
    reportContainer.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>الموظف</th>
                        <th>التاريخ</th>
                        <th>وقت الحضور</th>
                        <th>وقت الانصراف</th>
                        <th>عدد الساعات</th>
                        <th>ملاحظات</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map(record => {
                        const timeIn = new Date(`${record.date}T${record.timeIn}`);
                        const timeOut = new Date(`${record.date}T${record.timeOut}`);
                        const hours = (timeOut - timeIn) / (1000 * 60 * 60);
                        
                        return `
                            <tr>
                                <td>${record.employeeName}</td>
                                <td>${formatDate(record.date)}</td>
                                <td>${formatTime(record.timeIn)}</td>
                                <td>${formatTime(record.timeOut)}</td>
                                <td>${hours.toFixed(2)}</td>
                                <td>${record.notes || '-'}</td>
                                <td>
                                    <button class="btn btn-sm btn-danger" onclick="deleteTimeRecord('${record.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Delete time record
function deleteTimeRecord(id) {
    if (confirm('هل أنت متأكد من حذف سجل الدوام؟')) {
        window.appState.timeRecords = window.appState.timeRecords.filter(record => record.id !== id);
        saveToLocalStorage('timeRecords', window.appState.timeRecords);
        generateWorkHoursReport();
        showAlert('تم حذف سجل الدوام بنجاح', 'success');
    }
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

// Helper function to format time
function formatTime(timeString) {
    return timeString;
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
