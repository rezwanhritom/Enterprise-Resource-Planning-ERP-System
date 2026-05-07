import AuditLog from '../models/AuditLog.js';

const createAuditLog = async ({ userId, action, module }) => {
  if (!action || !module) {
    return null;
  }

  return AuditLog.create({
    userId: userId || undefined,
    action: String(action).trim(),
    module: String(module).trim(),
  });
};

export default createAuditLog;
