# Frappe HRMS/HCM Feature Inventory

Source baseline:

- `frappe/hrms` branch `develop`, commit `342f5828c553440edba57b8490cf5b1350b9e0e0`.
- `frappe/erpnext` branch `develop`, commit `abc3da6b97f64dc6576fec37936865c0b27e3004`.

Scope:

- This document covers HRMS/HCM functionality implemented in `frappe/hrms` plus HRMS-relevant dependencies and extension points in `frappe/erpnext`.
- In this baseline, `frappe/hrms` owns the `HR` and `Payroll` modules. `frappe/erpnext` no longer contains a separate HR/Payroll module, but it still supplies the employee master, company/department/designation setup, projects/timesheets, accounting, assets, fleet, and ledgers that HRMS uses.
- Names are written as Frappe DocType/report/workspace names when possible. Paths are included only where they clarify ownership.
- Inventory counts: 159 HRMS DocTypes, 28 reports, 6 HR dashboards, 32 number cards, 33 dashboard charts, 4 notifications, and 5 print formats.

## 1. System Map

| Domain | HRMS-owned records | ERPNext dependencies | Main capabilities |
| --- | --- | --- | --- |
| Employee foundation | HR Settings, Employment Type, Employee Grade, Department Approver, Employee Property History | Employee, Company, Department, Designation, Branch, Holiday List | Employee naming, approvers, org hierarchy, HR defaults, employee profile extension |
| Lifecycle | Employee Onboarding, Employee Separation, Employee Transfer, Employee Promotion, Full and Final Statement, Exit Interview | Project, Task, Asset, Asset Movement, Journal Entry, Loan if installed | Structured joining, separation, transfers, promotions, final settlement |
| Recruitment | Staffing Plan, Job Requisition, Job Opening, Job Applicant, Interview, Job Offer, Appointment Letter, Employee Referral | Employee, Designation, Department, Company | Workforce planning, public jobs, applicant tracking, interviews, offers, referrals |
| Attendance and time | Attendance, Attendance Request, Employee Checkin, Shift Type, Shift Assignment, Shift Schedule, Overtime Slip | Holiday List, Timesheet, Activity Type, Project, Task | Attendance, checkins, shift rostering, work-from-home/on-duty, overtime, timesheets |
| Leave | Leave Type, Leave Application, Leave Allocation, Leave Policy, Leave Ledger Entry, Leave Encashment | Employee, Holiday List, Salary Structure, Additional Salary, Journal Entry | Leave balances, applications, policies, earned leaves, comp-off, encashment |
| Payroll and compensation | Salary Component, Salary Structure, Salary Slip, Payroll Entry, Additional Salary, Benefits, Tax, Gratuity, Salary Withholding | Account, Cost Center, Fiscal Year, Journal Entry, Payment Entry, GL Entry | Payroll setup, salary calculation, tax, benefits, accruals, payment entries |
| Expenses and travel | Expense Claim, Employee Advance, Travel Request, Vehicle Log | Payment Entry, Journal Entry, Account, Project, Task, Vehicle, Driver | Claims, advances, reimbursements, travel approvals, fleet expense logs |
| Performance | Goal, Appraisal Cycle, Appraisal, Employee Performance Feedback, KRA | Employee, Designation | Goals, appraisal cycles, self and reviewer feedback, final scoring |
| Learning and relations | Skill, Employee Skill Map, Training Program, Training Event, Training Feedback, Employee Grievance | Employee | Skills, training events/results/feedback, grievances |
| Self-service and API | PWA Notification, mobile API modules, roster API | Frappe workflow/permissions/files | Employee and approver portals, PWA push, workflow-aware metadata |
| Analytics | HR/Payroll reports, dashboards, number cards, charts, workspaces | ERPNext accounting/project reports | HR, payroll, attendance, recruitment, claims, tax, and workforce analytics |

## 2. ERPNext HCM Foundation

HRMS is not standalone. It depends on ERPNext for common business records and accounting behavior.

### 2.1 Organization And Employee Master

Relevant ERPNext DocTypes:

- `Employee`: base employee master. Key concepts include employee number, naming series, first/middle/last name, gender, date of birth, date of joining, status (`Active`, `Inactive`, `Suspended`, `Left`), company, branch, department, designation, reports-to, employment details, salary mode, bank details, user id, personal details, emergency contact, passport/work permit, relieving date, bio, and image.
- `Employee Education`, `Employee External Work History`, `Employee Internal Work History`: child history tables used by the employee profile and HRMS lifecycle events.
- `Company`: legal/accounting entity. HRMS hooks add or validate default HR/payroll accounts and use company currency/default holiday list.
- `Department`: nested-set department hierarchy. HRMS uses it for approvals, employee filters, payroll costing, staffing, recruitment, and reports.
- `Designation`: job title master. HRMS uses it for staffing plans, job openings, appraisal templates, skill expectations, and salary filters.
- `Branch`: employee location/entity branch filter.
- `Holiday List` and `Holiday`: shared holiday calendars. HRMS uses them for attendance, leave, payroll working days, shift processing, reminders, and onboarding task dates.
- `Employee Group`: grouping support for employees.

HRMS extensions over ERPNext Employee:

- Overrides the ERPNext `Employee` class with `hrms.overrides.employee_master.EmployeeMaster`.
- Autoname can follow HR Settings: naming series, employee number, or full name.
- Employee insert/update links Job Applicant, Job Offer, Employee Onboarding, Employee Transfer, approver roles, and realtime employee updates.
- Employee timeline includes attendance summary data.
- Retirement date helper uses `HR Settings.retirement_age`.

### 2.2 Projects, Tasks, And Timesheets

Relevant ERPNext DocTypes:

- `Project` and `Task`: used as executable task plans for Employee Onboarding and Employee Separation. HRMS also pushes Expense Claim costs to project/task totals.
- `Timesheet` and `Timesheet Detail`: employee time records used for timesheet-based salary slips, utilization reporting, and project profitability.
- `Activity Type` and `Activity Cost`: define activity rates used with timesheets.
- `Projects Settings`: affects timesheet overlap behavior and sales invoice integration.

HRMS extensions:

- Overrides ERPNext `Timesheet` with `hrms.overrides.employee_timesheet.EmployeeTimesheet`.
- Validates active employees in timesheets.
- Uses timesheets in Salary Slip calculations when a Salary Structure is configured as salary-slip-based-on-timesheet.

### 2.3 Accounting And Payments

Relevant ERPNext DocTypes:

