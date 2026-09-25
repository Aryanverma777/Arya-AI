# Arya Project Architecture Prompt

Use this document as the current-context prompt when working on the Arya repository. The repository root is `PERN STACK CODE`. The `arya-tts/` directory is intentionally excluded from this description and must not be modified or used as context unless the user explicitly asks for it.

## Project purpose

Arya is a browser-based voice assistant prototype. The user starts microphone capture, the browser listens continuously for a configurable wake word, then waits for a spoken command. The command is sent to a local Ollama model through an Express backend. The returned answer is converted to speech through Puter and played in the browser.

This is a small two-process application, not a complete traditional PERN stack yet: there is no PostgreSQL database, ORM, authentication system, backend route folder, or persistent application data layer in the current code.

## Repository structure

```text
PERN STACK CODE/
├── Makefile                 # Root development/install shortcuts
├── package.json             # Root concurrently-based orchestration
├── ARCHITECTURE_PROMPT.md   # This AI context document
├── Backend/
│   ├── package.json         # CommonJS Express service dependencies/scripts
│   ├── package-lock.json    # Locked backend dependency tree
│   ├── server.js            # Entire backend implementation
│   ├── .env                 # Local environment values; do not expose values
│   └── .gitignore
└── Frontend/
    ├── package.json         # React/Vite dependencies/scripts
    ├── package-lock.json    # Locked frontend dependency tree
    ├── vite.config.js       # Vite, React, and Tailwind Vite plugin
    ├── eslint.config.js     # ESLint flat configuration
    ├── index.html            # Browser HTML shell
    ├── README.md             # Vite starter documentation
    ├── .env                 # Local frontend environment values; do not expose values
    ├── .gitignore
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── main.jsx         # React root and StrictMode bootstrap
        ├── App.jsx          # Root component; currently renders Dashboard only
        ├── App.css           # Present but currently contains no application rules
        ├── index.css         # Tailwind import
        ├── functions/
        │   └── llm.js       # Browser client for backend SSE chat endpoint
        ├── pages/
        │   ├── Dashboard.jsx # Main voice assistant UI and orchestration
        │   └── sample.jsx    # Standalone speech-recognition example, unused
        └── assets/
            ├── hero.png
            ├── react.svg
            ├── vite.svg
            └── .gitkeep
```

Generated `Frontend/dist/` output exists locally but is build output, not source architecture. `node_modules/` and dependency lockfile contents are also implementation metadata rather than application logic.

## Runtime architecture

```text
Browser microphone
    -> react-speech-recognition / Web Speech API
    -> Frontend/src/pages/Dashboard.jsx
    -> Frontend/src/functions/llm.js
    -> POST http://localhost:3000/api/chat/stream
    -> Backend/server.js
    -> POST http://localhost:11434/api/chat (Ollama, streaming JSONL)
    -> Backend converts JSONL chunks to Server-Sent Events
    -> Browser accumulates SSE content into one answer
    -> @heyputer/puter.js text-to-speech
    -> Browser audio playback
```

### Backend

`Backend/server.js` is a single CommonJS Express entry point:

- Enables unrestricted CORS with `cors()`.
- Enables JSON request parsing with `express.json()`.
- Exposes `GET /` as a basic health response: `Arya's Backend is running`.
- Exposes `POST /api/chat/stream` for chat generation.
- Reads `{ messages, model = "arya" }` from the request body.
- Returns HTTP 400 JSON when `messages` is missing.
- Calls `http://localhost:11434/api/chat` with `{ model, messages, stream: true }`.
- Reads Ollama's newline-delimited JSON response with a stream reader.
- Re-emits each model message as an SSE event shaped like:

```json
{"content":"text chunk","done":false}
```

- Emits an SSE error event shaped like `{ "error": "..." }` when the Ollama request or JSON parsing fails.
- Listens on port `3000` in code. The existing `Backend/.env` contains a `PORT` value, but `server.js` currently does not load `dotenv` or read that value.

The backend package declares Express, CORS, dotenv, Helmet, Morgan, Arcjet, Ollama, and Nodemon. At present, only Express and CORS are imported by `server.js`; the other declared packages are not wired into the implementation.

### Frontend bootstrap

`Frontend/src/main.jsx` imports `index.css`, creates a React root from `#root`, and renders `<App />` inside `StrictMode`.

`Frontend/src/App.jsx` imports some Vite starter assets and `useState`, but the current rendered output is only:

```jsx
<Dashboard />
```

The imported starter assets and state are currently unused. React Router is installed but no router is configured.

### Dashboard state machine

`Frontend/src/pages/Dashboard.jsx` is the main feature boundary. It uses `react-speech-recognition`, Puter AI TTS, and `AryaLLMChat`.

Modes are stored in React state and mirrored into `modeRef` for timer callbacks:

- `waiting`: microphone is listening for the wake word.
- `listening`: wake word was detected; the next speech is treated as a command.
- `searching`: command is being sent to the LLM.
- `speaking`: TTS audio is being generated or played.
- `resting`: user pressed Stop.

