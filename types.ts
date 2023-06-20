export enum EnumSubscription {
  PREMIUM = 0,
  BASIC,
  FREE,
}

export enum EnumApiResponseStatus {
  STATUS_ERROR_MISSING_PARAM,
  STATUS_ERROR_INVALID_PARAM,
  STATUS_ERROR_SERVER_ERROR,
  STATUS_ERROR_NOT_AUTHENTICATED,
  STATUS_OK,
}

export type ApiResponse = {
  data: Object;
  status: string;
};

export type BubbleData = {
  id: number;
  colorId?: Float32Array;
  cik: string;
  company_website: string;
  country: string;
  description: string;
  exchange: string;
  exchange_id: string;
  first_fin_fq_date: string;
  industry: string;
  industry_id: string;
  last_fin_fq_date: string;
  m_cap: number;
  name: string;
  sector: string;
  sector_id: string;
  symbol: string;
};

export type BubbleDataJsonMeta = {
  exchanges: string[];
  industries: string[];
  sectors: string[];
};

export type BubbleDataJson = {
  data: BubbleData[];
  meta: BubbleDataJsonMeta;
};

export type CompanyMetaData = {
  ticker: string;
  name: string;
  country: string;
  exchange: string;
  industry: string;
  sector: string;
  description: string;
};
