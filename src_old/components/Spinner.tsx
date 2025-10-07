import CircularProgress from "@mui/material/CircularProgress";
import React from "react";

function Spinner({ isLoading, ...props }: any) {
  return (isLoading as boolean) ? (
    <CircularProgress color="primary" style={props.style} />
  ) : (
    <></>
  );
}

export default Spinner;
