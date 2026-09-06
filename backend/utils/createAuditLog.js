import AuditLog from '../models/AuditLog.js';

const createAuditLog = async ({ userId, action, module, company }) => {
  if (!action || !module) {
    return null;
  }

  return AuditLog.create({
    userId: userId || undefined,
    action: String(action).trim(),
    module: String(module).trim(),
    ...(company ? { company } : {}),
  });
};

export default createAuditLog;
