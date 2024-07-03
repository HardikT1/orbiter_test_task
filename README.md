# orbit-d3

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Description
This project implements a dynamic user interface with the following features and tools:

Tailwind CSS: Utilized Tailwind CSS for efficient and responsive styling.

**Interactive Orbits**: Implemented a user interface allowing scrolling between different orbits (representing time changes) via a touchpad or mouse using D3.js. This approach creates an engaging and intuitive way to navigate through time-based data.

**Tooltips**: Added tooltips that appear when hovering over avatars, showing detailed information about the corresponding data points. This feature enhances user interaction and provides more context at a glance.

**API Integration with Axios**: Incorporated Axios to make API calls for fetching data. This ensures that the application dynamically retrieves and displays the latest information.

**Infinite Scrolling**: Implemented infinite scrolling to show the next week's data as the user scrolls down. This is achieved by fetching additional data from the API, providing a seamless browsing experience.

**Data Clustering**: Added a bonus feature to cluster data when there is insufficient space on smaller orbits. This clustering ensures that the visualization remains clear and readable even with dense data points.
