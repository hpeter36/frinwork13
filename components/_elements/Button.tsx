import React from "react";

type ButtonInputProps = {
	label: string
	onClick?: () => void
}

const Button = (props: ButtonInputProps) => {

	const { label, onClick } = props

  return (
    <button
      type="button" onClick={onClick}
      className="text-white bg-terniary_c-700 hover:bg-terniary_c-800 focus:ring-4 focus:ring-terniary_c-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-terniary_c-600 dark:hover:bg-terniary_c-700 focus:outline-none dark:focus:ring-terniary_c-800"
    >
      {label}
    </button>
  );
};

export default Button;
