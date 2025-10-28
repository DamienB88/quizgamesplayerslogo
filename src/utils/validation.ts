/**
 * Validates a phone number format
 * Basic validation - can be enhanced with libphonenumber-js
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid length (10-15 digits)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Formats a phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // For international numbers, just add spaces
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
}

/**
 * Validates caption length
 */
export function validateCaption(caption: string, maxLength: number = 500): {
  isValid: boolean;
  message?: string;
} {
  if (caption.length === 0) {
    return { isValid: true };
  }

  if (caption.length > maxLength) {
    return {
      isValid: false,
      message: `Caption must be ${maxLength} characters or less`,
    };
  }

  return { isValid: true };
}

/**
 * Validates comment content
 */
export function validateComment(comment: string, maxLength: number = 300): {
  isValid: boolean;
  message?: string;
} {
  if (comment.trim().length === 0) {
    return {
      isValid: false,
      message: 'Comment cannot be empty',
    };
  }

  if (comment.length > maxLength) {
    return {
      isValid: false,
      message: `Comment must be ${maxLength} characters or less`,
    };
  }

  return { isValid: true };
}

/**
 * Validates group name
 */
export function validateGroupName(name: string): {
  isValid: boolean;
  message?: string;
} {
  if (name.trim().length === 0) {
    return {
      isValid: false,
      message: 'Group name cannot be empty',
    };
  }

  if (name.length < 3) {
    return {
      isValid: false,
      message: 'Group name must be at least 3 characters',
    };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      message: 'Group name must be 50 characters or less',
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