Flow:

1. Start calls `SpeechRecognition.startListening({ continuous: true })`, clears the transcript, and enters `waiting`.
2. While waiting, a case-insensitive transcript containing `import.meta.env.PUBLIC_WAKEWORD` or the fallback `arya` triggers `listening` and clears the transcript.
3. While listening, every transcript update resets a `2500ms` silence timer.
4. After silence, the transcript is sent to `AryaSpeak` if non-empty; otherwise the mode returns to `waiting`.
5. `AryaSpeak` stops the microphone, calls `AryaLLMChat`, requests Puter TTS using OpenAI provider, `gpt-4o-mini-tts`, and voice `nova`, then plays the returned audio.
6. On success or failure, the transcript is reset, the mode returns to `waiting`, and continuous microphone listening resumes.
7. Stop clears the timer, stops recognition, resets the transcript, and enters `resting`.
8. Unmount cleanup clears the timer and stops recognition.

The UI is a dark, monospace console with a status panel, Start/Stop controls, transcript area, mode indicator bar, and system log rail. Styling is primarily Tailwind utility classes. It also adds a fixed grid/noise texture with inline CSS.

If the browser lacks speech-recognition support, `Dashboard` renders a short fallback message instead of the console.

### LLM client and streaming contract

`Frontend/src/functions/llm.js` exports `AryaLLMChat(prompt)`. It posts one user message to `http://localhost:3000/api/chat/stream` with model `arya`, parses SSE blocks separated by blank lines, extracts `data: ` lines, throws on an `error` payload, and concatenates all `content` values into a final string.

The client imports `axios`, but does not use it. The backend URL is hard-coded rather than configured through a Vite environment variable.

## Configuration and commands

Root scripts:

- `npm run dev`: intended to run backend and frontend concurrently.
- `npm run backend`: intended to run only the backend.
- `npm run frontend`: intended to run only the frontend.

Make targets:

- `make run`: invokes root `npm run dev`.
- `make backend`: invokes backend development mode.
- `make frontend`: invokes frontend development mode.
- `make install`: installs root, backend, and frontend dependencies.

Backend scripts:

- `npm start`: `node server.js`
- `npm run dev`: `nodemon server.js`
- `npm test`: placeholder script that exits with an error because tests do not exist.

Frontend scripts:

- `npm run dev`: starts Vite.
- `npm run build`: creates a production build.
- `npm run lint`: runs ESLint.
- `npm run preview`: serves the production build locally.

Environment variables currently observed by the source:

- `Frontend/.env`: `PUBLIC_WAKEWORD` is read by Vite client code. Its value is intentionally not recorded here.
- `Backend/.env`: contains `PORT`, but the current backend does not consume it.

## Known inconsistencies and risks

Treat these as current facts when making changes:

1. The actual directories are `Backend/` and `Frontend/`; root orchestration scripts now use those exact directory names. A previous `make run` attempt exited with code 1 while the repository still used lowercase paths.
2. `server.js` hard-codes port `3000` and Ollama URL `http://localhost:11434`; it does not use the declared dotenv dependency or `Backend/.env`.
3. The backend sends SSE headers before contacting Ollama. Errors are then sent as SSE data rather than as a normal HTTP error response.
4. The backend installs several security/observability/rate-limiting dependencies but does not currently use Helmet, Morgan, or Arcjet.
5. `req.on("close")` is registered after the streaming work begins and calls `res.end()` without cancelling the Ollama reader. Disconnect handling may be improved later.
6. The frontend starts browser speech recognition without explicitly requesting a language. This depends on browser defaults and permissions.
7. `Dashboard` has asynchronous microphone, LLM, and audio transitions in one component. Avoid adding unrelated abstractions unless a change requires them.
8. There are no automated tests, no database, no authentication, and no formal API schema.
9. `Frontend/src/pages/sample.jsx` is an unused speech-recognition demo. Preserve it unless the user explicitly asks for cleanup.
10. `App.jsx` and `llm.js` contain unused imports. Existing lint/build behavior should be checked before changing them because the repository may have unrelated baseline warnings.

## Guidance for future AI changes

- Exclude `arya-tts/` from repository analysis and edits unless explicitly requested.
- Start from the owning file: use `Dashboard.jsx` for voice state/UI behavior, `llm.js` for browser-to-backend chat transport, and `Backend/server.js` for Ollama/SSE behavior.
- Preserve the existing SSE payload contract unless the frontend and backend are changed together.
- Keep secrets and local `.env` values out of generated documentation, logs, commits, and responses.
- Prefer the existing React, Vite, Express, and Tailwind patterns. Avoid introducing a database or router unless the user asks for that capability.
- When changing runtime behavior, validate the narrowest relevant command first: `npm run lint` or `npm run build` in `Frontend`, and a direct backend start/request check for `Backend`.
- Remember that the current root orchestration paths use lowercase directory names even though the checked-out directories are capitalized; verify and correct that explicitly before relying on `npm run dev` or `make run`.