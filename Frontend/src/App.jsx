import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div>
      {/*layout like navbar/header here */}
      <Outlet /> {/* This is where nested routes will render */}
    </div>
  );
}
