import fs from 'fs';

import { NextResponse } from "next/server";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import {
  RequestCalcFairPriceCommon,
  RequestCalcFairPriceError,
} from "../../utils/pricingChart";

export async function GET(request: Request) {
  try {
    // get input
    const { searchParams } = new URL(request.url);
    const fairp_type = searchParams.get("fairp_type");
    const ticker = searchParams.get("ticker");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    // input validation
    if (!fairp_type) {
      return NextResponse.json(
        {
          data: "missing fair price type(fairp_type) parameter",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM
            ],
        },
        { status: 400 }
      );
    }

    if (
      !["sales", "fcf", "earnings", "ebitda", "bookval"].includes(fairp_type)
    ) {
      return NextResponse.json(
        {
          data: "Invalid fair price type(fairp_type) parameter",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_INVALID_PARAM
            ],
        },
        { status: 400 }
      );
    }

    if (!ticker) {
      return NextResponse.json(
        {
          data: "missing ticker parameter",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM
            ],
        },
        { status: 400 }
      );
    }

    if (!start_date) {
      return NextResponse.json(
        {
          data: "missing start_date parameter",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM
            ],
        },
        { status: 400 }
      );
    }

    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormatRegex.test(start_date)) {
      return NextResponse.json(
        {
          data: "Invalid start_date format, YYYY-MM-DD should be used",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_INVALID_PARAM
            ],
        },
        { status: 400 }
      );
    }

    if (!end_date) {
      return NextResponse.json(
        {
          data: "missing end_date parameter",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM
            ],
        },
        { status: 400 }
      );
    }

    if (!dateFormatRegex.test(end_date)) {
      return NextResponse.json(
        {
          data: "Invalid end_date format, YYYY-MM-DD should be used",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_INVALID_PARAM
            ],
        },
        { status: 400 }
      );
    }

    // fetch data
    const resp = await fetch(
      `http://${process.env.DATA_SERVER}:${process.env.DATA_SERVER_PORT}/api/v1/resources/calc_fair_price_${fairp_type}?ticker=${ticker}&start_date=${start_date}&end_date=${end_date}`
    );
    let data: RequestCalcFairPriceCommon | RequestCalcFairPriceError =
    await resp.json();
    data = await data;

    // !!! TEST ONLY
    // const fsResp = fs.readFileSync('public/assets/pricingChart/test.json', 'utf8');
    // const data: RequestCalcFairPriceCommon | RequestCalcFairPriceError = JSON.parse(fsResp);
    // return NextResponse.json(data, { status: 200 });

    // return data
    return NextResponse.json(
      {
        data: data,
        status: EnumApiResponseStatus[EnumApiResponseStatus.STATUS_OK],
      },
      { status: 200 }
    );
  } catch (e) {
    // error handling
    if (typeof e === "string")
      // itt logolni kell db-be !!!
      return NextResponse.json(
        {
          data: e,
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_SERVER_ERROR
            ],
        },
        { status: 500 }
      );
    else if (e instanceof Error)
      return NextResponse.json(
        {
          data: e.message,
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_SERVER_ERROR
            ],
        },
        { status: 500 }
      );
  }
}
