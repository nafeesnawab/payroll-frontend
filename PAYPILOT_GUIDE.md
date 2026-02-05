# PayPilot - Complete User Guide

## What is PayPilot?

**PayPilot** is a South African payroll management system designed to help businesses:
- Pay employees correctly and on time
- Stay compliant with SARS (tax authority) requirements
- Manage leave and employee records
- Generate statutory filings (EMP201, UIF, IRP5)

Think of it as your company's payroll assistant that handles all the complex calculations and compliance requirements.

---

## Login Flows Explained

When you open PayPilot, there are **3 different login scenarios**:

### Flow 1: Single Company User (Simple)
```
Login → Dashboard
```
- User enters email/password
- User has access to only ONE company
- Goes directly to the Dashboard
- **Demo account:** `single@paypilot.co.za` / `Single@123`

### Flow 2: Multi-Company User
```
Login → Company Selection → Dashboard
```
- User enters email/password
- User has access to MULTIPLE companies
- Must choose which company to work with
- Then goes to Dashboard
- Can switch companies later

### Flow 3: Two-Factor Authentication (2FA)
```
Login → 2FA Code Entry → Company Selection (if multi) → Dashboard
```
- User enters email/password
- System asks for 6-digit code from authenticator app
- Extra security layer for sensitive payroll data
- **Demo account:** `demo@paypilot.co.za` / `Demo@123` (2FA code: `123456`)

---

## Main Dashboard

After login, you land on the **Dashboard** which shows:

| Section | What It Shows |
|---------|---------------|
| **Compliance Status** | Are your tax filings up to date? (EMP201, UIF) |
| **Workforce Overview** | How many employees, who's on leave, any errors |
| **Payroll Status** | Current payrun status, next pay date |
| **Notifications** | Important alerts requiring your attention |
| **Quick Actions** | Shortcuts to common tasks |

---

## Sidebar Navigation - What Each Section Does

### 1. DASHBOARD
The home screen with overview of everything.

---

### 2. EMPLOYEES
**Purpose:** Manage all your staff records

| Feature | Description |
|---------|-------------|
| Employee List | View all employees with search/filter |
| Add Employee | Create new employee record |
| Employee Profile | View/edit individual employee details |

**Employee Profile includes:**
- Personal info (ID, contact details)
- Bank details for salary payment
- Tax information (PAYE, UIF)
- Salary and benefits
- Leave balances

---

### 3. PAYROLL
**Purpose:** Process monthly/weekly salary payments

| Feature | Description |
|---------|-------------|
| Payrun List | View all past and current payruns |
| Create Payrun | Start a new payroll cycle |
| Payrun Detail | Review and finalize a specific payrun |
| Payslip Editor | Adjust individual employee pay |

**Payroll Flow:**
```
Create Payrun → Review Employees → Make Adjustments → Finalize → Generate Payslips
```

---

### 4. LEAVE
**Purpose:** Track employee time off

| Feature | Description |
|---------|-------------|
| Leave Calendar | Visual calendar of who's off when |
| Leave Requests | Pending requests to approve/reject |
| Leave Balances | How many days each employee has left |
| Leave Settings | Configure leave types and rules |

**Leave Types in South Africa:**
- Annual Leave (15-21 days/year)
- Sick Leave (30 days over 3 years)
- Family Responsibility Leave (3 days/year)
- Maternity Leave (4 months)

---

### 5. TERMINATIONS
**Purpose:** Handle employee exits properly

| Feature | Description |
|---------|-------------|
| Termination List | All past terminations |
| New Termination | Process an employee leaving |
| Final Pay Calculation | Calculate last paycheck + leave payout |

---

### 6. FILINGS
**Purpose:** Submit required documents to government

| Filing | What It Is | When Due |
|--------|------------|----------|
| **EMP201** | Monthly PAYE/UIF/SDL declaration | 7th of each month |
| **EMP501** | Annual reconciliation | End of tax year |
| **UIF** | Unemployment fund declarations | Monthly |
| **IRP5** | Annual employee tax certificates | February |

---

### 7. REPORTS
**Purpose:** Generate various reports

| Report Type | Examples |
|-------------|----------|
| Payroll Reports | Payroll summary, cost breakdown |
| Employee Reports | Staff list, new hires, terminations |
| Leave Reports | Balances, leave taken |
| Financial Reports | Payroll journal, bank files |

---

### 8. CALENDAR
**Purpose:** Manage working days and holidays

| Feature | Description |
|---------|-------------|
| Calendar View | Visual monthly calendar |
| Public Holidays | SA public holidays |
| Company Overrides | Your specific non-working days |

---

### 9. SETTINGS
**Purpose:** Configure your company and payroll rules

| Setting | What You Configure |
|---------|-------------------|
| **Employer Details** | Company name, registration, address |
| **Banking & EFT** | Bank account for salary payments |
| **Pay Frequencies** | Weekly, fortnightly, monthly |
| **Leave Types** | Annual, sick, custom leave |
| **Payroll Items** | Allowances, deductions, benefits |

---

### 10. NOTIFICATIONS
**Purpose:** Manage alerts and reminders

- Email notification preferences
- System alerts
- Reminder settings

---

### 11. DATA OPERATIONS
**Purpose:** Import/export data

| Feature | Description |
|---------|-------------|
| Import | Bulk upload employees from Excel |
| Export | Download reports and data |
| Migration | Move data from another system |

---

### 12. HELP CENTER
**Purpose:** Get assistance

- Search help articles
- Browse by category
- Contact support
- Submit tickets

---

## Key South African Payroll Terms

| Term | Meaning |
|------|---------|
| **PAYE** | Pay As You Earn - income tax deducted from salary |
| **UIF** | Unemployment Insurance Fund - 1% from employee + 1% from employer |
| **SDL** | Skills Development Levy - 1% of payroll (companies >R500k/year) |
| **EMP201** | Monthly return declaring PAYE, UIF, SDL |
| **IRP5** | Annual tax certificate for each employee |
| **SARS** | South African Revenue Service (tax authority) |

---

## Quick Start Checklist

When setting up PayPilot for a new company:

- [ ] Complete Employer Details (Settings)
- [ ] Add Bank Account (Settings → Banking)
- [ ] Configure Pay Frequency (Settings)
- [ ] Set up Leave Types (Settings)
- [ ] Add Employees
- [ ] Run First Payroll
- [ ] Submit EMP201

---

## Demo Accounts

| Account | Password | Features |
|---------|----------|----------|
| `single@paypilot.co.za` | `Single@123` | Single company, no 2FA |
| `demo@paypilot.co.za` | `Demo@123` | Multi-company, 2FA enabled (code: 123456) |

---

## Technical Notes

- **Frontend:** React 19 + TypeScript + TailwindCSS
- **State Management:** Zustand
- **API Mocking:** MSW (Mock Service Worker)
- **All data is mock data** - no real backend connected

---

*PayPilot - Making South African Payroll Simple*
