'use client';
import React, { useState } from 'react';
import ArticleCards from './ArticleCards';
import Pagination from '../ui/Pagination';

const articles = [
  {
    id: 1,
    author: 'Ellie M.',
    date: 'December 29, 2025',
    readTime: '3m',
    title: 'Vana: A Decentralized Network for User-Owned Data',
    image: '/assets/placeHolder.svg', // replace with your image path
  },
  {
    id: 2,
    author: 'Ellie M.',
    date: 'December 29, 2025',
    readTime: '3m',
    title: 'Vana: A Decentralized Network for User-Owned Data',
    image: '/assets/placeHolder.svg',
  },
  {
    id: 3,
    author: 'Ellie M.',
    date: 'December 29, 2025',
    readTime: '3m',
    title: 'Vana: A Decentralized Network for User-Owned Data',
    image: '/assets/placeHolder.svg',
  },
  {
    id: 4,
    author: 'Ellie M.',
    date: 'December 29, 2025',
    readTime: '3m',
    title: 'Vana: A Decentralized Network for User-Owned Data',
    image: '/assets/placeHolder.svg',
  },
];
export const Blogs = ({ title, data }: any) => {
  const [page, setPage] = useState(1);
  return (
    <div className="flex flex-col md:gap-7.25 max-w-348 w-full mx-auto">
      <h2 className="max-xxs:text-[46px] max-md:pb-9.25 text-[48px] max-sm:pl-4 font-semibold text-black font-ui leading-[100%]">
        {title}
      </h2>
      <div
        className="
    flex gap-1.75 overflow-x-auto pb-2
    md:grid md:grid-cols-2 max-md:pb-3.25 no-scrollbar md:overflow-visible
    lg:grid-cols-4
  "
      >
        <ArticleCards articles={articles} />
      </div>

      <Pagination currentPage={page} totalPages={184} onPageChange={setPage} />
    </div>
  );
};
