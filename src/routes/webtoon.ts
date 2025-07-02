import { DOMAIN, ROUTES } from '@/constants';
import { AppDataSource } from '@/database/datasource';
import { NormalizedWebtoon } from '@/database/entity';
import axios from 'axios';
import type { Response, Request } from 'express';

/**
 * @swagger
 * /webtoons/{id}:
 *   get:
 *     tags: [Webtoons]
 *     summary: ID로 웹툰 정보 조회
 *     description: 특정 ID의 웹툰 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 웹툰 ID
 *     responses:
 *       200:
 *         description: 웹툰 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 webtoon:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     provider:
 *                       type: string
 *                     updateDays:
 *                       type: array
 *                       items:
 *                         type: string
 *                     url:
 *                       type: string
 *                     thumbnail:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isEnd:
 *                       type: boolean
 *                     isFree:
 *                       type: boolean
 *                     isUpdated:
 *                       type: boolean
 *                     ageGrade:
 *                       type: integer
 *                     freeWaitHour:
 *                       type: integer
 *                     authors:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: 잘못된 ID
 *       404:
 *         description: 웹툰을 찾을 수 없음
 *       500:
 *         description: 내부 서버 오류
 */
export const getWebtoonInfo = async (req: Request, res: Response) => {
  try {
    await axios.get(`${DOMAIN}${ROUTES.HEALTH_CHECK}`);

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Invalid WebtoonID' });
    }

    const webtoonRepository = AppDataSource.getRepository(NormalizedWebtoon);

    const webtoon = await webtoonRepository.findOne({
      where: { id },
    });

    if (!webtoon) {
      return res.status(404).json({ message: 'Webtoon not found' });
    }

    return res.json(webtoon);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};