"use client";
//NOTE: MUI doesn't yet put "use client" in their component there is need for a wrapper
//See: https://beta.nextjs.org/docs/rendering/server-and-client-components#third-party-packages

import Button, { ButtonProps } from "@mui/material/Button";

interface MyButtonProps extends ButtonProps {
	// Additional custom props if needed
  }

export default function MuiButton({ children, ...props }: MyButtonProps){
	//const { children}= props;
	return (
		<Button {...props}>{children}</Button>
	);
}