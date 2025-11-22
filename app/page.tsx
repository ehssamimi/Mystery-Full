'use client';

import { useEffect } from 'react';
import PlayerCountSlider from '@/components/PlayerCountSlider';
import UserNavbar from '@/components/UserNavbar';
import { useAuthStore } from '@/lib/store/auth-store';

export default function Home() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <UserNavbar />
      <PlayerCountSlider />
    </>
  );
}

