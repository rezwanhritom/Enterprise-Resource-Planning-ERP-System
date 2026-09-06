import mongoose from 'mongoose';

const companyRef = {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Company',
  required: [true, 'Company is required'],
  index: true,
};

export default companyRef;
