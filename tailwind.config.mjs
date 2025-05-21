/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './app/**/*.{ts,tsx,js,jsx}',
        './components/**/*.{ts,tsx,js,jsx}',
        './lib/**/*.{ts,tsx,js,jsx}',
    ],
    theme: {
        extend: {
            // Add custom theme extensions here
        },
    },
    plugins: [],
}