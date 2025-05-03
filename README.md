
# 🧠 ThoughtWeb

https://discord.gg/6ydDxzMjvD

ThoughtWeb is a visual thinking tool built in React that allows you to create, organize, and navigate complex thoughts through interconnected thought bubbles, nested segments, and flexible metadata filtering.

Designed as a **personal knowledge graph meets mind-mapping engine**, ThoughtWeb supports segment-level filtering, AI-ready JSON export, and deep extensibility — perfect for building your own second brain.

---

## 🔧 Features

- 📌 **Thought Bubbles** with customizable title, description, tags, and color
- 🧩 **Nested Segments** inside each thought, each with their own title, content, and attributes
- 🏷️ **Multi-attribute Classification** per segment (field name, value, and type)
- 🔍 **Advanced Filtering** by attribute field name, field type, and field value
- 🌈 **Canvas Highlighting** of matching bubbles (non-matches fade)
- 🎨 **Light/Dark Mode Toggle**
- 📤 **Export all or filtered thoughts** to JSON (AI-parsable structure)
- 📥 **Import JSON backups**
- 🛠️ **Batch Editing Tools** — apply tags or color to filtered results
- 🧪 **Scalable Architecture** for AI integration and custom visualizations

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/joshhickson/thought-web.git
cd thought-web
````

### 2. Install dependencies

```bash
npm install
```

### 3. Start local server

```bash
npm start
```

Visit `http://localhost:3000` in your browser.

---

## 📦 Build for Static Export

```bash
npm run build
```

This creates a `build/` folder you can upload or open offline.
Perfect for iPad/iPhone use or PWA setup.

---

## 🧠 JSON Schema Overview

Thoughts are saved locally and exported as structured JSON:

```json
{
  "id": "bubble-001",
  "title": "Example Thought",
  "description": "A high-level idea.",
  "tags": [{ "name": "philosophy", "color": "#f97316" }],
  "color": "#f97316",
  "position": { "x": 123, "y": 456 },
  "segments": [
    {
      "id": "segment-001",
      "title": "Key Quote",
      "content": "We hold these truths...",
      "attributes": [
        {
          "fieldName": "Segment Concept",
          "fieldValue": "Quote",
          "fieldType": "text"
        },
        ...
      ]
    }
  ]
}
```


## thought-web/ directory
```text thought-web/ 

├── public/ # Static public assets (e.g. index.html) 

├── src/ # Core React application source 

│ ├── components/ # Visual components and layout parts 

│ │ ├── AddThoughtModal.jsx # Modal for creating new thought bubbles 

│ │ ├── Canvas.jsx # Main canvas for visualizing thought web 

│ │ ├── Sidebar.jsx # Sidebar with controls and filter UI 

│ │ └── ThoughtDetailPanel.jsx # Expanded detail view for selected thoughts 

│ ├── utils/ # Helper functions and data I/O 

│ │ ├── exportHandler.js # Exports thought data to JSON 

│ │ ├── importHandler.js # Parses and imports JSON files 

│ │ └── import.js # Handles drag/drop import logic 

│ ├── App.jsx # App entry point, layout structure 

│ ├── index.js # Main render file 

│ └── index.css # Global CSS and Tailwind setup 

├── docs/ # Project documentation and onboarding 

│ └── README-dev.md # Developer-focused intro, vision, and setup 

├── schema.json # Current data schema for thought bubbles 

├── tailwind.config.js # Tailwind CSS configuration 

├── package.json # Project dependencies and scripts 

├── package-lock.json # Dependency lock file 

├── .gitattributes/.gitignore # Git-specific configuration ```

---

## 🛣️ Roadmap

* [x] Filtered export
* [x] Multi-select filtering
* [x] Canvas visualization
* [x] Batch editing
* [ ] Segment editing
* [ ] AI-assisted input
* [ ] Timeline view
* [ ] Filter presets

---

## 📄 License

MIT — free to fork, remix, and evolve.

---

## ✨ Created by [Josh Hickson](https://github.com/joshhickson)

````

---

### ✅ What to do next:

1. Copy this into a new file: `/thought-web/README.md`
2. Commit & push:
```bash
git add README.md
git commit -m "Add project README"
git push
````


#(Default React Readme below)

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
