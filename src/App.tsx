import { AppErrorBoundary } from './components/AppErrorBoundary';
import { MapNavigator } from './components/MapNavigator';
import './styles/global.css';

export default function App() {
  return (
    <AppErrorBoundary>
      <MapNavigator />
    </AppErrorBoundary>
  );
}
