import Department from '../models/Department.js';
import User from '../models/User.js';
import { ROLES } from './roles.js';

const ADMIN_DEPARTMENT = {
  name: 'Admin',
  description: 'Administrative Department',
};

const DEFAULT_ADMIN = {
  name: 'Rezwanur Rahman',
  email: 'rezwanhritom1537@gmail.com',
  password: 'RAHman@835346',
  roles: [ROLES.ADMIN],
  isActive: true,
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

    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (existingAdmin) {
      console.log('Super admin already exists');
      return;
    }

    await User.create({
      ...DEFAULT_ADMIN,
      departments: [adminDepartment._id],
    });

    console.log('Super admin created');
  } catch (error) {
    console.error('Error while seeding admin data:', error.message);
  }
};

export default seedAdmin;
