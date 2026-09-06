export const slugifyCompanyName = (name = '') =>
  String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const ensureUniqueCompanySlug = async (Company, baseSlug) => {
  let slug = baseSlug || 'company';
  let suffix = 1;

  while (await Company.exists({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};
