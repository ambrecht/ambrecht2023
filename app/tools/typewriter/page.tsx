// Datei: app/page.tsx (oder eine andere Seite im App-Router)
import InputComponent from '@/components/InputComponent';
import DisplayComponent from '@/components/DisplayComponent';

export default function HomePage() {
  return (
    <div>
      <h1>Echtzeit-Textanzeige</h1>
      <InputComponent />
      <DisplayComponent />
    </div>
  );
}
