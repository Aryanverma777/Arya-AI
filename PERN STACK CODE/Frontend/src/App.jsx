import './App.css'

import Dashboard from './pages/Dashboard'
import { ChatSessionProvider } from './hooks/useChatSession'

function App() {
  return (
    <ChatSessionProvider>
      <Dashboard/>
    </ChatSessionProvider>
  )
}

export default App
