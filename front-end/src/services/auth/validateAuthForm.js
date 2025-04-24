const emailRegex = /^[a-zA-Z0-9._%+-]+@epn\.edu\.ec$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*\-_])[A-Za-z\d!@#$%^&*\-_]{8,}$/;


export const validateSignIn = (email, password) => {
    const errors = [];

    if (!emailRegex.test(email)) {
        errors.push("El email debe ser un correo institucional válido (@epn.edu.ec)");
    }

    if (password === '') {
        errors.push("Por favor ingrese su contraseña");
    }

    return {
        errors
    };
};

export const validateUpdatePassword = (currentPassword, newPassword, confirmPassword) => {
    const errors = [];

    if (!passwordRegex.test(newPassword)) {
        errors.push("La nueva contraseña debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales");
    }

    if (newPassword !== confirmPassword) {
        errors.push("Las contraseñas no coinciden");
    }

    if (!currentPassword) {
        errors.push("Por favor ingrese su contraseña actual");
    }

    if (currentPassword === newPassword) {
        errors.push("La nueva contraseña no puede ser igual a la contraseña actual");
    }

    return {
        errors
    };
};

export const validateForgotPassword = (email) => {
    const errors = [];

    if (!emailRegex.test(email)) {
        errors.push("El email debe ser un correo institucional válido (@epn.edu.ec)");
    }

    return {
        errors
    };
};

export const validateResetPassword = (code, newPassword, confirmNewPassword) => {
    const errors = [];

    if (!code) {
        errors.push("Por favor ingrese su codigo de recuperación");
    }

    if (!passwordRegex.test(newPassword)) {
        errors.push("La nueva contraseña debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales");
    }

    if (newPassword !== confirmNewPassword) {
        errors.push("Las contraseñas no coinciden");
    }

    return {
        errors
    };
};
