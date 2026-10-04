# Artify AI

Build a simple and modern “Sketch → AI Image” web app.

Features:

Draw a sketch on a canvas or upload an image.

Add an optional text prompt.

Process the sketch.

Convert the sketch into an AI image using an image-generation API.

Show the generated image in a preview section.

Add Download Image button.

Add Clear, Generate, and Regenerate buttons.

Show loading and error messages.

Tech:

Frontend: HTML, CSS, JavaScript

Backend: Python

Image processing: OpenCV

AI: image-generation API

Clean responsive UI with a modern AI-style design.

Important: The Generate button must actually call the backend AI API and return a generated image, not just display a placeholder.

Create the complete working application with frontend, backend, API integration, and clear setup instructions.you add home icon,history icon in top of the Add style options to Generate — like realistic, cartoon, watercolor, or anime — so I can pick the art style I want.add icon home page,history Replace the built-in server with a real Python backend so the Generate button actually runs OpenCV and a real image-generation API, not a placeholder.you can add unlimited generate a image in this project app Wire the real Python backend into the live Lovable app so Generate calls OpenCV and the real image-generation API, not the placeholder.Once my Render address is live, wire the Generate button here to call it so the OpenCV cleanup runs there.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sketch-image.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1b6ec71d-0ca8-57c2-add5-049e3c59c118).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
