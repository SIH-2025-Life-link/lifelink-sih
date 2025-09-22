import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>LifeLink</h1>
      </header>
      <main className="app-main">
        {children}
      </main>
      <footer className="app-footer">
        <p>&copy; 2024 LifeLink. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
