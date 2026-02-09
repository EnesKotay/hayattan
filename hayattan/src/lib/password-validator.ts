/**
 * Password Validation Utility
 * Enforces strong password requirements
 */

/**
 * Common/weak passwords to reject
 */
const WEAK_PASSWORDS = [
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "monkey",
    "letmein",
    "trustno1",
    "dragon",
    "baseball",
    "iloveyou",
    "master",
    "sunshine",
    "ashley",
    "bailey",
    "passw0rd",
    "shadow",
    "123123",
    "654321",
    "superman",
    "admin",
    "admin123",
];

export type PasswordValidationResult = {
    valid: boolean;
    errors: string[];
};

/**
 * Password strength requirements
 */
export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false, // Optional for now
    checkCommonPasswords: true,
};

/**
 * Validate password strength
 */
export function validatePassword(
    password: string,
    username?: string
): PasswordValidationResult {
    const errors: string[] = [];

    // Check minimum length
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push(
            `Şifre en az ${PASSWORD_REQUIREMENTS.minLength} karakter olmalıdır`
        );
    }

    // Check uppercase
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push("Şifre en az bir büyük harf içermelidir");
    }

    // Check lowercase
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
        errors.push("Şifre en az bir küçük harf içermelidir");
    }

    // Check numbers
    if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
        errors.push("Şifre en az bir rakam içermelidir");
    }

    // Check special characters (optional)
    if (
        PASSWORD_REQUIREMENTS.requireSpecialChars &&
        !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ) {
        errors.push("Şifre en az bir özel karakter içermelidir");
    }

    // Check against common passwords
    if (PASSWORD_REQUIREMENTS.checkCommonPasswords) {
        const lowerPassword = password.toLowerCase();
        if (WEAK_PASSWORDS.includes(lowerPassword)) {
            errors.push("Bu şifre çok yaygın kullanılıyor, daha güçlü bir şifre seçin");
        }
    }

    // Check if password contains username
    if (username && password.toLowerCase().includes(username.toLowerCase())) {
        errors.push("Şifre kullanıcı adınızı içeremez");
    }

    // Check for sequential characters
    if (/012|123|234|345|456|567|678|789|890/.test(password)) {
        errors.push("Şifre ardışık sayılar içermemelidir");
    }

    if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
        errors.push("Şifre ardışık harfler içermemelidir");
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
        errors.push("Şifre 3'ten fazla tekrar eden karakter içermemelidir");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Get password strength score (0-4)
 */
export function getPasswordStrength(password: string): {
    score: number;
    label: string;
} {
    let score = 0;

    // Length bonus
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    // Cap at 4
    score = Math.min(score, 4);

    const labels = ["Çok Zayıf", "Zayıf", "Orta", "Güçlü", "Çok Güçlü"];
    return {
        score,
        label: labels[score] || "Çok Zayıf",
    };
}

/**
 * Generate a strong random password
 */
export function generateStrongPassword(length: number = 16): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}";
    const all = uppercase + lowercase + numbers + special;

    let password = "";

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
}
