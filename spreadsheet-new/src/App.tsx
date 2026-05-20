import { Spreadsheet } from '@/components/spreadsheet/Spreadsheet';
import '@/styles/spreadsheet.css';

function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Spreadsheet />
    </div>
  );
}

export default App;