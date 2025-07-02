import axios from 'axios';
import axiosRetry from 'axios-retry';

const kakaoPageApi = axios.create({
  baseURL: 'https://bff-page.kakao.com/graphql',
  headers: {
    'Content-Type': 'application/json',
    //! User-Agent, Referer를 설정하지 않으면 403 에러 발생
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    Referer: 'https://page.kakao.com',
  },
  timeout: 30_000,
});

axiosRetry(kakaoPageApi, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 3_000,
  onRetry: (retry, _, config) => {
    console.error(`🚧 [KAKAO_PAGE] ${config.url} - retry: ${retry}`);
  },
});

export interface KakoPageStaticLandingGenreSectionItem {
  seriesId: number;

  /**
   * @description 'BadgeUpStatic' - 신규 업데이트 존재
   */
  statusBadge: 'BadgeUpStatic' | null;
}

export interface GetStaticLandingGenreSectionResponse {
  data: {
    staticLandingGenreSection: {
      isEnd: boolean;
      groups: [
        {
          items: KakoPageStaticLandingGenreSectionItem[];
        },
      ];
    };
  };
}

export const getStaticLandingGenreSection = (page: number) => {
  console.info(`⌛️ [KAKAO_PAGE] page: ${page} - 웹툰 리스트 정보 요청`);
  return kakaoPageApi.post<GetStaticLandingGenreSectionResponse>('', {
    //! GQL 스키마를 확인할 수 없어 타입을 정확하게 명시하지 못함
    query:
      '\n    query staticLandingGenreSection($sectionId: ID!, $param: StaticLandingGenreParamInput!) {\n  staticLandingGenreSection(sectionId: $sectionId, param: $param) {\n    ...Section\n  }\n}\n    \n    fragment Section on Section {\n  id\n  uid\n  type\n  title\n  ... on RecommendSection {\n    isRecommendArea\n    isRecommendedItems\n  }\n  ... on DependOnLoggedInSection {\n    loggedInTitle\n    loggedInScheme\n  }\n  ... on SchemeSection {\n    scheme\n  }\n  ... on MetaInfoTypeSection {\n    metaInfoType\n  }\n  ... on TabSection {\n    sectionMainTabList {\n      uid\n      title\n      isSelected\n      scheme\n      additionalString\n      subTabList {\n        uid\n        title\n        isSelected\n        groupId\n      }\n    }\n  }\n  ... on ThemeKeywordSection {\n    themeKeywordList {\n      uid\n      title\n      scheme\n    }\n  }\n  ... on StaticLandingDayOfWeekSection {\n    isEnd\n    totalCount\n    param {\n      categoryUid\n      businessModel {\n        name\n        param\n      }\n      subcategory {\n        name\n        param\n      }\n      dayTab {\n        name\n        param\n      }\n      page\n      size\n      screenUid\n    }\n    businessModelList {\n      name\n      param\n    }\n    subcategoryList {\n      name\n      param\n    }\n    dayTabList {\n      name\n      param\n    }\n    promotionBanner {\n      ...PromotionBannerItem\n    }\n  }\n  ... on StaticLandingTodayNewSection {\n    totalCount\n    param {\n      categoryUid\n      subcategory {\n        name\n        param\n      }\n      screenUid\n    }\n    categoryTabList {\n      name\n      param\n    }\n    subcategoryList {\n      name\n      param\n    }\n    promotionBanner {\n      ...PromotionBannerItem\n    }\n    viewType\n  }\n  ... on StaticLandingTodayUpSection {\n    isEnd\n    totalCount\n    param {\n      categoryUid\n      subcategory {\n        name\n        param\n      }\n      page\n    }\n    categoryTabList {\n      name\n      param\n    }\n    subcategoryList {\n      name\n      param\n    }\n  }\n  ... on StaticLandingRankingSection {\n    isEnd\n    rankingTime\n    totalCount\n    param {\n      categoryUid\n      subcategory {\n        name\n        param\n      }\n      rankingType {\n        name\n        param\n      }\n      page\n      screenUid\n    }\n    categoryTabList {\n      name\n      param\n    }\n    subcategoryList {\n      name\n      param\n    }\n    rankingTypeList {\n      name\n      param\n    }\n    displayAd {\n      ...DisplayAd\n    }\n    promotionBanner {\n      ...PromotionBannerItem\n    }\n    withOperationArea\n    viewType\n  }\n  ... on StaticLandingGenreSection {\n    isEnd\n    totalCount\n    param {\n      categoryUid\n      subcategory {\n        name\n        param\n      }\n      sortType {\n        name\n        param\n      }\n      page\n      isComplete\n      screenUid\n    }\n    subcategoryList {\n      name\n      param\n    }\n    sortTypeList {\n      name\n      param\n    }\n    displayAd {\n      ...DisplayAd\n    }\n    promotionBanner {\n      ...PromotionBannerItem\n    }\n  }\n  ... on StaticLandingFreeSeriesSection {\n    isEnd\n    totalCount\n    param {\n      categoryUid\n      tab {\n        name\n        param\n      }\n      page\n      screenUid\n    }\n    tabList {\n      name\n      param\n    }\n    promotionBanner {\n      ...PromotionBannerItem\n    }\n  }\n  ... on StaticLandingEventSection {\n    isEnd\n    totalCount\n    param {\n      categoryUid\n      page\n    }\n    categoryTabList {\n      name\n      param\n    }\n  }\n  ... on StaticLandingOriginalSection {\n    isEnd\n    totalCount\n    originalCount\n    param {\n      categoryUid\n      subcategory {\n        name\n        param\n      }\n      sortType {\n        name\n        param\n      }\n      isComplete\n      page\n      screenUid\n    }\n    subcategoryList {\n      name\n      param\n    }\n    sortTypeList {\n      name\n      param\n    }\n    recommendItemList {\n      ...Item\n    }\n  }\n  ... on HelixThemeSection {\n    subtitle\n    isRecommendArea\n  }\n  groups {\n    ...Group\n  }\n}\n    \n\n    fragment PromotionBannerItem on PromotionBannerItem {\n  title\n  scheme\n  leftImage\n  rightImage\n  eventLog {\n    ...EventLogFragment\n  }\n}\n    \n\n    fragment EventLogFragment on EventLog {\n  fromGraphql\n  click {\n    layer1\n    layer2\n    setnum\n    ordnum\n    copy\n    imp_id\n    imp_provider\n  }\n  eventMeta {\n    id\n    name\n    subcategory\n    category\n    series\n    provider\n    series_id\n    type\n  }\n  viewimp_contents {\n    type\n    name\n    id\n    imp_area_ordnum\n    imp_id\n    imp_provider\n    imp_type\n    layer1\n    layer2\n  }\n  customProps {\n    landing_path\n    view_type\n    helix_id\n    helix_yn\n    helix_seed\n    content_cnt\n    event_series_id\n    event_ticket_type\n    play_url\n    banner_uid\n  }\n}\n    \n\n    fragment DisplayAd on DisplayAd {\n  sectionUid\n  bannerUid\n  treviUid\n  momentUid\n}\n    \n\n    fragment Item on Item {\n  id\n  type\n  ...BannerItem\n  ...OnAirItem\n  ...CardViewItem\n  ...CleanViewItem\n  ... on DisplayAdItem {\n    displayAd {\n      ...DisplayAd\n    }\n  }\n  ...PosterViewItem\n  ...StrategyViewItem\n  ...RankingListViewItem\n  ...NormalListViewItem\n  ...MoreItem\n  ...EventBannerItem\n  ...PromotionBannerItem\n  ...LineBannerItem\n}\n    \n\n    fragment BannerItem on BannerItem {\n  bannerType\n  bannerViewType\n  thumbnail\n  videoUrl\n  badgeList\n  statusBadge\n  titleImage\n  title\n  altText\n  metaList\n  caption\n  scheme\n  seriesId\n  eventLog {\n    ...EventLogFragment\n  }\n  discountRate\n  discountRateText\n  backgroundColor\n  characterImage\n}\n    \n\n    fragment OnAirItem on OnAirItem {\n  thumbnail\n  videoUrl\n  titleImage\n  title\n  subtitleList\n  caption\n  scheme\n}\n    \n\n    fragment CardViewItem on CardViewItem {\n  title\n  altText\n  thumbnail\n  scheme\n  badgeList\n  ageGradeBadge\n  statusBadge\n  ageGrade\n  selfCensorship\n  subtitleList\n  caption\n  rank\n  rankVariation\n  isEventBanner\n  categoryType\n  discountRate\n  discountRateText\n  backgroundColor\n  isBook\n  isLegacy\n  eventLog {\n    ...EventLogFragment\n  }\n}\n    \n\n    fragment CleanViewItem on CleanViewItem {\n  id\n  type\n  showPlayerIcon\n  scheme\n  title\n  thumbnail\n  badgeList\n  ageGradeBadge\n  statusBadge\n  subtitleList\n  rank\n  ageGrade\n  selfCensorship\n  eventLog {\n    ...EventLogFragment\n  }\n  discountRate\n  discountRateText\n}\n    \n\n    fragment PosterViewItem on PosterViewItem {\n  id\n  type\n  showPlayerIcon\n  scheme\n  title\n  altText\n  thumbnail\n  badgeList\n  labelBadgeList\n  ageGradeBadge\n  statusBadge\n  subtitleList\n  rank\n  rankVariation\n  ageGrade\n  selfCensorship\n  eventLog {\n    ...EventLogFragment\n  }\n  seriesId\n  showDimmedThumbnail\n  discountRate\n  discountRateText\n}\n    \n\n    fragment StrategyViewItem on StrategyViewItem {\n  id\n  title\n  count\n  scheme\n}\n    \n\n    fragment RankingListViewItem on RankingListViewItem {\n  title\n  thumbnail\n  badgeList\n  ageGradeBadge\n  statusBadge\n  ageGrade\n  selfCensorship\n  metaList\n  descriptionList\n  scheme\n  rank\n  eventLog {\n    ...EventLogFragment\n  }\n  discountRate\n  discountRateText\n}\n    \n\n    fragment NormalListViewItem on NormalListViewItem {\n  id\n  type\n  altText\n  ticketUid\n  thumbnail\n  badgeList\n  ageGradeBadge\n  statusBadge\n  ageGrade\n  isAlaramOn\n  row1\n  row2\n  row3 {\n    id\n    metaList\n  }\n  row4\n  row5\n  scheme\n  continueScheme\n  nextProductScheme\n  continueData {\n    ...ContinueInfoFragment\n  }\n  seriesId\n  isCheckMode\n  isChecked\n  isReceived\n  isHelixGift\n  price\n  discountPrice\n  discountRate\n  discountRateText\n  showPlayerIcon\n  rank\n  isSingle\n  singleSlideType\n  ageGrade\n  selfCensorship\n  eventLog {\n    ...EventLogFragment\n  }\n  giftEventLog {\n    ...EventLogFragment\n  }\n}\n    \n\n    fragment ContinueInfoFragment on ContinueInfo {\n  title\n  isFree\n  productId\n  lastReadProductId\n  scheme\n  continueProductType\n  hasNewSingle\n  hasUnreadSingle\n}\n    \n\n    fragment MoreItem on MoreItem {\n  id\n  scheme\n  title\n}\n    \n\n    fragment EventBannerItem on EventBannerItem {\n  bannerType\n  thumbnail\n  videoUrl\n  titleImage\n  title\n  subtitleList\n  caption\n  scheme\n  eventLog {\n    ...EventLogFragment\n  }\n}\n    \n\n    fragment LineBannerItem on LineBannerItem {\n  title\n  scheme\n  subTitle\n  bgColor\n  rightImage\n  eventLog {\n    ...EventLogFragment\n  }\n}\n    \n\n    fragment Group on Group {\n  id\n  ... on ListViewGroup {\n    meta {\n      title\n      count\n    }\n  }\n  ... on CardViewGroup {\n    meta {\n      title\n      count\n    }\n  }\n  ... on PosterViewGroup {\n    meta {\n      title\n      count\n    }\n  }\n  type\n  dataKey\n  groups {\n    ...GroupInGroup\n  }\n  items {\n    ...Item\n  }\n}\n    \n\n    fragment GroupInGroup on Group {\n  id\n  type\n  dataKey\n  items {\n    ...Item\n  }\n  ... on ListViewGroup {\n    meta {\n      title\n      count\n    }\n  }\n  ... on CardViewGroup {\n    meta {\n      title\n      count\n    }\n  }\n  ... on PosterViewGroup {\n    meta {\n      title\n      count\n    }\n  }\n}\n    ',
    variables: {
      sectionId: 'static-landing-Genre-section-Layout-10-0-update-false',
      param: {
        categoryUid: 10,
        isComplete: false,
        page,
        sortType: 'update',
        subcategoryUid: '0',
      },
    },
  });
};