- `Account`, `Cost Center`, `Accounting Dimension`, `Fiscal Year`, `Currency`, `Mode of Payment`: accounting setup used by payroll, expenses, advances, gratuity, and leave encashment.
- `Payment Entry`: HRMS supports Employee as a party for reimbursements/advances and overrides it with `EmployeePaymentEntry`.
- `Journal Entry` and `Journal Entry Account`: HRMS creates and reacts to journal entries for payroll accrual/payment, expense claims, employee advances, full-and-final settlement, gratuity, leave encashment, salary withholding, and tax/payroll liabilities.
- `GL Entry`, `Payment Ledger Entry`, `Advance Payment Ledger Entry`: backing ledgers for claim/advance/payment status.
- `Bank Account` and `Bank Transaction`: used for employee bank details, salary payment reports, and bank reconciliation.

HRMS accounting hooks:

- Treats `Expense Claim` as invoice-like and bank-reconciliation capable.
- Treats `Leave Encashment`, `Gratuity`, and `Employee Advance` as advance-payment-payable records.
- Treats `Payroll Entry` as a period-closing-sensitive DocType.
- Adds accounting dimensions to `Expense Claim`, `Expense Claim Detail`, `Expense Taxes and Charges`, `Payroll Entry`, and `Leave Encashment`.
- Journal Entry events update Expense Claim payment status, Full and Final Statement status, Salary Withholding payment status, Gratuity status, Leave Encashment status, and salary slip references.

### 2.4 Assets, Fleet, And Operational Employee Links

Relevant ERPNext records:

- `Asset`, `Asset Movement`, `Asset Movement Item`: employee asset custody and return. Full and Final Statement reads allocated assets and enforces return or recovery.
- `Vehicle` and `Driver`: used by HRMS `Vehicle Log` and fleet/expense reporting.
- `Delivery Trip`: HRMS adds client customization.
- Manufacturing/project operational records may contain employee time references, such as Job Card time logs, but HRMS does not own the manufacturing module.

## 3. HRMS Configuration And Platform Behavior

### 3.1 Modules, App Routes, And Workspaces

HRMS modules:

- `HR`
- `Payroll`

App routes:

- `/hrms/<path:app_path>` routes to the HRMS SPA.
- `/hr/<path:app_path>` routes to the roster UI.
- `Job Opening` is a website generator for public job pages.

Main workspaces:

- `HR Setup`: employee and organization setup, leave/attendance/expense setup, HR settings, daily work summary groups, workforce reports.
- `Recruitment`: staffing, requisitions, openings, applicants, interviews, offers, appointment letters, referrals.
- `Leaves`: leave setup, applications, allocations, policies, comp-off, encashment, leave reports.
- `Shift & Attendance`: attendance, attendance requests, checkins, shifts, schedules, overtime, timesheets, utilization reports.
- `Payroll`: salary components/structures/slips, payroll entry, withholdings, payroll reports, accounting links.
- `Tax & Benefits`: benefits, tax slabs, declarations, proof submissions, tax reports.
- `Expenses`: employee advances, expense claims, travel, vehicle logs, reimbursements and accounting reports.
- `Performance`: goals, appraisal cycles, appraisals, feedback, KRAs, promotion.
- `Tenure`: onboarding, separation, skills, training, grievances, daily work summary.

### 3.2 HR Settings

`HR Settings` is a single DocType controlling HR-wide behavior. Important capabilities:

- Employee naming method: naming series, employee number, or full name.
- Retirement age for retirement-date calculation.
- Mandatory approver settings and prevention of self approval.
- Default holiday and leave notification templates.
- Birthday, holiday, and work-anniversary reminder settings.
- Backdated leave restriction role.
- Standard working hours.
- Mobile checkin enablement and geolocation enforcement.
- Multiple shift assignment allowance.
- Automatic leave encashment support.
- Staffing vacancy checks.
- Interview reminder settings/templates.
- Payment unlink behavior when Employee Advance is cancelled.

### 3.3 Payroll Settings

`Payroll Settings` is a single DocType controlling payroll behavior:

- Payroll working-day basis: leave-based or attendance-based.
- Treatment of holidays in working-day calculations.
- Treatment of unmarked attendance as present or absent.
- Half-day wage fraction.
- Maximum working hours against timesheets.
- Salary slip email sending and encryption/password settings.
- Mandatory flexible benefits.
- Payroll accounting entry behavior, including employee-wise accounting.
- Automatic overtime slip creation/submission.
- Salary slip rounding and rounded-total display.

### 3.4 Approvers And Permissions

Approver-related records:

- `Department Approver`: child table for department-level approvers.
- Employee fields for leave approver and expense approver.
- APIs discover approvers from employee records and parent department hierarchy.

Behavior:

- User validation and Employee validation update approver roles.
- HR Settings can require approvers and block self approval.
- Leave Application and Expense Claim validate approver rules.
- Workflow-aware APIs expose permitted fields and actions to employee-facing clients.

### 3.5 Scheduler Jobs

HRMS scheduled behavior:

- All scheduler ticks: interview reminders.
- Hourly: daily work summary group emails.
- Hourly long: update checkin sync timestamps, process auto attendance for shifts, create rolling shift assignments.
- Daily: birthday reminders, work anniversary reminders, daily work summary processing, interview feedback reminders, expired shift assignment cleanup, expired job opening closure, attendance pulse capture.
- Daily long: expired leave allocation processing, automatic leave encashment, earned leave allocation.
- Weekly/monthly: holiday reminders in advance.

## 4. Employee Core And Lifecycle

### 4.1 Employee Profile And Employment Metadata

HRMS-relevant employee metadata:

- Employment type, employee grade, branch, department, designation, reports-to, company, joining/relieving dates.
- Approvers for leave and expenses.
- Bank/payment details used for payroll and reimbursements.
- Education, external work history, internal work history, property history.
- Skill map, trainings, health insurance, identification document types and interests.

Behavior:

- New employee can be created from Employee Onboarding or Job Offer.
- If created from a Job Applicant, HRMS marks the applicant accepted and updates the latest Job Offer.
- Employee updates publish realtime changes and update linked lifecycle records.
- Employee deletion/after-delete events publish updates and clean transfer state.

### 4.2 Onboarding And Separation

DocTypes:

- `Employee Onboarding`
- `Employee Onboarding Template`
- `Employee Separation`
- `Employee Separation Template`
- `Employee Boarding Activity`

Capabilities:

