# 🔐 CivicOP Demo Login Credentials

## For Demo & Testing Purposes Only
**Last Updated:** January 6, 2026

---

## 👑 **Super Admin Account**

```
Email:    admin@civicop.gov.in
Password: CivicOP@Admin2026
Role:     Super Administrator
Access:   Full system access - All 198 wards
```

**Capabilities:**
- ✅ View ALL issues across all wards
- ✅ Assign/reassign to any user
- ✅ Change any issue status
- ✅ Access all dashboard views
- ✅ Generate reports
- ✅ Manage all ward admins and engineers

---

## 🏛️ **Ward Admin Accounts**

### 1. Koramangala Ward Admin
```
Email:    ward.admin.koramangala@civicop.gov.in
Password: WardAdmin@123
Name:     Rajesh Kumar
Role:     Ward Administrator
Wards:    85, 86, 87 (Koramangala area)
```

### 2. Whitefield Ward Admin
```
Email:    ward.admin.whitefield@civicop.gov.in
Password: WardAdmin@123
Name:     Priya Sharma
Role:     Ward Administrator
Wards:    184, 185, 186 (Whitefield area)
```

### 3. HSR Layout Ward Admin
```
Email:    ward.admin.hsr@civicop.gov.in
Password: WardAdmin@123
Name:     Kavita Desai
Role:     Ward Administrator
Wards:    130 (HSR Layout)
```

### 4. Jayanagar Ward Admin
```
Email:    ward.admin.jayanagar@civicop.gov.in
Password: WardAdmin@123
Name:     Suresh Reddy
Role:     Ward Administrator
Wards:    87 (Jayanagar)
```

### 5. Indiranagar Ward Admin
```
Email:    ward.admin.indiranagar@civicop.gov.in
Password: WardAdmin@123
Name:     Arun Menon
Role:     Ward Administrator
Wards:    25 (Indiranagar)
```

**Capabilities:**
- ✅ View issues in assigned wards only
- ✅ Assign to Executive Engineers
- ✅ Change status of ward issues
- ✅ View assignment history
- ❌ Cannot see other wards
- ❌ Cannot access super admin features

---

## 🔧 **Executive Engineer Accounts**

### 1. Koramangala Engineer
```
Email:    ee.koramangala@civicop.gov.in
Password: Engineer@123
Name:     Venkatesh Rao
Role:     Executive Engineer
Area:     Koramangala (Wards 85-87)
```

### 2. Whitefield Engineer
```
Email:    ee.whitefield@civicop.gov.in
Password: Engineer@123
Name:     Lakshmi Narayanan
Role:     Executive Engineer
Area:     Whitefield (Wards 184-186)
```

### 3. HSR Layout Engineer
```
Email:    ee.hsr@civicop.gov.in
Password: Engineer@123
Name:     Anand Kumar
Role:     Executive Engineer
Area:     HSR Layout (Ward 130)
```

**Capabilities:**
- ✅ View issues assigned to them only
- ✅ Update status of assigned issues
- ✅ View full issue details
- ❌ Cannot reassign issues
- ❌ Cannot see unassigned issues
- ❌ Ward-restricted view

---

## 👥 **Citizen Account (Public)**

```
Email:    citizen.demo@gmail.com
Password: Citizen@123
Name:     Demo Citizen
Role:     Citizen
```

**Capabilities:**
- ✅ Report new issues
- ✅ Select ward from 198 wards
- ✅ Upload photos
- ✅ View public map
- ❌ No governance access

---

## 🎯 **Demo Workflow**

### **Scenario 1: Admin Assigns Issue**
1. Login as **admin@civicop.gov.in**
2. Go to `/governance` → "All Issues" tab
3. Click any issue → Opens detail modal
4. Assign to "Rajesh Kumar (Ward Admin)"
5. See full audit trail

### **Scenario 2: Ward Admin Delegates**
1. Login as **ward.admin.koramangala@civicop.gov.in**
2. Go to `/governance` → See only Ward 85-87 issues
3. Click issue → Assign to "Venkatesh Rao (Engineer)"
4. Add notes: "Urgent - school area"
5. Engineer receives the task

### **Scenario 3: Engineer Updates**
1. Login as **ee.koramangala@civicop.gov.in**
2. Go to `/governance` → See only assigned issues
3. Click issue → Update status to "IN_PROGRESS"
4. Work on ground → Update to "RESOLVED"
5. Full history tracked

### **Scenario 4: Citizen Reports**
1. Login as **citizen.demo@gmail.com** OR use without login
2. Click "Report Issue" button on homepage
3. Select Ward, upload photo, add description
4. Submit → Auto-assigned to ward admin
5. Citizen gets confirmation

---

## 🔒 **Security Notes**

⚠️ **IMPORTANT FOR PRODUCTION:**

1. **Change all passwords immediately** after demo
2. Use strong passwords (min 12 characters)
3. Enable 2FA for admin accounts
4. Rotate credentials every 90 days
5. Never commit credentials to Git
6. Use environment variables for sensitive data
7. Implement password reset via email
8. Log all admin actions for audit

---

## 📊 **Setup Instructions**

### **Step 1: Create Users in Supabase Auth**
Go to Supabase Dashboard → Authentication → Users → Add User

For each email above:
1. Click "Add User"
2. Enter email and password
3. Verify email (optional for demo)
4. Copy the generated UUID

### **Step 2: Run SQL Scripts**
```sql
-- 1. Run main migration
-- Copy content from: supabase/migrations/add_advanced_governance.sql
-- Paste in Supabase SQL Editor → Execute

-- 2. Update user profiles with actual UUIDs from Step 1
-- Modify create_sample_users.sql with actual UUIDs
-- Then execute in Supabase SQL Editor
```

### **Step 3: Verify Setup**
```sql
-- Check all users
SELECT email, role, assigned_wards, designation, is_active
FROM users
WHERE role IN ('admin', 'ward_admin', 'ward_executive_engineer')
ORDER BY role, email;
```

---

## 🧪 **Test Checklist**

- [ ] Super admin can see all 198 wards
- [ ] Ward admin sees only assigned wards (auto-filtered)
- [ ] Executive engineer sees only assigned issues
- [ ] Auto-assignment works (new issue → ward admin)
- [ ] Manual assignment works (admin → ward admin → engineer)
- [ ] Assignment history shows full audit trail
- [ ] Status changes reflect immediately
- [ ] Search and filters work correctly
- [ ] Modal opens with full details
- [ ] Permissions enforced (ward admins can't see other wards)

---

## 📞 **Support Contacts**

**For Demo Support:**
- Technical Lead: [Your Email]
- System Admin: [Your Email]
- Documentation: See ADVANCED_GOVERNANCE_GUIDE.md

---

## 🎉 **Quick Start for Demo**

**For Judges/Stakeholders:**

1. **View as Super Admin:**
   - Login: `admin@civicop.gov.in` / `CivicOP@Admin2026`
   - Go to `/governance` → "All Issues"
   - See all issues, assign to anyone

2. **View as Ward Admin:**
   - Login: `ward.admin.koramangala@civicop.gov.in` / `WardAdmin@123`
   - Go to `/governance` → See only Ward 85-87
   - Assign to engineer

3. **View as Engineer:**
   - Login: `ee.koramangala@civicop.gov.in` / `Engineer@123`
   - Go to `/governance` → See only assigned issues
   - Update status

4. **Report as Citizen:**
   - Go to homepage → "Report Issue"
   - Select Ward 85, upload photo
   - Submit → Auto-assigned to Koramangala admin

---

**Last Updated:** January 6, 2026
**Version:** 2.0 - Advanced Governance System
