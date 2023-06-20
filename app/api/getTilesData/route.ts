import { NextResponse } from "next/server";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";

type BarChartData = {
	title: string;
	metric: string;
	data_bar: number[];
	data_line: number[];
  };
  
  export type ApiResponse_GetTilesData = {
	dates: string[];
	datas: BarChartData[];
  };

export async function GET(request: Request) {

	try {

	const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

      // check for user login
      // const session = await unstable_getServerSession(req, res, authOptions);
      // if (!session) {
      //   return res.status(401).json({
      //     data: "user is not authenticated",
      //     status:
      //       EnumApiResponseStatus[
      //         EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED
      //       ],
      //   });
      // }

	  // input validation
      if (!symbol) {
		return NextResponse.json(
			{
			  data: "No 'symbol' is specified!",
			  status:
				EnumApiResponseStatus[
				  EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM
				],
			},
			{ status: 400 }
		  );
      }

	  const startDate = searchParams.get("start_date");
	  const endDate = searchParams.get("end_date");

      // construct uri
      let uriStr = `http://${process.env.DATA_SERVER}:${process.env.DATA_SERVER_PORT}/api/v1/resources/get_tiles_data?symbol=${symbol}`;

      if (startDate) uriStr = `${uriStr}&start_date=${startDate}`;
      if (endDate) uriStr = `${uriStr}&end_date=${endDate}`;

      // fetch data
      const resp = await fetch(uriStr);
      let data: ApiResponse_GetTilesData = await resp.json();
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