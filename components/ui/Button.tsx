'use client';

import { ButtonHTMLAttributes } from 'react';

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition ${
        props.className ?? ''
      }`}
    >
      {props.children}
    </button>
  );
}
