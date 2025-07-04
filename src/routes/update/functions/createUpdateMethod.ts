import { AppDataSource } from '@/database/datasource';
import {
  DataInfo,
  type NormalizedWebtoon,
  Provider,
  NaverWebtoon,
  KakaoWebtoon,
  KakaoPageWebtoon,
} from '@/database/entity';
import { Request, Response } from 'express';

interface CreateUpdateMethodProps {
  provider: Provider;
  webtoonCrawler: () => Promise<NormalizedWebtoon[]>;
}

const SIX_HOURS = 21_600_000;
const BATCH_SIZE = 100;

export const createUpdateMethod =
  ({ provider, webtoonCrawler }: CreateUpdateMethodProps) =>
  async (_: Request, res: Response) => {
    const dataInfoRepository = AppDataSource.getRepository(DataInfo);

    const dataInfo = await dataInfoRepository.findOneBy({
      provider,
    });

    const updateStartAt =
      dataInfo?.updateStartAt && new Date(dataInfo.updateStartAt);

    const isOld = updateStartAt
      ? new Date().getTime() - updateStartAt.getTime() > SIX_HOURS
      : true;

    const updatingDataInfo = {
      ...dataInfo,
      provider,
      updateStartAt: new Date(),
      updateEndAt: null,
    };

    await dataInfoRepository.save(updatingDataInfo);

    (async () => {
      const connection = AppDataSource.createQueryRunner();
      await connection.startTransaction();

      try {
        console.log(`🚀 [${provider}] 업데이트 시작`);
        console.time(`${provider}-update`);

        const webtoonList = await webtoonCrawler();

        const processedWebtoons = webtoonList;

        const EntityTarget = {
          NAVER: NaverWebtoon,
          KAKAO: KakaoWebtoon,
          KAKAO_PAGE: KakaoPageWebtoon,
        }[provider];

        for (let i = 0; i < processedWebtoons.length; i += BATCH_SIZE) {
          console.log(`🔍 [${provider}] ${i + 1} ~ ${i + BATCH_SIZE} 업데이트`);
          const batch = processedWebtoons.slice(i, i + BATCH_SIZE);
          await connection.manager.save(EntityTarget, batch);
        }

        await dataInfoRepository.save({
          ...updatingDataInfo,
          isHealthy: true,
          updateEndAt: new Date(),
        });

        await connection.commitTransaction();

        console.log(`✅ [${provider}] 업데이트 완료`);
        console.timeEnd(`${provider}-update`);
      } catch (err) {
        await connection.rollbackTransaction();
        await dataInfoRepository.save({
          ...updatingDataInfo,
          isHealthy: false,
          updateEndAt: new Date(),
        });
        console.error(`🚧 [${provider}] 업데이트 중 오류 발생`);
        console.error(String(err));
      } finally {
        await connection.release();
      }
    })();

    return res.json({
      ...updatingDataInfo,
      updateRunningTime:
        (new Date().getTime() - updatingDataInfo.updateStartAt.getTime()) /
        1_000,
    });
  };
