import type { NormalizedWebtoon, UpdateDay } from '@/database/entity';
import type { GetWebtoonListByPlacementResponse } from './kakaoApi';

interface NormalizeWebtoonProps {
  response: GetWebtoonListByPlacementResponse;
  isEnd: boolean;
  updateDay?: UpdateDay;
}

export interface TempNormalizedWebtoon
  extends Omit<NormalizedWebtoon, 'freeWaitHour' | 'id' | 'isFree'> {
  /**
   * @description 'undefined'는 티켓 정보를 확인후 추가
   */
  freeWaitHour: undefined | number | null;
  /**
   * @description 티켓 정보 확인 시 필요해서 추후 prefix 추가
   */
  id: number;
}

const genreMapping = new Map([
  ['rank_all', '실시간 랭킹'],
  ['rank_fantasy_drama', '판타지 드라마'],
  ['rank_romance', '로맨스'],
  ['rank_school_action_fantasy', '학원/판타지'],
  ['rank_romance_fantasy', '로맨스 판타지'],
  ['rank_action_wuxia', '액션/무협'],
  ['rank_drama', '드라마'],
  ['rank_horror_thriller', '공포/스릴러'],
  ['rank_comic_everyday_life', '코믹/일상'],
]);

//! 카카오 웹툰은 동일한 형식으로 한번에 대량의 웹툰 정보를 응답함
export const normalizeWebtoonList = ({
  response,
  isEnd,
  updateDay,
}: NormalizeWebtoonProps): TempNormalizedWebtoon[] => {
  const [
    {
      cardGroups: [{ cards }],
    },
  ] = response.data;

  return cards.map(({ content, genreFilters }) => {
    const authors = content.authors
      .filter(({ type }) => {
        switch (type) {
          case 'AUTHOR':
          case 'ILLUSTRATOR':
            return true;
          default:
            return false;
        }
      })
      .map(({ name }) => name);

    let freeWaitHour: TempNormalizedWebtoon['freeWaitHour'];

    let isUpdated = false;

    content.badges.forEach(({ title }) => {
      switch (title) {
        case 'up':
          isUpdated = true;
          break;
        case 'FREE_PUBLISHING':
          freeWaitHour = null;
          break;
        case 'WAIT_FOR_FREE':
          freeWaitHour = undefined;
          break;
        case 'WAIT_FOR_FREE_PLUS':
          freeWaitHour = 3;
          break;
      }
    });

    return {
      id: content.id,
      title: content.title,
      ageGrade: content.adult ? 19 : 0,
      url: encodeURI(
        `https://webtoon.kakao.com/content/${content.seoId}/${content.id}`,
      ),
      authors,
      freeWaitHour,
      isEnd,
      isUpdated,
      updateDays: updateDay ? [updateDay] : [],
      thumbnail: [
        `${content.featuredCharacterImageA}.png`,
        `${content.featuredCharacterImageB}.png`,
        `${content.backgroundImage}.jpg`,
      ],
      provider: 'KAKAO',
      genres: genreFilters.map((genre) => genreMapping[genre] || genre),
    };
  });
};
