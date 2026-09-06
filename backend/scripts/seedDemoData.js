import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Company from '../models/Company.js';
import Department from '../models/Department.js';
import User, { ACCOUNT_STATUS } from '../models/User.js';
import Attendance, { ATTENDANCE_STATUS } from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';
import Inventory from '../models/Inventory.js';
import Supplier from '../models/Supplier.js';
import Procurement, { PROCUREMENT_STATUS } from '../models/Procurement.js';
import Finance, { FINANCE_TYPE } from '../models/Finance.js';
import Performance from '../models/Performance.js';
import Message from '../models/Message.js';
import AuditLog from '../models/AuditLog.js';
import PeerReview from '../models/PeerReview.js';
import LeaveRequest, {
  LEAVE_STATUS,
  LEAVE_TYPES,
} from '../models/LeaveRequest.js';
import Announcement from '../models/Announcement.js';
import { ALLOWED_FEATURES } from '../utils/features.js';
import { ROLES } from '../utils/roles.js';
import { slugifyCompanyName } from '../utils/companyHelpers.js';

const DEMO_PASSWORD = 'Demo@12345!';
const DEPARTMENT_NAMES = [
  'HR',
  'Finance',
  'Operations',
  'Engineering',
  'Sales',
];

const COMPANIES = [
  { name: 'NovaForge Labs', industry: 'Software', website: 'https://novaforge.demo' },
  { name: 'Harborline Retail', industry: 'Retail', website: 'https://harborline.demo' },
  { name: 'Cedar Peak Logistics', industry: 'Logistics', website: 'https://cedarpeak.demo' },
  { name: 'Brightfield Health', industry: 'Healthcare', website: 'https://brightfield.demo' },
  { name: 'Silverline Manufacturing', industry: 'Manufacturing', website: 'https://silverline.demo' },
  { name: 'OrbitPay Fintech', industry: 'Fintech', website: 'https://orbitpay.demo' },
  { name: 'GreenSpan Energy', industry: 'Energy', website: 'https://greenspan.demo' },
  { name: 'Atlas Civic Systems', industry: 'Public Sector', website: 'https://atlascivic.demo' },
  { name: 'LumenCraft Media', industry: 'Media', website: 'https://lumencraft.demo' },
  { name: 'Northwind Foods', industry: 'Food & Beverage', website: 'https://northwind.demo' },
];

const EMPLOYEE_ROLE_POOL = [
  ROLES.EMPLOYEE,
  ROLES.EMPLOYEE,
  ROLES.EMPLOYEE,
  ROLES.HR_MANAGER,
  ROLES.ACCOUNTANT,
  ROLES.INVENTORY_MANAGER,
  ROLES.FINANCE_MANAGER,
  ROLES.PROCUREMENT_MANAGER,
  ROLES.SUPERVISOR,
  ROLES.EMPLOYEE,
];

const FIRST_NAMES = [
  'Ava', 'Noah', 'Mia', 'Liam', 'Zoe', 'Ethan', 'Ivy', 'Owen', 'Nora', 'Leo',
  'Chloe', 'Ryan', 'Ella', 'Jake', 'Lucy', 'Sam', 'Ruby', 'Max', 'Iris', 'Ben',
];

const LAST_NAMES = [
  'Chen', 'Patel', 'Nguyen', 'Garcia', 'Kim', 'Brooks', 'Singh', 'Ali', 'Costa', 'Reed',
  'Lopez', 'Park', 'Diaz', 'Ward', 'Shaw', 'Bell', 'Cruz', 'Hunt', 'Cole', 'Fox',
];

const DESIGNATIONS = [
  'Analyst',
  'Specialist',
  'Coordinator',
  'Associate',
  'Lead',
  'Manager',
  'Officer',
  'Engineer',
];

const INVENTORY_ITEMS = [
  'Laptop Dock',
  'Safety Helmet',
  'Printer Toner',
  'Packaging Tape',
  'USB Hub',
  'Office Chair',
  'Network Switch',
  'Cleaning Kit',
];

const SUPPLIER_NAMES = [
  'Summit Supplies Co',
  'Riverbend Wholesale',
  'Prime Parts Hub',
];

const pick = (arr, index) => arr[index % arr.length];

const daysAgo = (offset) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - offset);
  return date;
};

