export const generateAccessCode = (name, roomNumber) => {
  if (!name) return '';
  const cleanName = name.replace(/[^a-zA-Z]/g, '');
  const prefix = cleanName.substring(0, 4).toUpperCase();
  return `${prefix}${roomNumber || ''}`;
};