- Templates define activities, responsible users/roles, begin/end offsets, and mandatory tasks.
- Submitting onboarding/separation creates an ERPNext Project and child Tasks.
- Task dates are shifted around holidays.
- Project percent completion drives boarding status: `Pending`, `In Process`, `Completed`.
- Onboarding can create the Employee only after mandatory tasks are complete.
- Cancel deletes linked project/tasks.
- Project and Task updates push status back to onboarding/separation.

### 4.3 Promotion

DocType:

- `Employee Promotion`

Capabilities:

- Validates employee is active.
- Blocks submit before the promotion date.
- Updates employee internal work history.
- Can update compensation/CTC data.
- Cancellation restores previous employee state where applicable.

### 4.4 Transfer

DocType:

- `Employee Transfer`

Capabilities:

- Validates transfer date and active employee state.
- Updates work history and changed employee properties.
- Can update existing Employee or create a new Employee ID.
- When creating a new Employee ID, moves `user_id` to the new employee and marks the old employee `Left`.
- Cancellation requires cleanup of generated employee records before reversal when a new Employee ID was created.

### 4.5 Full And Final Settlement

DocTypes:

- `Full and Final Statement`
- `Full and Final Asset`
- `Full and Final Outstanding Statement`

Capabilities:

- Requires employee relieving date.
- Pulls settlement payables: withheld salary slips, gratuity, expense claims, bonus/additional salary, leave encashment.
- Pulls receivables: employee advances and loans when the lending app is installed.
- Pulls assigned assets from ERPNext Asset Movement.
- Enforces settlement of payables/receivables and asset return or recovery.
- Can create Journal Entry for final settlement.
- Journal Entry hooks update paid/unpaid state on Full and Final Statement and linked payroll/leave/gratuity records.

### 4.6 Exit And Employee Relations

DocTypes:

- `Exit Interview`
- `Employee Grievance`
- `Grievance Type`
- `Employee Health Insurance`

Capabilities:

- Exit interviews support scheduled exit process tracking.
- Employee Grievance statuses include `Open`, `Investigated`, `Resolved`, `Invalid`, and `Cancelled`.
- Health insurance records store employee coverage information.

## 5. Recruitment And Talent Acquisition

### 5.1 Workforce Planning

DocTypes:

- `Staffing Plan`
- `Staffing Plan Detail`
- `Job Requisition`

Capabilities:

- Staffing Plan controls headcount/vacancy budgets by designation, company, department, branch, and time period.
- Validates overlapping staffing plans and parent/subsidiary company constraints.
- Tracks current employees, openings, vacancies, and estimated budget.
- Can populate staffing requirements from Job Requisitions.
- Job Requisition tracks requested by, designation, department, positions, expected compensation, status, and time-to-fill.
- Job Requisition maps to Job Opening and updates vacancy state.

### 5.2 Job Openings

DocTypes:

- `Job Opening`
- `Job Opening Template`

Capabilities:

- Public website generator with routes under job pages.
- Supports publish/unpublish, salary range visibility, applications received visibility, company, designation, department, location, employment type, and descriptions.
- Validates current vacancies against active Staffing Plan when vacancy checks are enabled.
- Scheduler closes expired openings.
- Closing linked openings can mark Job Requisition filled.
- Can block duplicate applicants per opening.

### 5.3 Applicants And Pipeline

DocTypes:

- `Job Applicant`
- `Job Applicant Source`

Capabilities:

- Applicant naming is email-based with suffixes for duplicate names.
- Validates applicant email.
- Blocks application to closed openings.
- Optional duplicate prevention per job opening.
- Public web form defaults source to website listing.
- Integrates employee referrals.
- Creates applicant kanban board support.
- Tracks applicant status and links interviews/offers.
- Supports applicant-to-hire analytics.

### 5.4 Interviews And Feedback

DocTypes:

- `Interview`
- `Interview Detail`
- `Interview Type`
- `Interviewer`
- `Interview Feedback`

Capabilities:

- Schedules interviews against applicant, job opening, designation, interview type, and interviewers.
- Prevents duplicate submitted interview types for the same applicant.
- Statuses include pending/review/cleared/rejected/cancelled states.
- Rescheduling can send email notifications.
- Scheduler sends interview reminders and feedback reminders.
- Interview Feedback is restricted to assigned interviewers.
- Feedback cannot be submitted before the interview date.
- Skill-wise ratings are averaged into interview rating.
- Submitting feedback updates Interview average rating.

### 5.5 Offers, Appointment Letters, And Referrals

DocTypes:

- `Job Offer`
- `Job Offer Term`
- `Job Offer Term Template`
- `Offer Term`
- `Appointment Letter`
- `Appointment Letter Template`
- `Appointment Letter content`
- `Employee Referral`

Capabilities:

- Job Offer prevents multiple active offers for an applicant.
- Job Offer can validate staffing vacancies.
- Accepted/rejected offer updates Job Applicant.
- Job Offer maps to Employee.
- Offer terms are reusable and printable.
- Appointment Letter supports template-driven appointment documents.
- Employee Referral validates unique candidate email and active referrer.
- Referral creates Job Applicant with source `Employee Referral`.
- Referral bonus can create Additional Salary.
- Referral tracks hiring status and bonus payment status.

## 6. Attendance, Time, Shifts, And Overtime

### 6.1 Attendance

DocTypes:

- `Attendance`
- `Employee Attendance Tool`

Attendance statuses:

- `Present`
- `Absent`
- `On Leave`
- `Half Day`
- `Work From Home`

Capabilities:

- Validates employee active state, joining date, duplicate attendance, overlapping shift attendance, and leave conflicts.
- Approved Leave Application can set Attendance as `On Leave` or `Half Day`.
- Cancellation unlinks related Employee Checkins.
- Attendance Tool bulk-marks unmarked days and can enqueue large ranges.
- Attendance calendar includes holidays.
- Attendance feeds payroll working-day calculations and reports.

### 6.2 Attendance Requests

DocType:

- `Attendance Request`

Request types:

- `Work From Home`
- `On Duty`

Capabilities:

- Validates active employee, date range, shift overlap, half-day rules, and duplicate/impossible days.
- On submit, creates or overwrites Attendance records for the request period.
- Skips holidays/leaves where applicable.
- On cancel, cancels generated attendance.

### 6.3 Employee Checkins

DocType:

- `Employee Checkin`

Capabilities:

- Captures timestamped `IN`/`OUT` logs.
- Validates active employee and duplicate logs.
- Prevents time changes after linked attendance exists.
- Resolves shift based on timestamp.
- Supports mobile checkin.
- If geolocation is enabled, requires latitude/longitude and validates distance from `Shift Location` radius.
- Exposes API to add logs based on an employee field, such as employee id or attendance device id.

