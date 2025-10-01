# Project Architecture

This is a electron and react application with:

- Electron for desktop app
- React for frontend
- Axios for HTTP requests
- React router for routing
- Antd for react component
- No usage for tailwind.css
 
The project is structured as follows:
- The main process is in `/src/main/index.js`
- The renderer process is in `/src/renderer`
- Resusable Components in `/src/renderer/src/components`
- Pages in `/src/renderer/src/pages`
- For routing in `src/renderer/src/routing.jsx`

## Coding Standards

- Use javascript for all new files
- when ever even page gets create it should get created at `/src/renderer/src/pages`. as well as there should be entry in `src/renderer/src/routing.jsx`

