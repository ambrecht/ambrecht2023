'use client';

import React from 'react';
import PlzForm from './PLZForm';

export default function HeizlastPage() {
  return (
    <div className="container mx-auto p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">Heizlast-Berechnung</h1>
      <PlzForm />
    </div>
  );
}
