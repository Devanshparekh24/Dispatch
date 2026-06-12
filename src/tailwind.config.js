/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: [
        './App.{js,jsx,tsx}',
        './src/**/*.{js,jsx,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366F1',
                    50: '#EDEFFD',
                    100: '#E0E1FC',
                    200: '#C6C7FA',
                    300: '#A6A8F7',
                    400: '#8688F4',
                    500: '#6366F1',
                    600: '#3336EC',
                    700: '#1518D5',
                    800: '#1013A3',
                    900: '#0C0E71',
                },
                secondary: {
                    DEFAULT: '#8B5CF6',
                    50: '#F3EEFE',
                    100: '#E9E0FD',
                    200: '#D4C1FC',
                    300: '#BEA3FA',
                    400: '#A47FF8',
                    500: '#8B5CF6',
                    600: '#6728F2',
                    700: '#5109D9',
                    800: '#3E07A6',
                    900: '#2B0573',
                },
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                background: '#0F172A',
                surface: '#1E293B',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