### 6.4 Shift Management And Rostering

DocTypes:

- `Shift Type`
- `Shift Assignment`
- `Shift Assignment Tool`
- `Shift Location`
- `Shift Request`
- `Shift Schedule`
- `Shift Schedule Assignment`

Capabilities:

- Shift Type defines start/end time, buffers, working-hours mode, auto attendance, late entry, early exit, absent/half-day thresholds, and grace periods.
- Auto attendance derives working hours from Employee Checkins.
- IN/OUT determination can be alternating or strict by log type.
- Working hours can use first/last checkin or every valid pair.
- Missing checkins can auto-mark absence after configured thresholds.
- Shift Assignment validates active employee, date range, overlapping assignments, and same-day timing conflicts.
- Multiple shift assignments are controlled by HR Settings.
- Expired shift assignments can be marked inactive by scheduler.
- Shift Schedule Assignment creates rolling shift assignments from weekly or multi-week patterns and repeat days.
- Roster API supports filtered roster events, schedule creation/deletion, shift swaps, shift breaks, and merge/insert assignment operations.

### 6.5 Timesheets

ERPNext DocTypes used by HRMS:

- `Timesheet`
- `Timesheet Detail`
- `Activity Type`
- `Activity Cost`

Capabilities:

- Employee timesheets validate active employee through HRMS overrides.
- Salary Structure can be configured for timesheet-based payroll.
- Salary Slip can calculate earnings from approved/submitted timesheet hours and rates.
- HRMS reports include employee utilization and project profitability based on timesheets.

### 6.6 Overtime

DocTypes:

- `Overtime Type`
- `Overtime Slip`
- `Overtime Details`
- `Overtime Salary Component`

Capabilities:

- Overtime Type defines rate calculation mode, salary components, weekend multipliers, public holiday multipliers, and caps.
- Overtime Slip pulls Attendance records with overtime type and duration.
- Validates maximum overtime hours.
- Calculates overtime by fixed hourly rate or salary-component-based amount.
- Creates Additional Salary entries by configured overtime salary components.
- Payroll Entry can create and optionally submit overtime slips when Payroll Settings enables it.

## 7. Leave Management

### 7.1 Leave Setup

DocTypes:

- `Leave Type`
- `Leave Period`
- `Leave Block List`
- `Leave Block List Date`
- `Leave Block List Allow`
- `Holiday List Assignment`

Leave Type capabilities:

- Leave without pay.
- Partially paid leave.
- Earned leave.
- Compensatory leave.
- Optional leave.
- Carry forward.
- Negative leave and over-allocation controls.
- Encashment.
- Maximum continuous leave days.
- Maximum leave days.
- Include/exclude holidays within leave.
- Applicable-after date.
- Earned leave frequency: monthly, quarterly, half-yearly, yearly.
- Earned leave rounding and allocation day.

### 7.2 Leave Application

DocType:

- `Leave Application`

Capabilities:

- Validates active employee, date range, backdated restrictions, allocation period, leave balance, overlapping leave, maximum days, leave block lists, salary processed days, attendance conflict, optional holidays, applicable-after date, and self approval.
- Uses approver rules from Employee and Department Approver hierarchy.
- Submit accepts only approved/rejected states.
- Approved leave updates Attendance and Leave Ledger Entry.
- Handles half-day leave.
- Handles backdated post-expiry reverse ledger entries.
- Cancellation creates reverse ledger entries and cancels linked attendance.
- Calendar integration shows leave applications.
- PWA notifications support employee/approver flow.

### 7.3 Allocations, Policies, And Earned Leave

DocTypes:

- `Leave Allocation`
- `Leave Policy`
- `Leave Policy Detail`
- `Leave Policy Assignment`
- `Earned Leave Schedule`
- `Leave Ledger Entry`

Capabilities:

- Leave Allocation validates date periods, overlap, leave type, carry-forward, over-allocation, and backdated allocation rules.
- Allocation submit creates ledger entries for carry-forward and new leave amounts.
- Submitted allocation update creates difference ledger entries.
- Earned leave allocations tied to policy assignment cannot be manually changed.
- Leave Policy Assignment can derive dates from Leave Period or Joining Date.
- Prevents overlapping assignments.
- Creates Leave Allocations for all policy leave types.
- Supports pro-rata and earned leave schedules.
- Bulk policy assignment is available for multiple employees.
- Leave Ledger Entry is the auditable balance source.

### 7.4 Compensatory Leave

DocType:

- `Compensatory Leave Request`

Capabilities:

- Validates work dates are holidays.
- Validates attendance exists for the employee on compensatory work dates.
- Creates or updates Leave Allocation effective after the compensatory work date.
- Creates Leave Ledger Entry.
- Cancellation reverses ledger impact.

### 7.5 Leave Encashment

DocType:

- `Leave Encashment`

Capabilities:

- Requires encashable Leave Type.
- Calculates available leave balance and encashable days.
- Respects non-encashable days and maximum encashable limits.
- Calculates amount per day from Salary Structure Assignment/Salary Structure.
- Can pay through Additional Salary or accounting/payment flow.
- Updates Leave Allocation encashed leaves and Leave Ledger Entry.
- Statuses include draft/submitted/unpaid/paid/cancelled behavior.
- Scheduler can generate encashments automatically when configured.

### 7.6 Leave Adjustment And Control Panel

DocTypes:

- `Leave Adjustment`
- `Leave Control Panel`

Capabilities:

- Leave Adjustment applies one adjustment per allocation.
- Validates nonzero adjustment, maximum allocation, and balance before reductions.
- Submit creates adjustment ledger entry; cancel reverses it.
- Leave Control Panel bulk-creates Leave Allocation or Leave Policy Assignment for filtered employees.
- Bulk operations publish realtime success/failure results.

## 8. Payroll, Tax, Benefits, And Compensation

### 8.1 Payroll Setup

DocTypes:

- `Salary Component`
- `Salary Component Account`
- `Salary Detail`
- `Salary Structure`
- `Salary Structure Assignment`
- `Payroll Period`
- `Payroll Period Date`
- `Bulk Salary Structure Assignment`
- `Payroll Settings`

Capabilities:

