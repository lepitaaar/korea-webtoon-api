import { NormalizedWebtoon } from '@/database/entity';
import { Author } from '@/database/author.entity';
import { AppDataSource } from '@/database/datasource';
import {
  getDailyPlusWebtoonList,
  getFinishedWebtoonList,
  getweeklyWebtoonList,
} from './functions/naverApi';
import { normalizeWebtoon } from './functions/normalizeWebtoon';
import { getWebtoonDetail } from './functions/naverApi';

const PQueue = require('p-queue').default;

enum Weekday {
  MONDAY = 'MON',
  TUESDAY = 'TUE',
  WEDNESDAY = 'WED',
  THURSDAY = 'THU',
  FRIDAY = 'FRI',
  SATURDAY = 'SAT',
  SUNDAY = 'SUN',
}

export const getNaverWebtoonList = async () => {
  const weeklyWebtoonMap = new Map<number, NormalizedWebtoon>();

  const {
    data: { titleListMap: weeklyWebtoonTitleMap },
  } = await getweeklyWebtoonList();

  const queue = new PQueue({
    concurrency: 50,
    interval: 1000,
    intervalCap: 50,
    carryoverConcurrencyCount: true,
  });

  const processAuthors = async (authorNames: string[]): Promise<Author[]> => {
    const authorRepository = AppDataSource.getRepository(Author);
    const authors: Author[] = [];
    for (const name of authorNames) {
      let author = await authorRepository.findOne({ where: { name } });
      if (!author) {
        author = authorRepository.create({ name });
        await authorRepository.save(author);
      }
      authors.push(author);
    }
    return authors;
  };

  for (const weekday in weeklyWebtoonTitleMap) {
    const _weekday = weekday as keyof typeof weeklyWebtoonTitleMap;
    const weekdayWebtoonList = weeklyWebtoonTitleMap[_weekday];

    for (const { titleId, ...webtoon } of weekdayWebtoonList) {
      const duplicatedWebtoon = weeklyWebtoonMap.get(titleId);

      //! 각 요일에 중복된 웹툰이 노출될수 있음
      if (duplicatedWebtoon) {
        duplicatedWebtoon.updateDays?.push(Weekday[_weekday]);
        continue;
      }

      const updateDay = Weekday[_weekday];

      const extra = await queue.add(() => getWebtoonDetail(titleId));

      const normalized = normalizeWebtoon({
        ...webtoon,
        titleId,
        ...extra,
      });
      const authors = await processAuthors(normalized.authors);

      weeklyWebtoonMap.set(titleId, {
        ...normalized,
        authors,
        updateDays: [updateDay],
      });
    }
  }

  const weeklyWebtoonList = Array.from(weeklyWebtoonMap.values());

  const {
    data: { titleList: dailyPlusWebtoonTitleList },
  } = await getDailyPlusWebtoonList();

  const dailyPlusWebtoonList: NormalizedWebtoon[] = await Promise.all(
    dailyPlusWebtoonTitleList.map(async (webtoon) => {
      const extra = await queue.add(() => getWebtoonDetail(webtoon.titleId));
      const normalized = normalizeWebtoon({ ...webtoon, ...extra });
      const authors = await processAuthors(normalized.authors);
      return {
        ...normalized,
        authors,
        updateDays: [],
      };
    }),
  );

  const finishedWebtoonList: NormalizedWebtoon[] = [];

  for (let page = 1, totalPages = 2; page <= totalPages; page++) {
    const {
      data: { pageInfo, titleList },
    } = await getFinishedWebtoonList(page);

    totalPages = pageInfo.totalPages;

    const finished = await Promise.all(
      titleList.map(async (webtoon) => {
        const extra = await queue.add(() => getWebtoonDetail(webtoon.titleId));
        const normalized = normalizeWebtoon({ ...webtoon, ...extra });
        const authors = await processAuthors(normalized.authors);
        return {
          ...normalized,
          authors,
          updateDays: [],
        };
      }),
    );
    finishedWebtoonList.push(...finished);
  }

  return weeklyWebtoonList.concat(dailyPlusWebtoonList, finishedWebtoonList);
};
