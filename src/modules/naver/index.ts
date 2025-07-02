import type { NormalizedWebtoon } from '@/database/entity';
import {
  getDailyPlusWebtoonList,
  getFinishedWebtoonList,
  getweeklyWebtoonList,
} from './functions/naverApi';
import { normalizeWebtoon } from './functions/normalizeWebtoon';
import { getWebtoonDetail } from './functions/naverApi';

enum Weekday {
  MONDAY = 'MON',
  TUESDAY = 'TUE',
  WEDNESDAY = 'WED',
  THURSDAY = 'THU',
  FRIDAY = 'FRI',
  SATURDAY = 'SAT',
  SUNDAY = 'SUN',
}

const LIMIT_QUEUE = 50;
let queue = 0;

export const getNaverWebtoonList = async () => {
  const weeklyWebtoonMap = new Map<number, NormalizedWebtoon>();

  const {
    data: { titleListMap: weeklyWebtoonTitleMap },
  } = await getweeklyWebtoonList();

  for (const weekday in weeklyWebtoonTitleMap) {
    const _weekday = weekday as keyof typeof weeklyWebtoonTitleMap;
    const weekdayWebtoonList = weeklyWebtoonTitleMap[_weekday];

    for (const { titleId, ...webtoon } of weekdayWebtoonList) {
      const duplicatedWebtoon = weeklyWebtoonMap.get(titleId);

      //! 각 요일에 중복된 웹툰이 노출될수 있음
      if (duplicatedWebtoon) {
        duplicatedWebtoon.updateDays?.push(Weekday[_weekday]);
      }

      const updateDay = Weekday[_weekday];

      if (queue > LIMIT_QUEUE) {
        await new Promise<void>((resolve) =>
          setInterval(() => {
            if (queue <= LIMIT_QUEUE) resolve();
          }, 1_000),
        );
      }
      queue += 1;
      const extra = await getWebtoonDetail(titleId);
      queue -= 1;

      weeklyWebtoonMap.set(titleId, {
        ...normalizeWebtoon({
          ...webtoon,
          titleId,
          ...extra
        }),
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
      if (queue > LIMIT_QUEUE) {
        await new Promise<void>((resolve) =>
          setInterval(() => {
            if (queue <= LIMIT_QUEUE) resolve();
          }, 1_000),
        );
      }
      queue += 1;
      const extra = await getWebtoonDetail(webtoon.titleId);
      queue -= 1;
      return {
        ...normalizeWebtoon({ ...webtoon, ...extra }),
        updateDays: [],
      };
    })
  );

  const finishedWebtoonList: NormalizedWebtoon[] = [];

  for (let page = 1, totalPages = 2; page <= totalPages; page++) {
    const {
      data: { pageInfo, titleList },
    } = await getFinishedWebtoonList(page);

    totalPages = pageInfo.totalPages;

    const finished = await Promise.all(
      titleList.map(async (webtoon) => {
        if (queue > LIMIT_QUEUE) {
          await new Promise<void>((resolve) =>
            setInterval(() => {
              if (queue <= LIMIT_QUEUE) resolve();
            }, 1_000),
          );
        }
        queue += 1;
        const extra = await getWebtoonDetail(webtoon.titleId);
        queue -= 1;
        return {
          ...normalizeWebtoon({ ...webtoon, ...extra }),
          updateDays: [],
        };
      })
    );
    finishedWebtoonList.push(...finished);
  }

  return weeklyWebtoonList.concat(dailyPlusWebtoonList, finishedWebtoonList);
};