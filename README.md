# 🧠 Brain Playground

A SvelteKit-based Progressive Web App (PWA) designed for cognitive training and educational games for children.

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (LTS version recommended).

### 2. Install Dependencies
Open your terminal in the project root and run:
```bash
npm install
```

### 3. Run Locally (Development)
To start the development server with hot-reloading:
```bash
npm run dev
```
By default, the app will be available at [http://localhost:5173](http://localhost:5173).

---

## 🛠 Production & Testing

### 🏗 Build for Production
To create an optimized production build:
```bash
npm run build
```
The output will be in the `build/` directory (configured for static hosting).

### 🔍 Preview Production Build
To see how the app behaves in production mode locally:
```bash
npm run preview
```

### 🧪 Type Checking
To run the Svelte and TypeScript checks:
```bash
npm run check
```

---

## 📱 PWA Features
This app is a **Progressive Web App**. To test PWA features like service workers and "Add to Home Screen":
1. Build the app: `npm run build`
2. Preview it: `npm run preview`
3. Open the URL in Chrome/Edge.
4. Look for the "Install" icon in the address bar.

## 📁 Project Structure
- `src/lib/games/`: Core logic and Svelte components for each game.
- `src/routes/`: App pages and routing.
- `src/lib/services/`: Shared services like `StorageService` for local data persistence.

---

## 🎮 Included Games
- **Math Whiz**: Basic arithmetic practice.
- **Math Detectives**: Finding missing numbers/signs.
- **Chromatic Academy**: Color theory and mixing.
- **Logic Lab**: Learning logic gates.
- **Code Breaker**: Deduction and pattern matching.
- **Math Crossing**: Crossword-style math equations.
- **Number Parrot**: Working memory practice (Forward, Backward, Sort).
- **Emoji Detective**: Processing speed practiced through visual cancellation.
