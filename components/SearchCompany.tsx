'use client'

import { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useDebounce } from "react-use";

import { ApiResponse, CompanyMetaData } from "../types";

type SearchCompanyProps = {
  callbackSetCompMeta: (symbol: CompanyMetaData) => void;
};

const SearchCompany = ({ callbackSetCompMeta }: SearchCompanyProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedComps, setSearchedComps] = useState<string[]>([]);
  const [selectedComp, setSelectedComp] = useState<string | null>(null);

  useDebounce(
    async () => {
      // time elapsed since last keystroke
      if (searchTerm) {
        // get search res
        const respData: ApiResponse = await fetch(
          `/api/getSearchComp?term=${searchTerm}`
        ).then((resp) => resp.json());

        // set state to show search res companies
        setSearchedComps(respData.data as string[]);
      }
      // empty search
      else setSearchedComps(["Search for a company"]);
    },
    500,
    [searchTerm]
  );

  return (
    <Autocomplete
      disablePortal
      id="combo-search-comp"
      sx={{ width: 300 }}
      options={searchedComps}
      inputValue={searchTerm}
      onInputChange={(e, newVal) => {
        setSearchTerm(newVal);
      }}
      value={selectedComp}
      onChange={async (e, newVal: string | null) => {
        // value selected
        setSelectedComp(newVal);
        if (newVal && newVal?.indexOf(":") != -1) {
          const symbol = newVal?.split(":")[0];

          console.log(symbol);

          // get company meta
          const respData: ApiResponse = await fetch(
            `/api/getCompMeta?ticker=${symbol}`
          ).then((resp) => resp.json());

          // increment searched company count !!!

          const compMeta = respData.data as CompanyMetaData;

          callbackSetCompMeta({
            ticker: compMeta.ticker,
            name: compMeta.name,
            country: compMeta.country,
            exchange: compMeta.exchange,
            industry: compMeta.industry,
            sector: compMeta.sector,
            description: compMeta.description,
          });
        }
      }}
      renderInput={(params) => <TextField {...params} label="Companies" />}
    />
  );
};

export default SearchCompany;
