

export const ALLOWED_TYPES = ['js', 'ts'];

export const SNAKECASEFY = name => name.split('')
    .map((w, i) => /[A-Z]/.test(w) && i > 0 ? `_${w}` : w)
    .join('')
    .toLowerCase();