interface GetContentHomeOverviewResponse {
  data: {
    contentHomeOverview: {
      content: {
        bm: 'FreePreview' | 'PayWaitfree' | 'Pay';
        /**
         * @example 180
         */
        waitfreePeriodByMinute: number;
        /** 제목 */
        title: string;
        /**
         * @description 연재 요일
         * @example "월, 화, 일"
         */
        pubPeriod: string | null;
        ageGrade: 'Fifteen' | 'All' | 'Nineteen';
        /**
         * @example "권오준,ab studio"
         */
        authors: string;
        /**
         * @example 'Eng' - 완결,  'Ing' - 연재중
         */
        onIssue: 'End' | 'Ing';
        /**
         * @description 장르
         * @example 로판, 판타지
         */
        subcategory: string;
        /**
         * @example "//page-images.kakaoentcdn.com/download/resource?kid=0h4rE/hAd4IJY30B/NBtri5kBVHSArCkBBOKtf1&filename=o1"
         */
        thumbnail: string;
      };
    };
  };
}

export const getContentHomeOverview = (seriesId: number) => {
  console.info(`⌛️ [KAKAO_PAGE] seriesId: ${seriesId} - 웹툰 상세 정보 요청`);
  return kakaoPageApi.post<GetContentHomeOverviewResponse>('', {
    query:
      '\n    query contentHomeOverview($seriesId: Long!) {\n  contentHomeOverview(seriesId: $seriesId) {\n    id\n    seriesId\n    displayAd {\n      ...DisplayAd\n      ...DisplayAd\n    }\n    content {\n      ...SeriesFragment\n    }\n    displayAd {\n      ...DisplayAd\n    }\n    lastNoticeDate\n    setList {\n      ...NormalListViewItem\n    }\n    relatedSeries {\n      ...SeriesFragment\n    }\n  }\n}\n    \n    fragment DisplayAd on DisplayAd {\n  sectionUid\n  bannerUid\n  treviUid\n  momentUid\n}\n    \n\n    fragment SeriesFragment on Series {\n  id\n  seriesId\n  title\n  thumbnail\n  landThumbnail\n  categoryUid\n  category\n  categoryType\n  subcategoryUid\n  subcategory\n  badge\n  isAllFree\n  isWaitfree\n  ageGrade\n  state\n  onIssue\n  authors\n  description\n  pubPeriod\n  freeSlideCount\n  lastSlideAddedDate\n  waitfreeBlockCount\n  waitfreePeriodByMinute\n  bm\n  saleState\n  startSaleDt\n  saleMethod\n  discountRate\n  discountRateText\n  serviceProperty {\n    ...ServicePropertyFragment\n  }\n  operatorProperty {\n    ...OperatorPropertyFragment\n  }\n  assetProperty {\n    ...AssetPropertyFragment\n  }\n}\n    \n\n    fragment ServicePropertyFragment on ServiceProperty {\n  viewCount\n  readCount\n  ratingCount\n  ratingSum\n  commentCount\n  pageContinue {\n    ...ContinueInfoFragment\n  }\n  todayGift {\n    ...TodayGift\n  }\n  preview {\n    ...PreviewFragment\n    ...PreviewFragment\n  }\n  waitfreeTicket {\n    ...WaitfreeTicketFragment\n  }\n  isAlarmOn\n  isLikeOn\n  ticketCount\n  purchasedDate\n  lastViewInfo {\n    ...LastViewInfoFragment\n  }\n  purchaseInfo {\n    ...PurchaseInfoFragment\n  }\n  preview {\n    ...PreviewFragment\n  }\n  ticketInfo {\n    price\n    discountPrice\n    ticketType\n  }\n}\n    \n\n    fragment ContinueInfoFragment on ContinueInfo {\n  title\n  isFree\n  productId\n  lastReadProductId\n  scheme\n  continueProductType\n  hasNewSingle\n  hasUnreadSingle\n}\n    \n\n    fragment TodayGift on TodayGift {\n  id\n  uid\n  ticketType\n  ticketKind\n  ticketCount\n  ticketExpireAt\n  ticketExpiredText\n  isReceived\n  seriesId\n}\n    \n\n    fragment PreviewFragment on Preview {\n  item {\n    ...PreviewSingleFragment\n  }\n  nextItem {\n    ...PreviewSingleFragment\n  }\n  usingScroll\n}\n    \n\n    fragment PreviewSingleFragment on Single {\n  id\n  productId\n  seriesId\n  title\n  thumbnail\n  badge\n  isFree\n  ageGrade\n  state\n  slideType\n  lastReleasedDate\n  size\n  pageCount\n  isHidden\n  remainText\n  isWaitfreeBlocked\n  saleState\n  operatorProperty {\n    ...OperatorPropertyFragment\n  }\n  assetProperty {\n    ...AssetPropertyFragment\n  }\n}\n    \n\n    fragment OperatorPropertyFragment on OperatorProperty {\n  thumbnail\n  copy\n  helixImpId\n  isTextViewer\n  selfCensorship\n  isBook\n  cashInfo {\n    discountRate\n    setDiscountRate\n  }\n  ticketInfo {\n    price\n    discountPrice\n    ticketType\n  }\n}\n    \n\n    fragment AssetPropertyFragment on AssetProperty {\n  bannerImage\n  cardImage\n  cardTextImage\n  cleanImage\n  ipxVideo\n  bannerSet {\n    ...BannerSetFragment\n  }\n  cardSet {\n    ...CardSetFragment\n  }\n}\n    \n\n    fragment BannerSetFragment on BannerSet {\n  backgroundImage\n  backgroundColor\n  mainImage\n  titleImage\n}\n    \n\n    fragment CardSetFragment on CardSet {\n  backgroundColor\n  backgroundImage\n}\n    \n\n    fragment WaitfreeTicketFragment on WaitfreeTicket {\n  chargedPeriod\n  chargedCount\n  chargedAt\n}\n    \n\n    fragment LastViewInfoFragment on LastViewInfo {\n  isDone\n  lastViewDate\n  rate\n  spineIndex\n}\n    \n\n    fragment PurchaseInfoFragment on PurchaseInfo {\n  purchaseType\n  rentExpireDate\n  expired\n}\n    \n\n    fragment NormalListViewItem on NormalListViewItem {\n  id\n  type\n  altText\n  ticketUid\n  thumbnail\n  badgeList\n  ageGradeBadge\n  statusBadge\n  ageGrade\n  isAlaramOn\n  row1\n  row2\n  row3 {\n    id\n    metaList\n  }\n  row4\n  row5\n  scheme\n  continueScheme\n  nextProductScheme\n  continueData {\n    ...ContinueInfoFragment\n  }\n  seriesId\n  isCheckMode\n  isChecked\n  isReceived\n  isHelixGift\n  price\n  discountPrice\n  discountRate\n  discountRateText\n  showPlayerIcon\n  rank\n  isSingle\n  singleSlideType\n  ageGrade\n  selfCensorship\n  eventLog {\n    ...EventLogFragment\n  }\n  giftEventLog {\n    ...EventLogFragment\n  }\n}\n    \n\n    fragment EventLogFragment on EventLog {\n  fromGraphql\n  click {\n    layer1\n    layer2\n    setnum\n    ordnum\n    copy\n    imp_id\n    imp_provider\n  }\n  eventMeta {\n    id\n    name\n    subcategory\n    category\n    series\n    provider\n    series_id\n    type\n  }\n  viewimp_contents {\n    type\n    name\n    id\n    imp_area_ordnum\n    imp_id\n    imp_provider\n    imp_type\n    layer1\n    layer2\n  }\n  customProps {\n    landing_path\n    view_type\n    helix_id\n    helix_yn\n    helix_seed\n    content_cnt\n    event_series_id\n    event_ticket_type\n    play_url\n    banner_uid\n  }\n}\n    ',
    variables: { seriesId },
  });
};