- Salary Component supports earning, deduction, and employer contribution components.
- Salary Component supports formulas, conditions, payment-day dependency, tax flags, flexible benefit flags, statistical flags, do-not-include flags, arrear flags, and account mapping.
- Component formulas and conditions are evaluated through sanitized formula contexts.
- Component changes can synchronize into Salary Structures.
- Salary Structure defines earnings, deductions, employer contributions, payroll frequency, default/active status, timesheet wage configuration, benefit limits, and leave encashment amount per day.
- Salary Structure validates tax slab components, payment-day-dependent components, formulas, and maximum benefits.
- Bulk Salary Structure Assignment filters active employees by company, branch, grade, department, designation, or employee.
- Salary Structure Assignment validates joining/relieving dates, duplicate from-date, company, currency, tax slab, payroll payable account, and employee cost center splits.
- Salary Structure Assignment computes annual gross/CTC and evaluates components.

### 8.2 Payroll Processing

DocTypes:

- `Payroll Entry`
- `Payroll Employee Detail`
- `Salary Slip`
- `Salary Slip Leave`
- `Salary Slip Loan`
- `Salary Slip Timesheet`

Payroll Entry capabilities:

- Filters employees by company, branch, department, designation, grade, start/end dates, payroll frequency, and other payroll filters.
- Validates existing salary slips.
- Validates payable account type and accounting setup.
- Can block submission when attendance is unmarked, based on payroll settings.
- Creates salary slips; large runs are queued.
- Submits salary slips; large submissions are queued.
- Can email salary slips according to Payroll Settings.
- Posts payroll accrual Journal Entry.
- Can create bank/cash entries for regular salaries and withheld salaries.
- Supports employee-wise payable accounting and cost center splits.
- Links/cancels salary slips, journal entries, and payment ledgers.
- Creates/submits overtime slips when configured.

Salary Slip capabilities:

- Validates active employee, salary dates, joining/relieving range, duplicate slips, and salary withholding.
- Loads Salary Structure and Salary Structure Assignment.
- Computes working days from leave or attendance, according to Payroll Settings.
- Handles leave without pay, partially paid leave, absences, half-day fractions, unmarked attendance, and holidays.
- Handles timesheet-based payroll.
- Applies Additional Salary.
- Applies flexible benefit accruals/payouts.
- Integrates loans when the lending app is installed.
- Applies regional tax/deduction hooks.
- Computes taxable earnings, projected tax, annual values, month-to-date values, year-to-date values, gross pay, net pay, rounded totals, and amount in words.
- Stores leave balances on the slip.
- Can send encrypted salary slip email.
- Creates benefit ledger entries.
- Supports `Withheld` status.

### 8.3 Additional Salary And Adjustments

DocTypes:

- `Additional Salary`
- `Employee Incentive`
- `Retention Bonus`
- `Employee Other Income`
- `Arrear`
- `Payroll Correction`
- `Payroll Correction Child`

Capabilities:

- Additional Salary creates one-time or recurring earning/deduction adjustments.
- Can override Salary Structure amount for a component.
- Can force full tax deduction on selected payroll date.
- Supports referral bonus and employee advance return deductions.
- Validates salary assignment, dates, duplicates, tax behavior, and benefit accrual warnings.
- Employee Incentive and Retention Bonus are compensation adjustment records.
- Employee Other Income feeds taxable income logic.
- Payroll Correction reverses LWP days from prior submitted salary slips in a payroll period.
- Payroll Correction creates Additional Salary arrears and benefit ledger entries for accrual arrears.
- Payroll Correction prevents reversing more LWP than available.

### 8.4 Benefits

DocTypes:

- `Employee Benefit Application`
- `Employee Benefit Application Detail`
- `Employee Benefit Claim`
- `Employee Benefit Detail`
- `Employee Benefit Ledger`

Capabilities:

- Employee Benefit Application lets employees allocate flexible benefits for a payroll period.
- Validates maximum benefit amount from Salary Structure.
- One application per employee/payroll period.
- Employee Benefit Ledger records `Accrual` and `Payout`.
- Employee Benefit Claim validates current/future payroll-date claims.
- Claim limit is derived from benefit ledger balance and payout method.
- Benefit Claim creates Additional Salary.
- Prevents duplicate claim for the same component/month.

### 8.5 Tax

DocTypes:

- `Income Tax Slab`
- `Taxable Salary Slab`
- `Income Tax Slab Other Charges`
- `Employee Tax Exemption Category`
- `Employee Tax Exemption Sub Category`
- `Employee Tax Exemption Declaration`
- `Employee Tax Exemption Declaration Category`
- `Employee Tax Exemption Proof Submission`
- `Employee Tax Exemption Proof Submission Detail`

Capabilities:

- Income Tax Slab defines slab rates, conditions, standard exemptions, other charges, and relief limits.
- Supports marginal relief and regional surcharge hooks.
- Employees submit tax exemption declarations.
- Employees submit proof against declarations.
- Salary Slip uses declarations/proofs to compute taxable salary and deductions.
- Tax reports expose computation and deducted amounts.

### 8.6 Gratuity And Salary Withholding

DocTypes:

- `Gratuity`
- `Gratuity Rule`
- `Gratuity Rule Slab`
- `Gratuity Applicable Component`
- `Salary Withholding`
- `Salary Withholding Cycle`

Gratuity capabilities:

- Calculates work experience from joining to relieving.
- Can subtract leave without pay or absence based on payroll settings.
- Rule defines minimum years, working days per year, applicable components, slabs, and calculation method.
- Can pay through Additional Salary or accounting/payment flow.
- Tracks draft/unpaid/paid/submitted/cancelled state.

Salary Withholding capabilities:

- Creates withholding cycles by payroll frequency.
- Salary Slip can be marked `Withheld`.
- Bank entry for withheld salary releases cycles and updates salary slip/payroll employee status.
- Journal Entry cancellation reverses withholding payment status.

### 8.7 Payroll Accounting

Accounting behavior:

- Payroll Entry accrual posts to Journal Entry.
- Salary payments can be generated as bank/cash entries.
- Salary components map to accounts by company.
- Payable account can be employee-wise.
- Cost center allocation can be employee-specific through Employee Cost Center.
- Accounting dimensions apply to Payroll Entry.
- Payroll Entry participates in period closing.
- Bank remittance and payment-mode reports use Salary Slip/Payroll Entry data.

## 9. Expenses, Advances, Travel, And Fleet

### 9.1 Employee Advances

DocType:

- `Employee Advance`

Capabilities:

- Validates active employee.
- Requires receivable advance account and currency compatibility.
- Uses company default advance account where configured.
- Tracks paid, claimed, returned, pending, and cancelled states.
- Reads paid/returned amounts from Advance Payment Ledger.
- Can unlink/cancel payment references based on HR Settings.
- Supports return through Additional Salary or Journal Entry.
- Can schedule return deductions.

### 9.2 Expense Claims

