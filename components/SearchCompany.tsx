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
          `/api/getSearchComp?term=${searchTerm}`
        ).then((resp) => resp.json());

        // set state to show search res companies
        setSearchedComps(respData.data as string[]);
      }
      // empty search
      else setSearchedComps([]);

      if (isCompSelected.current)
      isCompSelected.current = false;

    },
    500,
    [searchTerm]
  );

  // search term changed event
  function onSearchInputChanged(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  // search itesm selected event
  async function onClickListElement(e: React.MouseEvent<HTMLLIElement>)
  {

    const selectedVal = e.currentTarget.children[0].textContent
    
    isCompSelected.current = true;
    setIsOpen(false)

    // valid selection
    if (selectedVal && selectedVal?.indexOf(":") != -1) {

      setSelectedComp(selectedVal)
      setSearchTerm(selectedVal)

      const symbol = selectedVal?.split(":")[0];

      // get company meta
      const respData: ApiResponse = await fetch(
        `/api/getCompMeta?ticker=${symbol}`
      ).then((resp) => resp.json());

      // increment searched company count !!!

      const compMeta = respData.data as CompanyMetaData;

    callbackSetCompMeta(compMeta);
    } 
  }

  // options={searchedComps} - találat lista
  // inputValue={searchTerm} - akt. keresés str
  // onInputChange -> setSearchTerm
  // onChange= search res kiválasztási event -> get comp meta -> set comp meta callback
  return (
    <>
      {/* search form */}
      <form>
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            value={searchTerm}
            onChange={onSearchInputChanged}
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search Mockups, Logos..."
            required
          />
          <button
            type="submit"
            className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Search
          </button>
        </div>
      </form>

      {/* search results */}
      {searchedComps.length > 0 && isOpen && (
        <div className="absolute">
          <ul className="mb-8 space-y-4 text-left text-gray-500 dark:text-gray-400 bg-slate-200">
            {searchedComps.map((companyTickerName, index) => (
              <li key={index} className="hover:bg-slate-500 hover:text-white" onClick={onClickListElement}>
                <span>{companyTickerName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default SearchCompany;
