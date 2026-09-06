export const getCompanyId = (user) => {
  if (!user?.company) return null;
  return user.company._id ? String(user.company._id) : String(user.company);
};

export const companyFilter = (user) => {
  const companyId = getCompanyId(user);
  return companyId ? { company: companyId } : {};
};

export const assertSameCompany = (actor, targetUser) => {
  const actorCompany = getCompanyId(actor);
  const targetCompany = getCompanyId(targetUser);
  if (!actorCompany || !targetCompany) return false;
  return String(actorCompany) === String(targetCompany);
};
