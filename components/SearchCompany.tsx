"use client";

import { useState, useRef } from "react";
import { useDebounce } from "react-use";

import { ApiResponse, CompanyMetaData } from "../types";

type SearchCompanyProps = {
  callbackSetCompMeta: (symbol: CompanyMetaData) => void;
};

const SearchCompany = ({ callbackSetCompMeta }: SearchCompanyProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedComps, setSearchedComps] = useState<string[]>([]);
  const [selectedComp, setSelectedComp] = useState<string | null>(null);

  const isCompSelected = useRef<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // executes search request after 500ms elapsed between 2 keystrokes
  useDebounce(
    async () => {
      // time elapsed since last keystroke
      if (searchTerm && !isCompSelected.current) {
        setIsOpen(true);

        // get search res
        const respData: ApiResponse = await fetch(
          `/api/getSearchComp?term=${searchTerm}&only_with_data=False`
        ).then((resp) => resp.json());

        // set state to show search res companies
        setSearchedComps(respData.data as string[]);
      }
      // empty search
      else setSearchedComps([]);

      if (isCompSelected.current) isCompSelected.current = false;
    },
    500,
    [searchTerm]
  );

  // search term changed event
  function onSearchInputChanged(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  // search itesm selected event
  async function onClickListElement(e: React.MouseEvent<HTMLLIElement>) {
    const selectedVal = e.currentTarget.children[0].textContent;

    isCompSelected.current = true;
    setIsOpen(false);

    // valid selection
    if (selectedVal && selectedVal?.indexOf(":") != -1) {
      setSelectedComp(selectedVal);
      setSearchTerm(selectedVal);

      const symbol = selectedVal?.split(":")[0];

      // get company meta
      const respData: ApiResponse = await fetch(
        `/api/getCompMeta?ticker=${symbol}`
      ).then((resp) => resp.json());

      // increment searched company count !!!

      const compMeta = respData.data as CompanyMetaData;

      //execute custom search callback
      callbackSetCompMeta(compMeta);
    }
  }

  function clearSearch(e: React.MouseEvent<HTMLElement>) {
    setSearchTerm("");
    setIsOpen(false);
    setSearchedComps([]);
    isCompSelected.current = false;
  }

  // options={searchedComps} - találat lista
  // inputValue={searchTerm} - akt. keresés str
  // onInputChange -> setSearchTerm
  // onChange= search res kiválasztási event -> get comp meta -> set comp meta callback
  return (
    <div className="relative mt-2">
      {/* search form */}
      <div className="relative mb-3">
        <input
          type="search"
          onChange={onSearchInputChanged}
          className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
          id="exampleSearch"
          placeholder="Search for companies"
        />
        {/* {searchTerm !== "" && (
          <button
            type="submit"
            className="absolute right-2.5 bottom-2.5 bg-gray-50 focus:outline-none px-4 py-2 cursor-pointer"
            onClick={clearSearch}
          >
            <svg
              className="w-6 h-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        )} */}
      </div>

      {/* search results */}
      {searchedComps.length > 0 && isOpen && (
        <div className="absolute">
          <ul className="min-w-[500px] mb-8 space-y-4 text-left text-gray-500 dark:text-gray-400 bg-slate-200">
            {searchedComps.map((companyTickerName, index) => (
              <li
                key={index}
                className="hover:bg-slate-500 hover:text-white"
                onClick={onClickListElement}
              >
                <span>{companyTickerName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchCompany;
