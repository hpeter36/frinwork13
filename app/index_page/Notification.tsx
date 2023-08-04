"use client"

import React, {useEffect} from "react";
import Button from '@mui/material/Button';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from '@mui/material/Typography';
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from '@mui/material/DialogActions';

const Notification = () => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
	setOpen(true)
  }, [])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Dear Visitor
      </DialogTitle>
      <DialogContent>
        <Typography  id="alert-dialog-description" gutterBottom>
         This is a investment advisor service, specialized to US stocks, it's progress is in developement. 
        </Typography >
		<Typography gutterBottom>
		Technically, the used tech stack for frontend is Next JS 13(newest), React 18, Material UI for most React components.
		 The backend is served by a Flask server(python), MariaDb is used for database and Docker simplifies the service deployment, operation and mainteance.
		 The bubble chart on this page is build with d3 js(the bubble layout), the animation is made with low level webgl(regl library), the pricing chart(available after login) is built entirely with d3 js(svg).
		</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Notification;
