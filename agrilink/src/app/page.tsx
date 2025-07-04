import { redirect } from 'next/navigation';

export default function Root() {
  // Server-side redirect - more efficient than client-side
  redirect('/home');
}
