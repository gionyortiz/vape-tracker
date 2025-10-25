// Employee Management System
class EmployeeManager {
    constructor(app) {
        this.app = app;
        this.currentEmployee = null;
        this.employees = [];
        this.roles = {
            owner: {
                name: 'Owner',
                permissions: ['all'],
                level: 100
            },
            manager: {
                name: 'Manager',
                permissions: ['sales', 'inventory', 'reports', 'customers', 'employees_view'],
                level: 80
            },
            supervisor: {
                name: 'Supervisor',
                permissions: ['sales', 'inventory', 'customers', 'reports_view'],
                level: 60
            },
            cashier: {
                name: 'Cashier',
                permissions: ['sales', 'customers_basic'],
                level: 40
            },
            intern: {
                name: 'Intern',
                permissions: ['sales_supervised'],
                level: 20
            }
        };
        this.shifts = [];
        this.timeEntries = [];
        this.loadEmployeeData();
    }

    loadEmployeeData() {
        this.employees = JSON.parse(localStorage.getItem('vape_employees')) || this.getDefaultEmployees();
        this.shifts = JSON.parse(localStorage.getItem('vape_shifts')) || [];
        this.timeEntries = JSON.parse(localStorage.getItem('vape_time_entries')) || [];
        this.currentEmployee = JSON.parse(localStorage.getItem('vape_current_employee')) || null;
    }

    saveEmployeeData() {
        localStorage.setItem('vape_employees', JSON.stringify(this.employees));
        localStorage.setItem('vape_shifts', JSON.stringify(this.shifts));
        localStorage.setItem('vape_time_entries', JSON.stringify(this.timeEntries));
        localStorage.setItem('vape_current_employee', JSON.stringify(this.currentEmployee));
    }

    getDefaultEmployees() {
        return [
            {
                id: 'admin',
                username: 'admin',
                password: this.hashPassword('admin123'), // In production, use proper hashing
                firstName: 'Store',
                lastName: 'Owner',
                email: 'owner@elduro-vaper.com',
                phone: '',
                role: 'owner',
                hourlyRate: 0,
                commission: 0,
                hireDate: new Date().toISOString(),
                isActive: true,
                lastLogin: null,
                totalSales: 0,
                totalHours: 0,
                avatar: null,
                emergencyContact: {
                    name: '',
                    phone: '',
                    relation: ''
                },
                permissions: this.roles.owner.permissions
            }
        ];
    }

    // Authentication
    async login(username, password) {
        const employee = this.employees.find(emp => 
            emp.username === username && emp.isActive
        );

        if (!employee) {
            throw new Error('Invalid username or employee is inactive');
        }

        if (!this.verifyPassword(password, employee.password)) {
            throw new Error('Invalid password');
        }

        this.currentEmployee = employee;
        employee.lastLogin = new Date().toISOString();
        this.saveEmployeeData();

        // Log login
        this.logActivity('login', `${employee.firstName} ${employee.lastName} logged in`);

        return employee;
    }

    logout() {
        if (this.currentEmployee) {
            this.logActivity('logout', `${this.currentEmployee.firstName} ${this.currentEmployee.lastName} logged out`);
            this.clockOut(this.currentEmployee.id);
        }
        this.currentEmployee = null;
        localStorage.removeItem('vape_current_employee');
    }

    hashPassword(password) {
        // Simple hash for demo - use bcrypt or similar in production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    // Employee CRUD operations
    addEmployee(employeeData) {
        const employee = {
            id: this.generateEmployeeId(),
            username: employeeData.username,
            password: this.hashPassword(employeeData.password),
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email || '',
            phone: employeeData.phone || '',
            role: employeeData.role,
            hourlyRate: parseFloat(employeeData.hourlyRate) || 0,
            commission: parseFloat(employeeData.commission) || 0,
            hireDate: new Date().toISOString(),
            isActive: true,
            lastLogin: null,
            totalSales: 0,
            totalHours: 0,
            avatar: null,
            emergencyContact: employeeData.emergencyContact || {
                name: '',
                phone: '',
                relation: ''
            },
            permissions: this.roles[employeeData.role]?.permissions || []
        };

        // Check for duplicate username
        if (this.employees.find(emp => emp.username === employee.username)) {
            throw new Error('Username already exists');
        }

        this.employees.push(employee);
        this.saveEmployeeData();
        this.logActivity('employee_added', `New employee added: ${employee.firstName} ${employee.lastName}`);

        return employee;
    }

    updateEmployee(employeeId, updateData) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        // Update allowed fields
        const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'role', 'hourlyRate', 'commission', 'isActive', 'emergencyContact'];
        allowedFields.forEach(field => {
            if (updateData.hasOwnProperty(field)) {
                employee[field] = updateData[field];
            }
        });

        // Update permissions based on role
        if (updateData.role) {
            employee.permissions = this.roles[updateData.role]?.permissions || [];
        }

        this.saveEmployeeData();
        this.logActivity('employee_updated', `Employee updated: ${employee.firstName} ${employee.lastName}`);

