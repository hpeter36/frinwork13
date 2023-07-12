"use client";

import React, { useState } from "react";

import RadioButton from "./RadioButton";

type RadioButtonGroupInputProps = {
  groupName: string;
  defaultCheckedValue?: string;
  labels: string[];
  values: string[];
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    selectedId: string
  ) => void;
};

const RadioButtonGroup = (props: RadioButtonGroupInputProps) => {
  const { groupName, defaultCheckedValue, labels, values, onChange } = props;
  const [selectedValue, setSelectedValue] = useState(defaultCheckedValue);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
    onChange(event, event.target.value);
  };

  return labels.map((label, i) => {
    return (
      <RadioButton
        key={i}
        label={label}
        value={values[i]}
        groupName={groupName}
        checked={selectedValue === values[i]}
        onChange={handleRadioChange}
      />
    );
  });
};

export default RadioButtonGroup;
