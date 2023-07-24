"use client";

import React, { useEffect, useState, useId } from "react";

type RadioButtonTwStyle = {
  container: string;
  input: string;
  label: string;
}

type RadioButtonInputProps = {
  groupName: string;
  label: string;
  value: string;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  twStyle?: RadioButtonTwStyle
};

const RadioButton = (props: RadioButtonInputProps) => {
  const { groupName, label, value, checked, onChange } = props;
  //const id_html = stringToLowerCaseWithoutWhitespace(label);

  let {twStyle} = props
  if (!twStyle)
    twStyle = {container: '', input: '', label: ''}

  const [_label, setLabel] = useState("");
  const [_twStyle, setTwStyle] = useState<RadioButtonTwStyle>({container: '', input: '', label: ''});
  const toBeSelectedId = useId();

  // to avoid hydration issues
  useEffect(() => {
    setLabel(label);
  }, []);

  useEffect(() => {
		setTwStyle(twStyle!)
	  },[])

  useEffect(() => {
    //bug, ha megadom a "name" propot inputon, az alapból beállítot checked state-t clearezi a UI-on
    document.querySelector(`[data-id="${toBeSelectedId}"]`).checked = checked
      ? true
      : false;
  }, [toBeSelectedId]);

  return (
    <div className={`flex items-center ${_twStyle.container}`}>
      <input
        checked={checked}
        onChange={onChange}
        id={value}
        type="radio"
        value={value}
        name={groupName}
        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${_twStyle.input}`}
        data-id={toBeSelectedId}
      />
      <label
        htmlFor={value}
        className={`ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 ${_twStyle.label}`}
      >
        {_label}
      </label>
    </div>
  );
};

export default RadioButton;
