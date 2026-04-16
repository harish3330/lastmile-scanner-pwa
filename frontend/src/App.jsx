import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import routes from './core/routes';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="app-container">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="app-body">
          {sidebarOpen && <Sidebar />}
          <main className="app-main">{routes}</main>
        </div>
      </div>
    </Router>
  );
}

export default App;
