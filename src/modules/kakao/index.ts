import type { NormalizedWebtoon } from '@/database/entity';
import {
  KAKAO_PLACEMENT,
  getTicketInfo,
  getWebtoonListByPlacement,
  getWebtoonProfile,
} from './functions/kakaoApi';
import {
  TempNormalizedWebtoon,
  normalizeWebtoonList,
} from './functions/normalizeWebtoon';

const WEEKDAY_LIST = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

const PQueue = require('p-queue').default;

export const getKakaoWebtoonList = async () => {
  const originalWeeklyWebtoonsList = await Promise.all(
    WEEKDAY_LIST.map(async (weekday) => {
      const { data } = await getWebtoonListByPlacement(
        KAKAO_PLACEMENT[weekday],
      );

      return normalizeWebtoonList({
        response: data,
        isEnd: false,
        updateDay: weekday,
      });
    }),
  );

  const tempNormalizedWeeklyWebtoonMap = new Map<
    number,
    TempNormalizedWebtoon
  >();

  originalWeeklyWebtoonsList.forEach((webtoonList) =>
    webtoonList.forEach((webtoon) => {
      const { id, updateDays } = webtoon;

      const duplicatedWebtoon = tempNormalizedWeeklyWebtoonMap.get(id);

      //! 요일별 중복 웹툰 제거
      if (duplicatedWebtoon)
        return duplicatedWebtoon.updateDays.push(...updateDays);

      return tempNormalizedWeeklyWebtoonMap.set(id, webtoon);
    }),
  );

  //! 완결 웹툰은 따로 요청후 정형화 후 요일별 웹툰과 합쳐줌
  const tempNormalizedWebtoonList = await getWebtoonListByPlacement(
    KAKAO_PLACEMENT.COMPLETE,
  )
    .then(({ data }) =>
      normalizeWebtoonList({
        isEnd: true,
        response: data,
      }),
    )
    .then((finishedWebtoon) => {
      const weeklyWebtoonList = Array.from(
        tempNormalizedWeeklyWebtoonMap.values(),
      );

      return [...weeklyWebtoonList, ...finishedWebtoon];
    });

  const queue = new PQueue({
    concurrency: 100,
    interval: 1000,
    intervalCap: 100,
    carryoverConcurrencyCount: true,
  });

  const normalizedWebtoonList: NormalizedWebtoon[] = await Promise.all(
    tempNormalizedWebtoonList.map(
      ({ freeWaitHour, id: kakaoWebtoonId, ...webtoon }) =>
        queue.add(async () => {
          if (kakaoWebtoonId == 27) {
            console.log('??');
          }
          const id = `kakao_${kakaoWebtoonId}`;

          const { data: profileData } = (
            await getWebtoonProfile(kakaoWebtoonId)
          ).data;

          if (freeWaitHour !== undefined)
            return {
              id,
              ...webtoon,
              freeWaitHour,
              isFree: true,
              tags: profileData.seoKeywords,
              synopsis: profileData.synopsis,
            };

          const { data } = await getTicketInfo(kakaoWebtoonId);

          const waitInterval = data.data.waitForFree?.interval.replace(
            /\D/g,
            '',
          );

          return {
            ...webtoon,
            id,
            isFree: !!waitInterval,
            freeWaitHour: waitInterval ? Number(waitInterval) : null,
            tags: profileData.seoKeywords,
            synopsis: profileData.synopsis,
          };
        }),
    ),
  );

  return normalizedWebtoonList;
};