interface GetContentHomeInfoResponse {
  data: {
    contentHomeInfo: {
      about: {
        id: string;
        themeKeywordList: {
          uid: number;
          title: string;
        }[];
        description: string;
      }
    }
  }
}

export const getContentHomeInfo = (seriesId: number) => {
  return kakaoPageApi.post<GetContentHomeInfoResponse>('', {
    query: `\n    query contentHomeInfo($seriesId: Long!) {\n  contentHomeInfo(seriesId: $seriesId) {\n    about {\n      id\n      themeKeywordList {\n        uid\n        title\n        scheme\n      }\n      description\n      screenshotList\n      authorList {\n        id\n        name\n        role\n        roleDisplayName\n      }\n      detail {\n        id\n        publisherName\n        retailPrice\n        ageGrade\n        category\n        rank\n      }\n      guideTitle\n      characterList {\n        thumbnail\n        name\n        description\n      }\n      detailInfoList {\n        title\n        info\n      }\n    }\n    recommend {\n      id\n      seriesId\n      list {\n        ...ContentRecommendGroup\n      }\n    }\n  }\n}\n    \n    fragment ContentRecommendGroup on ContentRecommendGroup {\n  id\n  impLabel\n  type\n  title\n  description\n  items {\n    id\n    type\n    ...PosterViewItem\n  }\n}\n    \n\n    fragment PosterViewItem on PosterViewItem {\n  id\n  type\n  showPlayerIcon\n  scheme\n  title\n  altText\n  thumbnail\n  badgeList\n  labelBadgeList\n  ageGradeBadge\n  statusBadge\n  subtitleList\n  rank\n  rankVariation\n  ageGrade\n  selfCensorship\n  eventLog {\n    ...EventLogFragment\n  }\n  seriesId\n  showDimmedThumbnail\n  discountRate\n  discountRateText\n}\n    \n\n    fragment EventLogFragment on EventLog {\n  fromGraphql\n  click {\n    layer1\n    layer2\n    setnum\n    ordnum\n    copy\n    imp_id\n    imp_provider\n  }\n  eventMeta {\n    id\n    name\n    subcategory\n    category\n    series\n    provider\n    series_id\n    type\n  }\n  viewimp_contents {\n    type\n    name\n    id\n    imp_area_ordnum\n    imp_id\n    imp_provider\n    imp_type\n    layer1\n    layer2\n  }\n  customProps {\n    landing_path\n    view_type\n    helix_id\n    helix_yn\n    helix_seed\n    content_cnt\n    event_series_id\n    event_ticket_type\n    play_url\n    banner_uid\n  }\n}\n    `,
    variables: {
      seriesId
    }
  })
  
}
