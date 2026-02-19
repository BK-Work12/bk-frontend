// components/ArticleCards.tsx
import Image from 'next/image';

interface Article {
  id: string | number;
  title: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
}

interface ArticleCardsProps {
  articles: Article[];
}

export default function ArticleCards({ articles }: ArticleCardsProps) {
  return (
    <>
      {articles.map((article) => (
        <div
          key={article.id}
          className="
    bg-white border border-[#E4E4E4] rounded-[9px] overflow-hidden
    min-w-[362px] max-w-[362px]
    sm:min-w-0 sm:max-w-none
  "
        >
          <div className="w-full h-62.25 rounded-t-xl">
            <Image
              src={article.image}
              alt={article.title}
              width={400}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="pl-5 pt-2.25 pr-8 sm:pr-3.75 pb-9.25">
            <p className="text-[13.9px] text-[#767676] font-normal font-ui">
              {article.author} · {article.date} · {article.readTime}
            </p>
            <h2 className="mt-2.25 text-2xl font-ui leading-[90%] text-[#181B21] font-semibold">
              {article.title}
            </h2>
          </div>
        </div>
      ))}
    </>
  );
}
