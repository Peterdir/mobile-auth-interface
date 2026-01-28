/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                discord: {
                    background: '#313338',
                    sidebar: '#2B2D31',
                    element: '#1E1F22',
                    hover: '#404249',
                    divider: '#3F4147',
                    text: {
                        normal: '#DBDEE1',
                        muted: '#949BA4',
                        header: '#F2F3F5',
                    },
                    brand: '#5865F2',
                    online: '#23A559',
                    idle: '#F0B232',
                    dnd: '#F23F43',
                    offline: '#80848E',
                }
            }
        },
    },
    plugins: [],
}
