import { NextResponse } from "next/server";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";

export async function GET(request: Request) {
  try {
    // get input
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");

    // input validation
    if (!ticker) {
      return NextResponse.json(
        {
          data: "No 'ticker' is specified!",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM
            ],
        },
        { status: 400 }
      );
    }

    // construct uri
    let uriStr = `http://${process.env.DATA_SERVER}:${process.env.DATA_SERVER_PORT}/api/v1/resources/get_company_meta?ticker=${ticker}`;
    const respData = await fetch(uriStr).then((res) => res.json());

    // return data
    return NextResponse.json(
      {
        data: respData,
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