DocTypes:

- `Expense Claim`
- `Expense Claim Detail`
- `Expense Claim Account`
- `Expense Claim Advance`
- `Expense Claim Type`
- `Expense Taxes and Charges`

Approval states:

- `Draft`
- `Approved`
- `Rejected`
- `Cancelled`

Payment/status states:

- `Draft`
- `Submitted`
- `Paid`
- `Unpaid`
- `Rejected`
- `Cancelled`

Capabilities:

- Validates active employee, company, department, approver, sanctioned amount, claimed amount, advances, expense accounts, taxes, accounting dimensions, and self approval.
- Submit requires approved or rejected approval status.
- Approved/submitted claims create accounting impact.
- Updates Task and Project expense/cost totals.
- Updates Employee Advance claimed amount.
- Supports immediate payment or later reimbursement.
- Payment Entry and Journal Entry hooks update reimbursed amount and paid/unpaid state.
- Can create exchange gain/loss journal entries.
- Expense Claim Type stores company-specific default expense accounts.
- PWA notification support is included.

### 9.3 Travel

DocTypes:

- `Travel Request`
- `Travel Itinerary`
- `Travel Request Costing`
- `Purpose of Travel`

Capabilities:

- Tracks employee travel requests.
- Supports itinerary rows.
- Supports costing rows.
- Captures domestic/international travel, funding/sponsor data, and travel documentation fields.
- Validates active employee and request data.

### 9.4 Fleet Expense Logs

DocTypes:

- `Vehicle Log`
- `Vehicle Service`
- `Vehicle Service Item`

ERPNext dependencies:

- `Vehicle`
- `Driver`

Capabilities:

- Validates odometer values.
- Updates ERPNext Vehicle last odometer on submit/cancel.
- Records fuel and service expenses.
- Can create Expense Claim for vehicle/fuel/service expenses.
- Cancelling Vehicle Log cancels/unlinks draft generated Expense Claims.
- Vehicle Expenses report summarizes fleet costs.

## 10. Performance Management

### 10.1 Goals

DocTypes:

- `Goal`
- `KRA`

Capabilities:

- Goal is a nested-set hierarchy.
- Validates active employee and appraisal cycle.
- Parent/child goals must align by employee, KRA, and cycle.
- Progress cannot exceed 100.
- Goal status is derived from progress and lifecycle state.
- Parent goal progress is averaged from child goals.
- Linked Appraisal KRA progress is updated from goals.

### 10.2 Appraisal Cycles

DocTypes:

- `Appraisal Cycle`
- `Appraisee`

Capabilities:

- Pulls employees by company, department, branch, designation, and employee filters.
- Maps appraisal templates from Designation.
- Creates Appraisals for appraisees; large batches are queued.
- Supports KRA evaluation method: automated or manual.
- Prevents changing KRA evaluation method when appraisals already exist.
- Completion requires all appraisals to be submitted.
- Summary surfaces appraisees, pending self appraisal, missing goals, and missing feedback.

### 10.3 Appraisals And Feedback

DocTypes:

- `Appraisal`
- `Appraisal KRA`
- `Appraisal Goal`
- `Appraisal Template`
- `Appraisal Template Goal`
- `Employee Feedback Criteria`
- `Employee Feedback Rating`
- `Employee Performance Feedback`

Capabilities:

- Prevents duplicate/overlapping appraisal for same employee/cycle.
- Pulls template KRAs/goals and self-rating criteria.
- Supports manual goal ratings or automated KRA scoring from goal progress.
- Validates weights.
- Supports self score, reviewer feedback average, and final score.
- Final score can be formula-based or average-based.
- Reviewer cannot be the employee.
- Feedback validates active cycle/appraisal, weightage, and total score.
- Feedback submit/cancel updates Appraisal average and final score.

## 11. Learning, Skills, And Daily Work

### 11.1 Skills

DocTypes:

- `Skill`
- `Skill Assessment`
- `Employee Skill`
- `Employee Skill Map`
- `Designation Skill`
- `Expected Skill Set`
- `Employee Training`

Capabilities:

- Maintains skill master data.
- Maps employee skills and proficiency/assessment data.
- Maps expected skills to designations.
- Connects employee training history to skill profile.

### 11.2 Training

DocTypes:

- `Training Program`
- `Training Event`
- `Training Event Employee`
- `Training Feedback`
- `Training Result`
- `Training Result Employee`

Capabilities:

- Training Program is the reusable training master.
- Training Event schedules training sessions and employee participants.
- Validates event end after start.
- Stores participant email/status.
- Event statuses include scheduled/completed/cancelled behavior.
- Completing event updates attendee statuses.
- Training Feedback requires a submitted event, participant employee, and non-absent attendee status.
- Feedback submission marks participant feedback submitted.
- Training Result records results and can mark event/attendees completed.

### 11.3 Daily Work Summary

DocTypes:

- `Daily Work Summary`
- `Daily Work Summary Group`
- `Daily Work Summary Group User`

Capabilities:

- Groups users for daily work summary collection.
- Sends periodic emails through scheduler.
- Tracks summary state such as open/sent.
- Report exposes daily work summary replies.

## 12. Employee Self-Service, PWA, And APIs

### 12.1 PWA Notifications

DocType:

- `PWA Notification`

Capabilities:

- Stores employee-facing push notifications.
- APIs expose unread notifications and read-state updates.
- Leave Application and Expense Claim use notification mixins.

### 12.2 Employee And Approver APIs

Primary API capabilities in `hrms/api`:

- Current user and current employee lookup.
- Employee list and reporting-manager lookup.
- HR Settings and mobile setting flags.
- PWA notification list/read status/push status.
- Attendance calendar events.
- Employee and approver lists for Shift Request, Attendance Request, Leave Application, and Expense Claim.
- Shift approver, leave approver, and expense approver discovery.
- Shift list, leave balance map, holiday list, leave type list.
- Expense claim summary, expense claim types, employee advance balance.
- Company currencies, currency symbols, default cost center, default payable account.
- Form metadata for self-service clients.
- Attachment upload/delete.
- PDF generation for records.
- Workflow actions and permitted fields for mobile/PWA clients.

### 12.3 Roster APIs

Primary roster API capabilities:

- Roster events for holidays, leaves, and shifts grouped by employee.
- Filter allowlists for roster queries.
- Create and delete Shift Schedule Assignment.
- Get shift schedule data.
- Swap shifts.
- Break shifts.
- Insert or merge Shift Assignment records.
- Permission validation for roster operations.

## 13. Reports, Dashboards, And Analytics

