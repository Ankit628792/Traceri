import { RouterProvider } from '@tanstack/react-router';
import { ArchiveProvider } from './context/ArchiveContext';
import { router } from './router';

export default function App() {
  return (
    <ArchiveProvider>
      <RouterProvider router={router} />
    </ArchiveProvider>
  );
}
