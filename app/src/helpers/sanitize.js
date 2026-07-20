import DOMPurify from 'dompurify';

export const sanitizeText = (str) => {
  if (typeof str !== 'string') return str;

  return DOMPurify.sanitize(str.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

export const sanitizeFields = (data, fields) => {
  const result = { ...data };

  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = sanitizeText(result[field]);
    }
  }

  return result;
};