### 13.1 Script And Report Builder Reports

| Report | Module | Reference DocType | Purpose |
| --- | --- | --- | --- |
| Accrued Earnings Report | Payroll | Employee Benefit Ledger | Benefit accrual/payout balances |
| Appraisal Overview | HR | Appraisal | Appraisal cycle progress and scores |
| Bank Remittance | Payroll | Payroll Entry | Bank payment/remittance file data |
| Daily Work Summary Replies | HR | Daily Work Summary | Work summary response tracking |
| Employee Advance Summary | HR | Employee Advance | Advance paid/claimed/returned status |
| Employee Analytics | HR | Employee | Workforce analytics |
| Employee Birthday | HR | Employee | Birthday list/reminders |
| Employee CTC Break-up | Payroll | Salary Slip | CTC and salary component breakdown |
| Employee Exits | HR | Exit Interview | Exit pipeline/status |
| Employee Hours Utilization Based On Timesheet | HR | Timesheet | Timesheet utilization |
| Employee Information | HR | Employee | Employee master report |
| Employee Leave Balance | HR | Employee | Employee-level leave balance |
| Employee Leave Balance Summary | HR | Employee | Leave balance summary by filters |
| Employees working on a holiday | HR | Attendance | Holiday attendance |
| Income Tax Computation | Payroll | Salary Slip | Employee tax computation |
| Income Tax Deductions | Payroll | Salary Slip | Tax deductions |
| Leave Ledger | HR | Leave Ledger Entry | Leave balance ledger audit |
| Monthly Attendance Sheet | HR | Attendance | Attendance matrix by month |
| Professional Tax Deductions | Payroll | Salary Slip | Professional tax deductions |
| Project Profitability | HR | Timesheet | Project profitability from timesheets |
| Provident Fund Deductions | Payroll | Salary Slip | Provident fund deductions |
| Recruitment Analytics | HR | Staffing Plan | Recruitment/headcount analytics |
| Salary Payments Based On Payment Mode | Payroll | Salary Slip | Salary payment mode summary |
| Salary Payments via ECS | Payroll | Salary Slip | ECS salary payment output |
| Salary Register | Payroll | Salary Slip | Salary slip register |
| Shift Attendance | HR | Attendance | Attendance by shift |
| Unpaid Expense Claim | HR | Expense Claim | Unpaid claim aging/list |
| Vehicle Expenses | HR | Vehicle | Fleet expense report |

### 13.2 Dashboards

Dashboards:

- `Attendance`
- `Employee Lifecycle`
- `Expense Claims`
- `Human Resource`
- `Recruitment`
- `Payroll`

Number cards:

- `Accepted Job Applicants`
- `Applicant-to-Hire Percentage`
- `Approved Claims (This Month)`
- `Early Exit (This Month)`
- `Employee Exits (This Year)`
- `Employees Joining (This Quarter)`
- `Employees Relieving (This Quarter)`
- `Expense Claims (This Month)`
- `Holidays in this month`
- `Job Offer Acceptance Rate`
- `Job Offers (This Month)`
- `Job Openings`
- `Late Entry (This Month)`
- `New Hires (This Year)`
- `Number of Employees on Leave (This Month)`
- `Number of Employees on Leave (Today)`
- `Onboardings (This Month)`
- `Promotions (This Month)`
- `Rejected Claims (This Month)`
- `Rejected Job Applicants`
- `Separations (This Month)`
- `Time to Fill`
- `Total Absent (This Month)`
- `Total Applicants (This month)`
- `Total Declaration Submitted`
- `Total Employees`
- `Total Incentive Given(Last month)`
- `Total Outgoing Salary(Last month)`
- `Total Present (This Month)`
- `Total Salary Structure`
- `Trainings (This Month)`
- `Transfers (This Month)`

Dashboard charts:

- `Appraisal Overview`
- `Attendance Count`
- `Claims by Type`
- `Department Wise Employee Count`
- `Department wise Expense Claims`
- `Department Wise Openings`
- `Department wise Timesheet Hours`
- `Department Wise Salary(Last Month)`
- `Designation Wise Employee Count`
- `Designation Wise Openings`
- `Designation Wise Salary(Last Month)`
- `Employee Advance Status`
- `Employees by Age`
- `Employees by Branch`
- `Employees by Grade`
- `Employees by Type`
- `Expense Claims`
- `Gender Diversity Ratio`
- `Grievance Type`
- `Hiring vs Attrition Count`
- `Interview Status`
- `Job Applicant Pipeline`
- `Job Applicant Source`
- `Job Applicants by Country`
- `Job Application Frequency`
- `Job Application Status`
- `Job Offer Status`
- `Outgoing Salary`
- `Shift Assignment Breakup`
- `Timesheet Activity Breakup`
- `Training Type`
- `Y-O-Y Promotions`
- `Y-O-Y Transfers`

### 13.3 Notifications And Print Formats

Notification records:

- `Exit Interview Scheduled`
- `Training Feedback`
- `Training Scheduled`
- `Retention Bonus`

Print formats:

- `Job Offer`
- `Standard Appointment Letter`
- `Salary Slip based on Timesheet`
- `Salary Slip Standard`
- `Salary Slip with Year to Date`

## 14. Hooks And Cross-App Behavior

### 14.1 ERPNext Client Customization

HRMS injects JavaScript into these ERPNext DocTypes:

- `Employee`
- `Company`
- `Department`
- `Timesheet`
- `Payment Entry`
- `Journal Entry`
- `Delivery Trip`
- `Bank Transaction`

### 14.2 Class Overrides

HRMS overrides these ERPNext classes:

- `Employee` -> `hrms.overrides.employee_master.EmployeeMaster`
- `Timesheet` -> `hrms.overrides.employee_timesheet.EmployeeTimesheet`
- `Payment Entry` -> `hrms.overrides.employee_payment_entry.EmployeePaymentEntry`
- `Project` -> `hrms.overrides.employee_project.EmployeeProject`

### 14.3 Important Doc Events

Key event integrations:

- `User.validate`: employee role validation and approver role synchronization.
- `Company.validate/on_update/on_trash`: HR/payroll account validation, fixture/default account setup, linked document handling.
- `Holiday List.on_update/on_trash`: holiday cache invalidation.
- `Timesheet.validate`: active employee validation.
- `Payment Entry` submit/cancel/update: Expense Claim payment status updates.
- `Unreconcile Payment.on_submit`: Expense Claim payment recalculation.
- `Journal Entry` validate/submit/cancel/update: Expense Claim amount validation, Expense Claim payment updates, Full and Final status, Salary Withholding status, salary slip reference cleanup.
- `Loan.validate`: loan repayment from salary validation when lending is installed.
- `Employee` validate/update/insert/trash/delete: onboarding validation, approver roles, job applicant/offer updates, telemetry, transfer updates, realtime publish.
- `Project.validate`: employee boarding status update.
- `Task.on_update`: employee boarding task/status update.

