
import React from 'react';

type Page = 'dashboard' | 'content' | 'monetization' | 'customization' | 'equipment' | 'achievements' | 'community' | 'optimization' | 'live';

interface SidebarProps {
  isOpen: boolean;
  currentPage: Page;
  onSetPage: (page: Page) => void;
  onToggleSidebar: () => void;
}

const NavItem: React.FC<{
  iconClass: string;
  label: string;
  pageName: Page;
  currentPage: Page;
  onSetPage: (page: Page) => void;
  isSidebarOpen: boolean;
}> = ({ iconClass, label, pageName, currentPage, onSetPage, isSidebarOpen }) => {
  const isActive = currentPage === pageName;
  return (
    <button
      onClick={() => onSetPage(pageName)}
      className={`flex items-center w-full py-3 px-4 rounded-lg transition-colors duration-150 ease-in-out
                  ${isActive 
                    ? 'bg-red-500 text-white dark:bg-red-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                  ${!isSidebarOpen ? 'justify-center' : ''}`}
      title={label}
    >
      <i className={`${iconClass} ${isSidebarOpen ? 'mr-3' : 'text-xl'}`}></i>
      {isSidebarOpen && <span className="font-medium">{label}</span>}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPage, onSetPage, onToggleSidebar }) => {
  const navItems: { iconClass: string; label: string; pageName: Page }[] = [
    { iconClass: 'fas fa-tachometer-alt', label: 'Panel', pageName: 'dashboard' },
    { iconClass: 'fas fa-play-circle', label: 'Contenido', pageName: 'content' },
    { iconClass: 'fas fa-comments', label: 'Comunidad', pageName: 'community' },
    { iconClass: 'fas fa-magic', label: 'Optimización', pageName: 'optimization' },
    { iconClass: 'fas fa-broadcast-tower', label: 'En Vivo', pageName: 'live' }, // Added Streamer Sensation
    { iconClass: 'fas fa-hand-holding-usd', label: 'Monetización', pageName: 'monetization' },
    { iconClass: 'fas fa-palette', label: 'Personalización', pageName: 'customization' },
    { iconClass: 'fas fa-tools', label: 'Equipamiento', pageName: 'equipment' },
    { iconClass: 'fas fa-trophy', label: 'Logros', pageName: 'achievements' },
  ];

  return (
    <div
      className={`flex flex-col bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out
                  ${isOpen ? 'w-64' : 'w-20'} `}
    >
      <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center text-red-600 dark:text-red-500">
            <i className="fab fa-youtube text-3xl"></i>
            <span className="ml-2 text-xl font-bold">Studio</span>
          </div>
        )}
        <button
          onClick={onToggleSidebar}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
          title={isOpen ? "Contraer barra lateral" : "Expandir barra lateral"}
        >
          <i className={`fas ${isOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.pageName}
            iconClass={item.iconClass}
            label={item.label}
            pageName={item.pageName}
            currentPage={currentPage}
            onSetPage={onSetPage}
            isSidebarOpen={isOpen}
          />
        ))}
      </nav>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Youtube Simulator &copy; {new Date().getFullYear()}
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
