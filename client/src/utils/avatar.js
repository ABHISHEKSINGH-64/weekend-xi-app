const gradients = [
  'from-green-500 to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-violet-600',
  'from-pink-500 to-rose-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-teal-500 to-emerald-600'
];

export const getAvatarInitials = (name) => {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
};

export const getAvatarGradient = (name) => {
  if (!name) return gradients[0];
  const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = charCodeSum % gradients.length;
  return gradients[index];
};