        return employee;
    }

    deleteEmployee(employeeId) {
        const employeeIndex = this.employees.findIndex(emp => emp.id === employeeId);
        if (employeeIndex === -1) {
            throw new Error('Employee not found');
        }

        const employee = this.employees[employeeIndex];
        
        // Don't actually delete, just deactivate
        employee.isActive = false;
        employee.terminationDate = new Date().toISOString();

        this.saveEmployeeData();
        this.logActivity('employee_deactivated', `Employee deactivated: ${employee.firstName} ${employee.lastName}`);

        return employee;
    }

    // Time tracking
    clockIn(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        // Check if already clocked in
        const existingEntry = this.timeEntries.find(entry => 
            entry.employeeId === employeeId && !entry.clockOut
        );

        if (existingEntry) {
            throw new Error('Employee is already clocked in');
        }

        const timeEntry = {
            id: this.app.generateId(),
            employeeId: employeeId,
            clockIn: new Date().toISOString(),
            clockOut: null,
            breakTime: 0,
            totalHours: 0,
            date: new Date().toDateString()
        };

        this.timeEntries.push(timeEntry);
        this.saveEmployeeData();
        this.logActivity('clock_in', `${employee.firstName} ${employee.lastName} clocked in`);

        return timeEntry;
    }

    clockOut(employeeId) {
        const timeEntry = this.timeEntries.find(entry => 
            entry.employeeId === employeeId && !entry.clockOut
        );

        if (!timeEntry) {
            return; // No active clock-in
        }

        const employee = this.employees.find(emp => emp.id === employeeId);
        timeEntry.clockOut = new Date().toISOString();
        
        // Calculate total hours
        const clockInTime = new Date(timeEntry.clockIn);
        const clockOutTime = new Date(timeEntry.clockOut);
        const totalMinutes = (clockOutTime - clockInTime) / (1000 * 60);
        timeEntry.totalHours = Math.round((totalMinutes - timeEntry.breakTime) / 60 * 100) / 100;

        // Update employee total hours
        employee.totalHours += timeEntry.totalHours;

        this.saveEmployeeData();
        this.logActivity('clock_out', `${employee.firstName} ${employee.lastName} clocked out (${timeEntry.totalHours} hours)`);

        return timeEntry;
    }

    startBreak(employeeId) {
        const timeEntry = this.timeEntries.find(entry => 
            entry.employeeId === employeeId && !entry.clockOut
        );

        if (!timeEntry) {
            throw new Error('Employee is not clocked in');
        }

        timeEntry.breakStart = new Date().toISOString();
        this.saveEmployeeData();

        const employee = this.employees.find(emp => emp.id === employeeId);
        this.logActivity('break_start', `${employee.firstName} ${employee.lastName} started break`);
    }

    endBreak(employeeId) {
        const timeEntry = this.timeEntries.find(entry => 
            entry.employeeId === employeeId && !entry.clockOut && entry.breakStart
        );

        if (!timeEntry) {
            throw new Error('Employee is not on break');
        }

        const breakStart = new Date(timeEntry.breakStart);
        const breakEnd = new Date();
        const breakMinutes = (breakEnd - breakStart) / (1000 * 60);
        
        timeEntry.breakTime += breakMinutes;
        delete timeEntry.breakStart;
        this.saveEmployeeData();

        const employee = this.employees.find(emp => emp.id === employeeId);
        this.logActivity('break_end', `${employee.firstName} ${employee.lastName} ended break`);
    }

    // Sales tracking and commission
    recordSale(employeeId, transaction) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;

        employee.totalSales += transaction.total;
        
        // Calculate commission
        if (employee.commission > 0) {
            const commission = transaction.total * (employee.commission / 100);
            
            // Store commission record
            const commissionRecord = {
                id: this.app.generateId(),
                employeeId: employeeId,
                transactionId: transaction.id,
                saleAmount: transaction.total,
                commissionRate: employee.commission,
                commissionAmount: commission,
                date: new Date().toISOString(),
                isPaid: false
            };

            // Add to commissions array (create if doesn't exist)
            if (!this.commissions) {
                this.commissions = [];
            }
            this.commissions.push(commissionRecord);
        }

        this.saveEmployeeData();
    }

    // Payroll calculations
    calculatePayroll(employeeId, startDate, endDate) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Get time entries for period
        const periodEntries = this.timeEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entry.employeeId === employeeId && 
                   entryDate >= start && 
                   entryDate <= end &&
                   entry.clockOut;
        });

        const totalHours = periodEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
        const regularHours = Math.min(totalHours, 40);
        const overtimeHours = Math.max(totalHours - 40, 0);

        const regularPay = regularHours * employee.hourlyRate;
        const overtimePay = overtimeHours * employee.hourlyRate * 1.5;

        // Calculate commissions for period
        const periodCommissions = (this.commissions || []).filter(comm => {
            const commDate = new Date(comm.date);
            return comm.employeeId === employeeId &&
                   commDate >= start &&
                   commDate <= end &&
                   !comm.isPaid;
        });

        const totalCommission = periodCommissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);

        return {
            employee: employee,
            period: { start: startDate, end: endDate },
            hours: {
                regular: regularHours,
                overtime: overtimeHours,
                total: totalHours
            },
            pay: {
                regular: regularPay,
                overtime: overtimePay,
                commission: totalCommission,
                gross: regularPay + overtimePay + totalCommission
            },
            commissions: periodCommissions,
            timeEntries: periodEntries
        };
    }

    // Permissions system
    hasPermission(permission) {
        if (!this.currentEmployee) {
            return false;
        }

        const permissions = this.currentEmployee.permissions || [];
        return permissions.includes('all') || permissions.includes(permission);
    }

    requirePermission(permission) {
        if (!this.hasPermission(permission)) {
            throw new Error(`Access denied. Required permission: ${permission}`);
        }
    }

    // Activity logging
    logActivity(action, description) {
        if (!this.activityLog) {
            this.activityLog = [];
        }

        const logEntry = {
            id: this.app.generateId(),
            action: action,
            description: description,
            employeeId: this.currentEmployee?.id || null,
            timestamp: new Date().toISOString(),
            ip: 'localhost', // In a real app, get actual IP
            userAgent: navigator.userAgent
        };

        this.activityLog.push(logEntry);

        // Keep only last 1000 entries
        if (this.activityLog.length > 1000) {
            this.activityLog = this.activityLog.slice(-1000);
        }

        localStorage.setItem('vape_activity_log', JSON.stringify(this.activityLog));
    }

    // Reports
    getEmployeePerformanceReport(employeeId, period = 30) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        // Get sales for period
        const employeeSales = this.app.transactions.filter(t => 
            t.type === 'sale' && 
            t.cashier === `${employee.firstName} ${employee.lastName}` &&
            new Date(t.date) >= startDate
        );

        const totalSales = employeeSales.reduce((sum, t) => sum + t.total, 0);
        const averageSale = employeeSales.length > 0 ? totalSales / employeeSales.length : 0;

        // Get time entries for period
        const timeEntries = this.timeEntries.filter(entry => 
            entry.employeeId === employeeId &&
            new Date(entry.date) >= startDate &&
            entry.clockOut
        );

        const totalHours = timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
        const salesPerHour = totalHours > 0 ? totalSales / totalHours : 0;

        return {
            employee: employee,
            period: period,
            sales: {
                total: totalSales,
                count: employeeSales.length,
                average: averageSale,
                perHour: salesPerHour
            },
            hours: {
                total: totalHours,
                average: timeEntries.length > 0 ? totalHours / timeEntries.length : 0,
                days: timeEntries.length
            },
            performance: {
                rating: this.calculatePerformanceRating(employee, employeeSales, totalHours),
                attendance: this.calculateAttendanceRate(employeeId, period)
            }
        };
    }

    calculatePerformanceRating(employee, sales, hours) {
        // Simple performance calculation
        let rating = 0;
        
        // Sales performance (40% weight)
        const avgSaleValue = sales.length > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length : 0;
        if (avgSaleValue > 50) rating += 40;
        else if (avgSaleValue > 30) rating += 30;
        else if (avgSaleValue > 20) rating += 20;
        else rating += 10;

        // Sales per hour (30% weight)
        const salesPerHour = hours > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / hours : 0;
        if (salesPerHour > 100) rating += 30;
        else if (salesPerHour > 75) rating += 25;
        else if (salesPerHour > 50) rating += 20;
        else rating += 10;

        // Hours worked (20% weight)
        if (hours >= 40) rating += 20;
        else if (hours >= 30) rating += 15;
        else if (hours >= 20) rating += 10;
        else rating += 5;

        // Attendance (10% weight)
        rating += 10; // Simplified - assume good attendance

        return Math.min(rating, 100);
    }

    calculateAttendanceRate(employeeId, period) {
        const expectedDays = Math.ceil(period / 7) * 5; // Assume 5 work days per week
        const actualDays = this.timeEntries.filter(entry => 
            entry.employeeId === employeeId &&
            new Date(entry.date) >= new Date(Date.now() - period * 24 * 60 * 60 * 1000) &&
            entry.clockOut
        ).length;

        return Math.min((actualDays / expectedDays) * 100, 100);
    }

    generateEmployeeId() {
        return 'EMP' + Date.now().toString().slice(-6);
    }

    // Schedule management
    createSchedule(employeeId, shifts) {
        const schedule = {
            id: this.app.generateId(),
            employeeId: employeeId,
            weekStarting: new Date().toISOString(),
            shifts: shifts,
            createdBy: this.currentEmployee?.id,
            createdAt: new Date().toISOString()
        };

        if (!this.schedules) {
            this.schedules = [];
        }

        this.schedules.push(schedule);
        this.saveEmployeeData();

        return schedule;
    }
}

// Add to main app
document.addEventListener('DOMContentLoaded', () => {
    if (window.vapeTracker) {
        window.vapeTracker.employeeManager = new EmployeeManager(window.vapeTracker);
        console.log('Employee management system initialized');
    }
});