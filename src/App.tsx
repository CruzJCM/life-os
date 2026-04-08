import { ThemeProvider, AuthProvider } from './contexts';
import { Router } from './router';
import { useDailyReset, useAutoArchive, usePeriodReset } from './hooks';

// Componente para ejecutar hooks que necesitan AuthProvider
function AppContent() {
  useDailyReset();
  useAutoArchive();
  usePeriodReset();
  return <Router />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;