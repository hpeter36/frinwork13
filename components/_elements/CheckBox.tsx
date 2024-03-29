'use client'

import React, { useState, useEffect } from "react";

import { stringToId, stringToLowerCaseWithoutWhitespace } from "@/utils/helpers";

type CheckBoxTwStyle = {
  container: string;
  input: string;
  label: string;
}

type CheckBoxInputProps = {
	label: string
	checked?: boolean
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
	twStyle?: CheckBoxTwStyle
}

const CheckBox = (props: CheckBoxInputProps) => {

 const { label, checked, onChange } = props
 const id_html = stringToLowerCaseWithoutWhitespace(label);

 let {twStyle} = props
 if (!twStyle)
  twStyle = {container: '', input: '', label: ''}

 const [_twStyle, setTwStyle] = useState<CheckBoxTwStyle>({container: '', input: '', label: ''});

    // to avoid hydration issues
	useEffect(() => {
		setTwStyle(twStyle!)
	  },[])

  return (
    <div className={`flex items-center ${_twStyle.container}`}>
      <input checked={checked} onChange={onChange}
        id={id_html}
        type="checkbox"
        value={stringToLowerCaseWithoutWhitespace(label)}
        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${_twStyle.input}`}
      />
      <label
        htmlFor={id_html}
        className={`ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 ${_twStyle.label}`}
      >
        {label}
      </label>
    </div>
  );
};

export default CheckBox;
