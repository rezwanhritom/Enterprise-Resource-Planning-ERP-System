import Company from '../models/Company.js';
import Department from '../models/Department.js';
import User, { ACCOUNT_STATUS } from '../models/User.js';
import { ALLOWED_FEATURES } from './features.js';
import { ROLES } from './roles.js';
import {
  ensureUniqueCompanySlug,
  slugifyCompanyName,
} from './companyHelpers.js';

const ADMIN_DEPARTMENT = {
  name: 'Admin',
  description: 'Administrative Department',
};

const DEFAULT_ADMIN = {
  name: 'Rezwanur Rahman',
  email: 'rezwanhritom1537@gmail.com',
  password: 'RAHman@835346',
  roles: [ROLES.ADMIN],
  accountStatus: ACCOUNT_STATUS.ACTIVE,
  isActive: true,
};

const DEFAULT_COMPANY = {
  name: 'ERP Suite Demo',
  industry: 'Technology',
  description: 'Default company workspace for the seeded admin account.',
};

const seedAdmin = async () => {
  try {
    let adminDepartment = await Department.findOne({ name: ADMIN_DEPARTMENT.name });

    if (!adminDepartment) {
      adminDepartment = await Department.create(ADMIN_DEPARTMENT);
      console.log('Admin department created');
    } else {
      console.log('Admin department already exists');
    }

    let company = await Company.findOne({ name: DEFAULT_COMPANY.name });
    if (!company) {
      const slug = await ensureUniqueCompanySlug(
        Company,
        slugifyCompanyName(DEFAULT_COMPANY.name)
      );
      company = await Company.create({
        ...DEFAULT_COMPANY,
        slug,
        enabledFeatures: [...ALLOWED_FEATURES],
      });
      console.log('Default company created');
    } else {
      console.log('Default company already exists');
    }

    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (existingAdmin) {
      let updated = false;
      if (!existingAdmin.company) {
        existingAdmin.company = company._id;
        updated = true;
      }
      if (existingAdmin.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
        existingAdmin.accountStatus = ACCOUNT_STATUS.ACTIVE;
        existingAdmin.isActive = true;
        updated = true;
      }
      if (updated) {
        await existingAdmin.save();
        console.log('Super admin linked to default company');
      } else {
        console.log('Super admin already exists');
      }
      return;
    }

    const adminUser = await User.create({
      ...DEFAULT_ADMIN,
      company: company._id,
      departments: [adminDepartment._id],
    });

    if (!company.createdBy) {
      company.createdBy = adminUser._id;
      await company.save();
    }

    console.log('Super admin created');
  } catch (error) {
    console.error('Error while seeding admin data:', error.message);
  }
};

export default seedAdmin;
