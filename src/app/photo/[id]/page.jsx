'use client';

import PhotoDetail from '@/components/PhotoDetail';
import { useParams } from 'next/navigation';

export default function PhotoPage() {
  const params = useParams();
  return <PhotoDetail params={params} />;
}