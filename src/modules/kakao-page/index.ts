import type { NormalizedWebtoon, Provider, UpdateDay } from '@/database/entity';
import { getWebtoonList } from './functions/getWebtoonList';
import {
  getContentHomeInfo,
  getContentHomeOverview,
} from './functions/kakaoPageApi';

enum Weekday {
  월 = 'MON',
  화 = 'TUE',
  수 = 'WED',
  목 = 'THU',
  금 = 'FRI',
  토 = 'SAT',
  일 = 'SUN',
}

const LIMIT_QUEUE = 100;

export const getKakaoPageWebtoonList = async (): Promise<
  NormalizedWebtoon[]
> => {
  const webtoonList = await getWebtoonList();

  const pLimit = (await import('p-limit')).default;
  const limit = pLimit(LIMIT_QUEUE);

  return Promise.all(
    webtoonList.map(({ seriesId, ...webtoon }) =>
      limit(async () => {
        const { content } = (await getContentHomeOverview(seriesId)).data.data
          .contentHomeOverview;

        const { about } = (await getContentHomeInfo(seriesId)).data.data
          .contentHomeInfo;

        const updateDays: UpdateDay[] = [];

        Object.keys(Weekday).forEach((key) => {
          const weekdayKor = key as keyof typeof Weekday;

          if (content.pubPeriod?.includes(weekdayKor))
            updateDays.push(Weekday[weekdayKor]);
        });

        console.info(
          `⌛️ [KAKAO_PAGE] seriesId: ${seriesId} - 웹툰 상세 정보 요청 완료`,
        );

        const id = `kakopage_${seriesId}`;

        return {
          id,
          provider: 'KAKAO_PAGE' as Provider,
          title: content.title,
          url: `https://page.kakao.com/content/${seriesId}`,
          updateDays,
          thumbnail: [`https:${content.thumbnail}`],
          isUpdated: webtoon.statusBadge === 'BadgeUpStatic',
          ageGrade: {
            Nineteen: 19,
            Fifteen: 15,
            All: 0,
          }[content.ageGrade],
          freeWaitHour:
            content.bm === 'PayWaitfree'
              ? content.waitfreePeriodByMinute / 60
              : null,
          isEnd: content.onIssue === 'End',
          isFree: content.bm !== 'Pay',
          authors: content.authors.split(','),
          synopsis: about.description,
          genres: [content.subcategory],
          tags: about.themeKeywordList.map((item) => item.title),
        };
      }),
    ),
  );
};
