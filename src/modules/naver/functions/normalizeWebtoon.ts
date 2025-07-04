import { NaverWebtoonTitle } from './naverApi';
import type { NormalizedWebtoon } from '@/database/entity';

export const normalizeWebtoon = ({
  titleId,
  synopsis,
  genres,
  tags,
  ...webtoon
}: NaverWebtoonTitle & {
  synopsis?: string;
  genres?: string[];
  tags?: string[];
}): Omit<NormalizedWebtoon, 'updateDays'> & {
  authors: string[];
} => {
  // Split authors by common delimiters like '/', ',', or '&'
  const authors: string[] = webtoon.author
    .split(/\s*[/,|&]\s*/)
    .filter(Boolean);
  return {
    title: webtoon.titleName,
    ageGrade: webtoon.adult ? 19 : 0,
    authors,
    isEnd: webtoon.finish,
    isFree: true,
    id: `naver_${titleId}`,
    provider: ['NAVER'],
    thumbnail: [webtoon.thumbnailUrl],
    isUpdated: webtoon.up,
    url: `https://comic.naver.com/webtoon/list?titleId=${titleId}`,
    synopsis,
    genres: genres || [],
    tags: tags || [],
  };
};
