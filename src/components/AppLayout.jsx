import Sidebar from "./SideBar";

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main" role="main">
        {children}
      </main>
    </div>
  );
}