### 14.4 Global Search

HRMS adds these records to global search:

- `Salary Slip`
- `Leave Application`
- `Expense Claim`
- `Employee Grade`
- `Job Opening`
- `Job Applicant`
- `Job Offer`
- `Salary Structure Assignment`
- `Appraisal`

### 14.5 Dashboard Overrides

HRMS overrides dashboard content for:

- `Employee`
- `Holiday List`
- `Task`
- `Project`
- `Timesheet`
- `Bank Account`

## 15. Exhaustive HRMS DocType Inventory

This section lists all HRMS DocTypes found in the scanned baseline.

### 15.1 HR Module DocTypes

| Area | DocTypes |
| --- | --- |
| Appointments and offers | Appointment Letter, Appointment Letter content, Appointment Letter Template, Job Offer, Job Offer Term, Job Offer Term Template, Offer Term |
| Appraisal and goals | Appraisal, Appraisal Cycle, Appraisal Goal, Appraisal KRA, Appraisal Template, Appraisal Template Goal, Appraisee, Employee Feedback Criteria, Employee Feedback Rating, Employee Performance Feedback, Goal, KRA |
| Attendance and shifts | Attendance, Attendance Request, Employee Attendance Tool, Employee Checkin, Overtime Details, Overtime Salary Component, Overtime Slip, Overtime Type, Shift Assignment, Shift Assignment Tool, Shift Location, Shift Request, Shift Schedule, Shift Schedule Assignment, Shift Type |
| Core HR setup | Department Approver, Designation Skill, Employee Grade, Employment Type, HR Settings, Holiday List Assignment, Identification Document Type, Interest |
| Daily work | Daily Work Summary, Daily Work Summary Group, Daily Work Summary Group User |
| Employee lifecycle | Employee Boarding Activity, Employee Health Insurance, Employee Onboarding, Employee Onboarding Template, Employee Promotion, Employee Property History, Employee Separation, Employee Separation Template, Employee Transfer, Exit Interview, Full and Final Asset, Full and Final Outstanding Statement, Full and Final Statement |
| Expenses, travel, fleet | Employee Advance, Expense Claim, Expense Claim Account, Expense Claim Advance, Expense Claim Detail, Expense Claim Type, Expense Taxes and Charges, Purpose of Travel, Travel Itinerary, Travel Request, Travel Request Costing, Vehicle Log, Vehicle Service, Vehicle Service Item |
| Grievance | Employee Grievance, Grievance Type |
| Learning and skills | Employee Skill, Employee Skill Map, Employee Training, Expected Skill Set, Skill, Skill Assessment, Training Event, Training Event Employee, Training Feedback, Training Program, Training Result, Training Result Employee |
| Leave | Compensatory Leave Request, Earned Leave Schedule, Leave Adjustment, Leave Allocation, Leave Application, Leave Block List, Leave Block List Allow, Leave Block List Date, Leave Control Panel, Leave Encashment, Leave Ledger Entry, Leave Period, Leave Policy, Leave Policy Assignment, Leave Policy Detail, Leave Type |
| Notifications | PWA Notification |
| Recruitment | Employee Referral, Interview, Interview Detail, Interview Feedback, Interview Type, Interviewer, Job Applicant, Job Applicant Source, Job Opening, Job Opening Template, Job Requisition, Staffing Plan, Staffing Plan Detail |

### 15.2 Payroll Module DocTypes

| Area | DocTypes |
| --- | --- |
| Payroll setup | Bulk Salary Structure Assignment, Employee Cost Center, Payroll Period, Payroll Period Date, Payroll Settings, Salary Component, Salary Component Account, Salary Detail, Salary Structure, Salary Structure Assignment |
| Payroll processing | Payroll Employee Detail, Payroll Entry, Salary Slip, Salary Slip Leave, Salary Slip Loan, Salary Slip Timesheet |
| Adjustments and income | Additional Salary, Arrear, Employee Incentive, Employee Other Income, Payroll Correction, Payroll Correction Child, Retention Bonus |
| Benefits | Employee Benefit Application, Employee Benefit Application Detail, Employee Benefit Claim, Employee Benefit Detail, Employee Benefit Ledger |
| Tax | Employee Tax Exemption Category, Employee Tax Exemption Declaration, Employee Tax Exemption Declaration Category, Employee Tax Exemption Proof Submission, Employee Tax Exemption Proof Submission Detail, Employee Tax Exemption Sub Category, Income Tax Slab, Income Tax Slab Other Charges, Taxable Salary Slab |
| Gratuity | Gratuity, Gratuity Applicable Component, Gratuity Rule, Gratuity Rule Slab |
| Withholding | Salary Withholding, Salary Withholding Cycle |

## 16. Agent Implementation Notes

Use these rules when mapping HRMS/HCM requirements to this codebase:

- Treat `Leave Ledger Entry`, `Salary Slip`, `Payroll Entry`, `Expense Claim`, `Employee Advance`, and `Attendance` as transactional sources of truth. Avoid deriving balances only from parent records.
- Treat ERPNext accounting ledgers as authoritative for paid/reimbursed/returned state once accounting entries exist.
- For employee lifecycle workflows, check both the HRMS record and the generated ERPNext `Project`/`Task` records.
- For payroll working days, always read `Payroll Settings` before assuming leave-based or attendance-based calculation.
- For attendance automation, read `Shift Type` configuration before interpreting Employee Checkin logs.
- For leave balances, use Leave Ledger and allocation logic rather than only current leave application rows.
- For claims and leave approvals, approvers may come from Employee fields or inherited Department Approver rows.
- For recruitment vacancy checks, inspect HR Settings and Staffing Plan together.
- For salary calculations, formulas live on Salary Components and Salary Structure rows and are evaluated in context. Do not hard-code component math from labels.
- For settlement, Full and Final Statement composes multiple subsystems: salary withholding, gratuity, leave encashment, expense claims, employee advances, loans, assets, and journal entries.
- For mobile/PWA behavior, prefer HRMS API methods because they apply permission and workflow filtering.
- There were no static HRMS Workflow JSON records in the scanned baseline; workflow behavior is still supported dynamically through Frappe workflow APIs and permissions.
