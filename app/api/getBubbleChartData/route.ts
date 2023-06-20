import { NextResponse } from "next/server";

import {
  EnumSubscription,
  EnumApiResponseStatus,
  BubbleDataJson,
} from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sub_id = searchParams.get("sub_id");

    // get input
    const subTypeStr = EnumSubscription[+(sub_id as string)];

    // input validation
    if (!subTypeStr) {
      return NextResponse.json(
        {
          data: "Invalid subscription identifier",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_INVALID_PARAM
            ],
        },
        { status: 400 }
      );
    }

    // fetch data
	const fetchUrl = `http://${process.env.DATA_SERVER}:${process.env.DATA_SERVER_PORT}/api/v1/resources/get_subscription_comps?sub_id=${sub_id}`
	console.log(fetchUrl)
    const resp = await fetch(
      fetchUrl
    );
    let data: BubbleDataJson = await resp.json();
    data = await data;

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