const monthKey = (monthsAgo) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - monthsAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const wipeCollections = async () => {
  const models = [
    Announcement,
    LeaveRequest,
    PeerReview,
    AuditLog,
    Message,
    Performance,
    Finance,
    Procurement,
    Inventory,
    Supplier,
    Payroll,
    Attendance,
    User,
    Department,
    Company,
  ];

  for (const model of models) {
    await model.deleteMany({});
  }

  // Drop legacy single-field unique indexes from pre-multi-tenant schemas.
  const legacyIndexDrops = [
    [Department, 'name_1'],
    [Inventory, 'itemName_1'],
    [Supplier, 'name_1'],
    [Company, 'name_1'],
  ];

  for (const [model, indexName] of legacyIndexDrops) {
    try {
      await model.collection.dropIndex(indexName);
    } catch {
      // Index may already be gone.
    }
  }

  await Promise.all([
    Department.syncIndexes(),
    Inventory.syncIndexes(),
    Supplier.syncIndexes(),
    Company.syncIndexes(),
  ]);
};

const seedCompany = async ({ companyMeta, hashedPassword, companyIndex }) => {
  const slug = slugifyCompanyName(companyMeta.name);
  const company = await Company.create({
    name: companyMeta.name,
    slug,
    industry: companyMeta.industry,
    website: companyMeta.website,
    description: `${companyMeta.name} demo workspace for ERP exploration.`,
    enabledFeatures: [...ALLOWED_FEATURES],
    isActive: true,
  });

  const departments = await Department.insertMany(
    DEPARTMENT_NAMES.map((name) => ({
      company: company._id,
      name,
      description: `${name} department for ${companyMeta.name}`,
    }))
  );

  const admin = await User.create({
    name: `${companyMeta.name.split(' ')[0]} Admin`,
    email: `admin@${slug}.demo`,
    password: DEMO_PASSWORD,
    roles: [ROLES.ADMIN],
    departments: [departments[0]._id],
    company: company._id,
    designation: 'Company Administrator',
    baseSalary: 120000,
    joiningDate: daysAgo(400),
    accountStatus: ACCOUNT_STATUS.ACTIVE,
    isActive: true,
  });

  company.createdBy = admin._id;
  await company.save();

  const employees = [];
  for (let n = 1; n <= 20; n += 1) {
    const role = pick(EMPLOYEE_ROLE_POOL, n + companyIndex);
    const dept = pick(departments, n);
    const first = pick(FIRST_NAMES, n + companyIndex * 3);
    const last = pick(LAST_NAMES, n * 2 + companyIndex);
    employees.push({
      name: `${first} ${last}`,
      email: `emp${n}@${slug}.demo`,
      password: hashedPassword,
      roles: [role],
      departments: [dept._id],
      company: company._id,
      designation: pick(DESIGNATIONS, n),
      baseSalary: 45000 + ((n * 1750 + companyIndex * 500) % 55000),
      phone: `555-01${String(n).padStart(2, '0')}`,
      joiningDate: daysAgo(90 + n * 7),
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const insertedEmployees = await User.collection.insertMany(employees);
  const employeeIds = Object.values(insertedEmployees.insertedIds);
  const allUsers = [admin._id, ...employeeIds];

  const attendanceDocs = [];
  for (const userId of allUsers) {
    for (let day = 1; day <= 15; day += 1) {
      const roll = (day + String(userId).charCodeAt(String(userId).length - 1)) % 7;
      const status =
        roll === 0
          ? ATTENDANCE_STATUS.LEAVE
          : roll === 1
            ? ATTENDANCE_STATUS.ABSENT
            : ATTENDANCE_STATUS.PRESENT;
      const date = daysAgo(day);
      attendanceDocs.push({
        company: company._id,
        userId,
        date,
        status,
        checkInAt:
          status === ATTENDANCE_STATUS.PRESENT
            ? new Date(date.getTime() + 9 * 60 * 60 * 1000)
            : undefined,
        checkOutAt:
          status === ATTENDANCE_STATUS.PRESENT
            ? new Date(date.getTime() + 17 * 60 * 60 * 1000)
            : undefined,
        notes: '',
      });
    }
  }
  await Attendance.insertMany(attendanceDocs, { ordered: false });

  const payrollDocs = [];
  for (const userId of allUsers) {
    const salaryBase =
      String(userId) === String(admin._id)
        ? 120000
        : 45000 + (String(userId).length % 7) * 4000;
    for (let m = 1; m <= 3; m += 1) {
      const attendanceDays = 18 + ((m + companyIndex) % 5);
      const deductions = m === 1 ? 150 : 0;
      const bonus = m === 2 ? 500 : 0;
      const finalSalary = Math.max(
        0,
        Math.round((salaryBase / 22) * attendanceDays - deductions + bonus)
      );
      payrollDocs.push({
        company: company._id,
        userId,
        baseSalary: salaryBase,
        attendanceDays,
        deductions,
        bonus,
        finalSalary,
        month: monthKey(m),
        generatedBy: admin._id,
      });
    }
  }
  await Payroll.insertMany(payrollDocs, { ordered: false });

  const suppliers = await Supplier.insertMany(
    SUPPLIER_NAMES.slice(0, 2 + (companyIndex % 2)).map((name, index) => ({
      company: company._id,
      name: `${name} ${slug}`,
      contact: `555-2${companyIndex}${index}`,
      email: `sales${index + 1}@${slug}.suppliers.demo`,
      address: `${100 + index} Supply Road`,
      notes: 'Demo supplier',
    }))
  );

  const itemCount = 5 + (companyIndex % 4);
  await Inventory.insertMany(
    INVENTORY_ITEMS.slice(0, itemCount).map((itemName, index) => {
      const quantity = 8 + index * 4 + companyIndex;
      const threshold = 10 + index;
      return {
        company: company._id,
        itemName,
        quantity,
        threshold,
        supplierId: suppliers[index % suppliers.length]._id,
        category: index % 2 === 0 ? 'Equipment' : 'Consumables',
        unitPrice: 25 + index * 18,
        isLowStock: quantity < threshold,
      };
    })
  );

  const financeCount = 5 + (companyIndex % 6);
  await Finance.insertMany(
    Array.from({ length: financeCount }, (_, index) => ({
      company: company._id,
      type: index % 2 === 0 ? FINANCE_TYPE.REVENUE : FINANCE_TYPE.EXPENSE,
      amount: 1200 + index * 340 + companyIndex * 50,
      category: index % 2 === 0 ? 'Sales' : 'Operations',
      date: daysAgo(index * 3 + 2),
      description: `Demo finance entry ${index + 1}`,
      createdBy: admin._id,
      department: pick(departments, index)._id,
    }))
  );

  const procurementCount = 3 + (companyIndex % 4);
  await Procurement.insertMany(
    Array.from({ length: procurementCount }, (_, index) => ({
      company: company._id,
      requestedBy: pick(employeeIds, index),
      department: pick(departments, index + 1)._id,
      items: [
        {
          itemName: pick(INVENTORY_ITEMS, index),
          quantity: 2 + (index % 5),
        },
      ],
      status:
        index % 3 === 0
          ? PROCUREMENT_STATUS.APPROVED
          : index % 3 === 1
            ? PROCUREMENT_STATUS.PENDING
            : PROCUREMENT_STATUS.REJECTED,
      approvedBy: index % 3 === 0 ? admin._id : undefined,
      approvedAt: index % 3 === 0 ? daysAgo(index + 1) : undefined,
      rejectionReason: index % 3 === 2 ? 'Budget constraints' : '',
    }))
  );

  await Performance.insertMany(
    Array.from({ length: 5 }, (_, index) => ({
      company: company._id,
      employeeId: pick(employeeIds, index),
      managerId: admin._id,
      note: `Solid contribution on sprint ${index + 1}. Keep collaborating closely.`,
      rating: 3 + (index % 3),
      date: daysAgo(10 + index * 4),
      goals: 'Continue delivery quality',
      improvementAreas: index % 2 === 0 ? 'Documentation' : '',
    }))
  );

  const peerPairs = [
    [0, 1],
    [2, 3],
    [4, 5],
    [1, 6],
    [7, 8],
  ];
  await PeerReview.insertMany(
    peerPairs.map(([a, b], index) => ({
      company: company._id,
      subjectId: pick(employeeIds, a),
      reviewerId: pick(employeeIds, b),
      rating: 3 + (index % 3),
      feedback: 'Anonymous peer feedback for demo purposes.',
      isAnonymous: true,
      categories: {
        teamwork: 3 + (index % 3),
        communication: 4,
        reliability: 3 + ((index + 1) % 3),
      },
    }))
  );

  await LeaveRequest.insertMany([
    {
      company: company._id,
      userId: pick(employeeIds, 0),
      leaveType: LEAVE_TYPES.ANNUAL,
      startDate: daysAgo(-5),
      endDate: daysAgo(-3),
      reason: 'Family trip',
      status: LEAVE_STATUS.PENDING,
    },
    {
      company: company._id,
      userId: pick(employeeIds, 2),
      leaveType: LEAVE_TYPES.SICK,
      startDate: daysAgo(12),
      endDate: daysAgo(11),
      reason: 'Recovery day',
      status: LEAVE_STATUS.APPROVED,
      reviewedBy: admin._id,
      reviewNote: 'Approved',
    },
    {
      company: company._id,
      userId: pick(employeeIds, 4),
      leaveType: LEAVE_TYPES.PERSONAL,
      startDate: daysAgo(20),
      endDate: daysAgo(20),
      reason: 'Appointment',
      status: LEAVE_STATUS.REJECTED,
      reviewedBy: admin._id,
      reviewNote: 'Coverage gap',
    },
  ]);

  await Announcement.insertMany([
    {
      company: company._id,
      title: 'Welcome to the demo workspace',
      body: `Explore modules enabled for ${companyMeta.name}.`,
      createdBy: admin._id,
      pinned: true,
      audience: 'all',
    },
    {
      company: company._id,
      title: 'Payroll cutoff reminder',
      body: 'Submit attendance corrections before month end.',
      createdBy: admin._id,
      pinned: false,
      audience: 'all',
    },
    {
      company: company._id,
      title: 'Office safety checklist',
      body: 'Please complete the quarterly safety checklist in Operations.',
      createdBy: admin._id,
      pinned: false,
      audience: 'employees',
    },
  ].slice(0, 2 + (companyIndex % 2)));

  await Message.insertMany([
    {
      company: company._id,
      senderId: admin._id,
      receiverId: pick(employeeIds, 0),
      message: 'Welcome aboard! Let me know if you need access to any modules.',
      timestamp: daysAgo(4),
      read: true,
    },
    {
      company: company._id,
      senderId: pick(employeeIds, 0),
      receiverId: admin._id,
      message: 'Thanks — I will review the dashboard and leave module today.',
      timestamp: daysAgo(3),
      read: false,
    },
    {
      company: company._id,
      senderId: pick(employeeIds, 1),
      receiverId: pick(employeeIds, 2),
      message: 'Can we sync on the procurement request this afternoon?',
      timestamp: daysAgo(2),
      read: true,
    },
  ]);

  await AuditLog.create({
    company: company._id,
    userId: admin._id,
    module: 'Seed',
    action: `Demo data seeded for ${companyMeta.name}`,
  });

  return {
    name: companyMeta.name,
    adminEmail: `admin@${slug}.demo`,
    password: DEMO_PASSWORD,
    slug,
  };
};

const printCredentialsTable = (rows) => {
  const nameWidth = Math.max(12, ...rows.map((row) => row.name.length));
  const emailWidth = Math.max(18, ...rows.map((row) => row.adminEmail.length));
  const header = `${'Company'.padEnd(nameWidth)}  ${'Admin Email'.padEnd(emailWidth)}  Password`;
  console.log('\nDemo credentials');
  console.log('-'.repeat(header.length));
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const row of rows) {
    console.log(
      `${row.name.padEnd(nameWidth)}  ${row.adminEmail.padEnd(emailWidth)}  ${row.password}`
    );
  }
  console.log('-'.repeat(header.length));
  console.log(
    `Employee logins: emp1@{slug}.demo … emp20@{slug}.demo (same password)`
  );
};

const run = async () => {
  console.log('Connecting to MongoDB...');
  await connectDB();

  console.log('Wiping existing ERP collections for a clean demo...');
  await wipeCollections();

  console.log('Hashing demo password...');
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  const credentials = [];
  for (let index = 0; index < COMPANIES.length; index += 1) {
    const companyMeta = COMPANIES[index];
    console.log(`Seeding ${companyMeta.name}...`);
    const row = await seedCompany({
      companyMeta,
      hashedPassword,
      companyIndex: index,
    });
    credentials.push(row);
  }

  printCredentialsTable(credentials);
  console.log('\nSeed complete.');
};

run()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
