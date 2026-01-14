
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import GameListPage from './components/GameListPage';
import MazeGame from './components/MazeGame';
import MagicShopGame from './components/MagicCanvasGame'; // Importing the repurpose file
import RhythmGame from './components/RhythmGame';

type ViewState = 'LANDING' | 'GAME_LIST' | 'MAZE_GAME' | 'MAGIC_SHOP' | 'RHYTHM_GAME';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');

  const navigateToGameList = () => {
    setCurrentView('GAME_LIST');
  };

  const navigateToGame = (gameId: string) => {
    if (gameId === 'maze-adventure') {
      setCurrentView('MAZE_GAME');
    } else if (gameId === 'magic-shop') {
      setCurrentView('MAGIC_SHOP');
    } else if (gameId === 'music-maker') {
      setCurrentView('RHYTHM_GAME');
    }
  };

  const navigateToHome = () => {
    setCurrentView('LANDING');
  };

  const navigateBackToList = () => {
    setCurrentView('GAME_LIST');
  };

  return (
    <>
      {currentView === 'LANDING' && <LandingPage onStart={navigateToGameList} />}
      {currentView === 'GAME_LIST' && <GameListPage onSelectGame={navigateToGame} onBack={navigateToHome} />}
      {currentView === 'MAZE_GAME' && <MazeGame onBack={navigateBackToList} />}
      {currentView === 'MAGIC_SHOP' && <MagicShopGame onBack={navigateBackToList} />}
      {currentView === 'RHYTHM_GAME' && <RhythmGame onBack={navigateBackToList} />}
    </>
  );
};

export default App;
